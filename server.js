import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import {
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getAllActivity,
  logActivity,
  getStats,
  authenticateUser,
  getAllUsers,
  getAllWorkItems,
  getWorkItemById,
  createWorkItem,
  updateWorkItem,
  addWorkUpdateLog,
  deleteWorkItem,
  getWorkStats
} from './db.js';
import { sendTicketNotificationEmail } from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global crash protection for Windows file-locking race conditions during WhatsApp logouts
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'EBUSY' || err.message?.includes('EBUSY') || err.message?.includes('unlink'))) {
    console.warn('[Server Notice] Handled background file-lock warning:', err.message);
  } else {
    console.error('[Server Error] Uncaught Exception:', err);
  }
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Server Notice] Handled background promise rejection:', reason?.message || reason);
});

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

function getLocalLANIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Auth Endpoint (Login strictly using credentials provided by IT team)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and Password are required' });
  }

  const result = authenticateUser(username, password);
  if (!result.success) {
    return res.status(401).json(result);
  }

  res.json({ success: true, message: 'Login successful', user: result.user });
});

// Ticket API Routes
app.get('/api/tickets', (req, res) => {
  let tickets = getAllTickets();
  const { status, priority, category, search } = req.query;

  if (status && status !== 'All') {
    tickets = tickets.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  if (priority && priority !== 'All') {
    tickets = tickets.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
  }

  if (category && category !== 'All') {
    tickets = tickets.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    tickets = tickets.filter(t => 
      t.id.toLowerCase().includes(s) ||
      t.title.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.requesterName.toLowerCase().includes(s) ||
      t.department.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, count: tickets.length, data: tickets });
});

app.get('/api/tickets/my', (req, res) => {
  const { email, name } = req.query;
  const userTickets = getUserTickets(email, name);
  res.json({ success: true, count: userTickets.length, data: userTickets });
});

app.get('/api/tickets/:id', (req, res) => {
  const ticket = getTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  res.json({ success: true, data: ticket });
});

app.post('/api/tickets', async (req, res) => {
  const { title, description, category, priority, requesterName, department, email } = req.body;

  const newTicket = createTicket({
    title: (title || '').trim() || 'General Ticket / Issue',
    description: (description || '').trim(),
    category: category || 'General IT Doubt',
    priority: priority || 'Medium',
    requesterName: (requesterName || '').trim() || 'Anonymous User',
    department: department || 'General',
    email: (email || '').trim()
  });

  // Asynchronously send email notification to User, Department HOD, and IT HOD
  sendTicketNotificationEmail(newTicket).catch(err => {
    console.error('[Server] Error dispatching email notification:', err);
  });

  res.status(201).json({ success: true, message: 'Ticket created successfully', data: newTicket });
});

app.patch('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const actor = req.body.actor || 'Support Agent';

  delete updates.actor;

  const updated = updateTicket(id, updates, actor);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  res.json({ success: true, message: 'Ticket updated successfully', data: updated });
});

app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const actor = req.query.actor || 'Admin User';

  const deleted = deleteTicket(id, actor);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  res.json({ success: true, message: 'Ticket deleted successfully' });
});

app.get('/api/activity', (req, res) => {
  const activity = getAllActivity();
  res.json({ success: true, count: activity.length, data: activity });
});

app.post('/api/activity/log', (req, res) => {
  const { ticketId, action, actor, details } = req.body;
  const log = logActivity({
    ticketId: ticketId || 'SYSTEM',
    action: action || 'USER_ACTION',
    actor: actor || 'User',
    details: details || 'Performed system operation'
  });
  res.json({ success: true, data: log });
});

app.get('/api/stats', (req, res) => {
  const stats = getStats();
  res.json({ success: true, data: stats });
});

// Work Tracker & Work Updater API Routes
app.get('/api/work-items', (req, res) => {
  let items = getAllWorkItems();
  const { status, category, priority, search } = req.query;

  if (status && status !== 'All') {
    items = items.filter(w => w.status.toLowerCase() === status.toLowerCase());
  }

  if (category && category !== 'All') {
    items = items.filter(w => w.category.toLowerCase() === category.toLowerCase());
  }

  if (priority && priority !== 'All') {
    items = items.filter(w => w.priority.toLowerCase() === priority.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(w => 
      w.id.toLowerCase().includes(s) ||
      w.title.toLowerCase().includes(s) ||
      w.description.toLowerCase().includes(s) ||
      w.assignedTo.toLowerCase().includes(s) ||
      (w.linkedTicketId && w.linkedTicketId.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, count: items.length, data: items });
});

app.get('/api/work-items/stats', (req, res) => {
  const stats = getWorkStats();
  res.json({ success: true, data: stats });
});

app.get('/api/work-items/:id', (req, res) => {
  const item = getWorkItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Work item not found' });
  }
  res.json({ success: true, data: item });
});

app.post('/api/work-items', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required for work item' });
  }

  const newItem = createWorkItem(req.body);
  res.status(201).json({ success: true, message: 'Work item created successfully', data: newItem });
});

app.patch('/api/work-items/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const actor = req.body.actor || 'Support Agent';

  delete updates.actor;

  const updated = updateWorkItem(id, updates, actor);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Work item not found' });
  }

  res.json({ success: true, message: 'Work item updated successfully', data: updated });
});

app.post('/api/work-items/:id/updates', (req, res) => {
  const { id } = req.params;
  const { notes, progress, status, hoursSpent, actor = 'Support Agent' } = req.body;

  const updated = addWorkUpdateLog(id, { notes, progress, status, hoursSpent }, actor);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Work item not found' });
  }

  res.json({ success: true, message: 'Work update logged successfully', data: updated });
});

app.delete('/api/work-items/:id', (req, res) => {
  const { id } = req.params;
  const actor = req.query.actor || 'Admin User';

  const deleted = deleteWorkItem(id, actor);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Work item not found' });
  }

  res.json({ success: true, message: 'Work item deleted successfully' });
});

app.get('/api/health', (req, res) => {
  const lanIP = getLocalLANIP();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    lanIP,
    lanURL: `http://${lanIP}:${PORT}`
  });
});

// Serve static compiled frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  const lanIP = getLocalLANIP();
  const hostname = os.hostname();

  console.log(`=============================================================`);
  console.log(` 🎧 SIHPL HELPDESK SERVER RUNNING FOR COMPANY LAN (50+ PCS)`);
  console.log(`-------------------------------------------------------------`);
  console.log(` 📍 Localhost Access (This PC) : http://localhost:${PORT}`);
  console.log(` 🌐 Company LAN Access (Other PCs): http://${lanIP}:${PORT}`);
  console.log(` 💻 Computer Hostname Link      : http://${hostname}:${PORT}`);
  console.log(`=============================================================`);
});
