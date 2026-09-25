import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function formatDate(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Company IT Admin: Admin.rk
const defaultUsers = [
  {
    id: "USR-ADMIN",
    username: "Admin.rk",
    password: "admin@rk06",
    name: "Mr. Ramesh (IT Admin)",
    role: "admin",
    email: "rk.ramesh@sujanindustries.com",
    department: "IT"
  }
];

const defaultTickets = [
  {
    id: "TK-1001",
    title: "Cannot connect to office Wi-Fi network (Secure-Corporate)",
    description: "My laptop disconnects every 10 minutes when connected to the 5GHz Wi-Fi network on the 3rd floor.",
    category: "Network",
    priority: "High",
    status: "Resolved",
    requesterName: "Sarah Jenkins",
    department: "Marketing",
    email: "sarah.j@company.com",
    assignedTo: "Mr. Ramesh (HOD/Manager)",
    resolutionNotes: "Re-configured wireless access point channel bandwidth and reset network credentials for user laptop.",
    createdAt: "2026-09-01 09:15:22",
    updatedAt: "2026-09-01 11:45:00",
    resolvedAt: "2026-09-01 11:45:00"
  },
  {
    id: "TK-1002",
    title: "Need VPN access set up for remote work approval",
    description: "Requesting VPN certificate configuration for official travel next week.",
    category: "Access & Security",
    priority: "Medium",
    status: "Resolved",
    requesterName: "Alex Rivera",
    department: "Sales",
    email: "alex.r@company.com",
    assignedTo: "Mr. Selvin (Junior)",
    resolutionNotes: "Generated 2FA token key and provisioned OpenVPN config file for remote workstation.",
    createdAt: "2026-09-01 10:30:10",
    updatedAt: "2026-09-01 14:20:15",
    resolvedAt: "2026-09-01 14:20:15"
  },
  {
    id: "TK-1003",
    title: "Dual monitor display flickering on workstation",
    description: "Secondary monitor connected via DisplayPort flashes black intermittently during video calls.",
    category: "Hardware",
    priority: "Low",
    status: "In Progress",
    requesterName: "Michael Chang",
    department: "Engineering",
    email: "m.chang@company.com",
    assignedTo: "Mr. Selvin (Junior)",
    resolutionNotes: "",
    createdAt: "2026-09-02 08:45:00",
    updatedAt: "2026-09-02 10:15:00",
    resolvedAt: null
  },
  {
    id: "TK-1004",
    title: "Outlook Desktop application crashing on startup",
    description: "Getting 'Outlook encountered a problem and needs to close' error code 0xc0000005 whenever PST file loads.",
    category: "Software",
    priority: "Urgent",
    status: "Open",
    requesterName: "Elena Rostova",
    department: "Finance",
    email: "elena.r@company.com",
    assignedTo: "Unassigned",
    resolutionNotes: "",
    createdAt: "2026-09-02 11:10:05",
    updatedAt: "2026-09-02 11:10:05",
    resolvedAt: null
  },
  {
    id: "TK-1005",
    title: "Password reset for ERP Accounting Portal",
    description: "Account locked after 3 incorrect login attempts following mandatory 90-day password policy renewal.",
    category: "Access & Security",
    priority: "Medium",
    status: "Resolved",
    requesterName: "Standard User",
    department: "Finance",
    email: "user@company.com",
    assignedTo: "Mr. Ramesh (HOD/Manager)",
    resolutionNotes: "Temporary password link dispatched to verified phone number. User successfully reset credentials.",
    createdAt: "2026-09-02 13:00:40",
    updatedAt: "2026-09-02 13:25:00",
    resolvedAt: "2026-09-02 13:25:00"
  },
  {
    id: "TK-1006",
    title: "Request for Python development environment setup",
    description: "New data analyst needs admin privilege escalation to install Anaconda and Git.",
    category: "Software",
    priority: "Low",
    status: "Open",
    requesterName: "Priya Sharma",
    department: "Analytics",
    email: "priya.s@company.com",
    assignedTo: "Unassigned",
    resolutionNotes: "",
    createdAt: "2026-09-02 14:05:18",
    updatedAt: "2026-09-02 14:05:18",
    resolvedAt: null
  }
];

const defaultActivity = [
  {
    id: "ACT-1001",
    timestamp: "2026-09-01 09:15:22",
    ticketId: "TK-1001",
    action: "TICKET_CREATED",
    actor: "Sarah Jenkins",
    details: "Created ticket 'Cannot connect to office Wi-Fi network (Secure-Corporate)'"
  },
  {
    id: "ACT-1002",
    timestamp: "2026-09-01 09:30:00",
    ticketId: "TK-1001",
    action: "AGENT_ASSIGNED",
    actor: "System",
    details: "Assigned ticket TK-1001 to Mr. Ramesh (HOD/Manager)"
  },
  {
    id: "ACT-1003",
    timestamp: "2026-09-01 11:45:00",
    ticketId: "TK-1001",
    action: "TICKET_RESOLVED",
    actor: "Mr. Ramesh (HOD/Manager)",
    details: "Marked TK-1001 as Resolved. Resolution: Re-configured wireless access point channel bandwidth."
  },
  {
    id: "ACT-1004",
    timestamp: "2026-09-01 10:30:10",
    ticketId: "TK-1002",
    action: "TICKET_CREATED",
    actor: "Alex Rivera",
    details: "Created ticket 'Need VPN access set up for remote work approval'"
  },
  {
    id: "ACT-1005",
    timestamp: "2026-09-01 14:20:15",
    ticketId: "TK-1002",
    action: "TICKET_RESOLVED",
    actor: "Mr. Selvin (Junior)",
    details: "Marked TK-1002 as Resolved. Resolution: Provisioned OpenVPN config file."
  },
  {
    id: "ACT-1006",
    timestamp: "2026-09-02 08:45:00",
    ticketId: "TK-1003",
    action: "TICKET_CREATED",
    actor: "Michael Chang",
    details: "Created ticket 'Dual monitor display flickering on workstation'"
  },
  {
    id: "ACT-1007",
    timestamp: "2026-09-02 10:15:00",
    ticketId: "TK-1003",
    action: "STATUS_UPDATED",
    actor: "Mr. Selvin (Junior)",
    details: "Changed status of TK-1003 to In Progress"
  },
  {
    id: "ACT-1008",
    timestamp: "2026-09-02 11:10:05",
    ticketId: "TK-1004",
    action: "TICKET_CREATED",
    actor: "Elena Rostova",
    details: "Created ticket 'Outlook Desktop application crashing on startup'"
  },
  {
    id: "ACT-1009",
    timestamp: "2026-09-02 13:00:40",
    ticketId: "TK-1005",
    action: "TICKET_CREATED",
    actor: "Standard User",
    details: "Created ticket 'Password reset for ERP Accounting Portal'"
  },
  {
    id: "ACT-1010",
    timestamp: "2026-09-02 13:25:00",
    ticketId: "TK-1005",
    action: "TICKET_RESOLVED",
    actor: "Mr. Ramesh (HOD/Manager)",
    details: "Marked TK-1005 as Resolved. Resolution: Temporary password link dispatched."
  },
  {
    id: "ACT-1011",
    timestamp: "2026-09-02 14:05:18",
    ticketId: "TK-1006",
    action: "TICKET_CREATED",
    actor: "Priya Sharma",
    details: "Created ticket 'Request for Python development environment setup'"
  }
];

function readJSONFile(filePath, defaultContent) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf-8');
      return defaultContent;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultContent;
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

export function getAllUsers() {
  return readJSONFile(USERS_FILE, defaultUsers);
}

export function authenticateUser(username, password) {
  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername) {
    return { success: false, message: 'Username / Name is required' };
  }

  // Admin Login: Username must be 'Admin.rk' or 'admin.rk' and password 'admin@rk06'
  if (cleanUsername.toLowerCase() === 'admin.rk') {
    if (cleanPassword === 'admin@rk06') {
      const adminUser = {
        id: "USR-ADMIN",
        username: "Admin.rk",
        name: "Mr. Ramesh (IT Admin)",
        role: "admin",
        email: "rk.ramesh@sujanindustries.com",
        department: "IT"
      };

      logActivity({
        ticketId: "AUTH",
        action: "USER_LOGIN",
        actor: adminUser.name,
        details: `Logged into system as role [ADMIN]`
      });

      return { success: true, user: adminUser };
    } else {
      return { success: false, message: 'Invalid username or password' };
    }
  }

  // User Login: Any entered name with password 'user@123'
  if (cleanPassword === 'user@123') {
    const users = getAllUsers();
    let existingUser = users.find(u => 
      u.username.toLowerCase() === cleanUsername.toLowerCase() ||
      u.name.toLowerCase() === cleanUsername.toLowerCase()
    );

    let userObj;
    if (existingUser) {
      const { password: _, ...rest } = existingUser;
      userObj = rest;
    } else {
      userObj = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        username: cleanUsername,
        name: cleanUsername,
        role: "user",
        email: `${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@sujanindustries.com`,
        department: "General"
      };
    }

    logActivity({
      ticketId: "AUTH",
      action: "USER_LOGIN",
      actor: userObj.name,
      details: `Logged into system as role [USER]`
    });

    return { success: true, user: userObj };
  }

  return { success: false, message: 'Invalid username or password' };
}

// Ticket Management Methods
export function getAllTickets() {
  return readJSONFile(TICKETS_FILE, defaultTickets);
}

export function getUserTickets(userEmail, userName) {
  const tickets = getAllTickets();
  const emailLower = (userEmail || '').toLowerCase().trim();
  const nameLower = (userName || '').toLowerCase().trim();

  return tickets.filter(t => 
    (emailLower && t.email && t.email.toLowerCase().trim() === emailLower) ||
    (nameLower && t.requesterName && t.requesterName.toLowerCase().trim() === nameLower)
  );
}

export function getTicketById(id) {
  const tickets = getAllTickets();
  return tickets.find(t => t.id.toLowerCase() === id.toLowerCase().trim()) || null;
}

export function createTicket(ticketData) {
  const tickets = getAllTickets();
  
  let nextNum = 1001;
  if (tickets.length > 0) {
    const ids = tickets.map(t => parseInt(t.id.replace('TK-', ''))).filter(n => !isNaN(n));
    if (ids.length > 0) {
      nextNum = Math.max(...ids) + 1;
    }
  }
  
  const nowStr = formatDate();
  const newTicket = {
    id: `TK-${nextNum}`,
    title: ticketData.title || "Untitled Ticket",
    description: ticketData.description || "",
    category: ticketData.category || "General",
    priority: ticketData.priority || "Medium",
    status: "Open",
    requesterName: ticketData.requesterName || "Anonymous User",
    department: ticketData.department || "General",
    email: ticketData.email || "",
    assignedTo: "Unassigned",
    resolutionNotes: "",
    createdAt: nowStr,
    updatedAt: nowStr,
    resolvedAt: null
  };

  tickets.unshift(newTicket);
  writeJSONFile(TICKETS_FILE, tickets);

  logActivity({
    ticketId: newTicket.id,
    action: "TICKET_CREATED",
    actor: newTicket.requesterName,
    details: `Created ticket '${newTicket.title}' (${newTicket.category} / ${newTicket.priority} Priority)`
  });

  return newTicket;
}

export function updateTicket(id, updates, actor = "Support Agent") {
  const tickets = getAllTickets();
  const index = tickets.findIndex(t => t.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;

  const oldTicket = tickets[index];
  const nowStr = formatDate();
  
  const isResolving = (updates.status === 'Resolved' || updates.status === 'Closed') && oldTicket.status !== 'Resolved' && oldTicket.status !== 'Closed';

  const updatedTicket = {
    ...oldTicket,
    ...updates,
    updatedAt: nowStr,
    resolvedAt: isResolving ? nowStr : (updates.status === 'Open' || updates.status === 'In Progress' ? null : oldTicket.resolvedAt)
  };

  tickets[index] = updatedTicket;
  writeJSONFile(TICKETS_FILE, tickets);

  let action = "TICKET_UPDATED";
  let detailMsg = `Updated ticket ${id}`;

  if (updates.status && updates.status !== oldTicket.status) {
    if (updates.status === 'Resolved' || updates.status === 'Closed') {
      action = "TICKET_RESOLVED";
      detailMsg = `Marked ticket ${id} as ${updates.status}. ${updates.resolutionNotes ? 'Resolution: ' + updates.resolutionNotes : ''}`;
    } else {
      action = "STATUS_UPDATED";
      detailMsg = `Changed status of ${id} from ${oldTicket.status} to ${updates.status}`;
    }
  } else if (updates.assignedTo && updates.assignedTo !== oldTicket.assignedTo) {
    action = "AGENT_ASSIGNED";
    detailMsg = `Assigned ticket ${id} to ${updates.assignedTo}`;
  } else if (updates.resolutionNotes && updates.resolutionNotes !== oldTicket.resolutionNotes) {
    action = "RESOLUTION_UPDATED";
    detailMsg = `Updated resolution notes for ticket ${id}`;
  }

  logActivity({
    ticketId: id,
    action,
    actor,
    details: detailMsg
  });

  return updatedTicket;
}

export function deleteTicket(id, actor = "Admin User") {
  const tickets = getAllTickets();
  const ticket = tickets.find(t => t.id.toLowerCase() === id.toLowerCase().trim());
  if (!ticket) return false;

  const filtered = tickets.filter(t => t.id.toLowerCase() !== id.toLowerCase().trim());
  writeJSONFile(TICKETS_FILE, filtered);

  logActivity({
    ticketId: id,
    action: "TICKET_DELETED",
    actor,
    details: `Deleted ticket ${id} ('${ticket.title}')`
  });

  return true;
}

export function getAllActivity() {
  return readJSONFile(ACTIVITY_FILE, defaultActivity);
}

export function logActivity({ ticketId = "SYSTEM", action, actor = "System", details }) {
  const activityList = getAllActivity();
  
  let nextNum = 1001;
  if (activityList.length > 0) {
    const ids = activityList.map(a => parseInt(a.id.replace('ACT-', ''))).filter(n => !isNaN(n));
    if (ids.length > 0) {
      nextNum = Math.max(...ids) + 1;
    }
  }

  const newLog = {
    id: `ACT-${nextNum}`,
    timestamp: formatDate(),
    ticketId,
    action,
    actor,
    details
  };

  activityList.unshift(newLog);
  writeJSONFile(ACTIVITY_FILE, activityList);
  return newLog;
}

export function getStats() {
  const tickets = getAllTickets();
  
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const categories = {};
  const priorities = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
  const statuses = { Open: 0, "In Progress": 0, Resolved: 0, Closed: 0 };

  tickets.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
    if (priorities[t.priority] !== undefined) priorities[t.priority]++;
    if (statuses[t.status] !== undefined) statuses[t.status]++;
  });

  const categoryList = Object.keys(categories).map(cat => ({ name: cat, count: categories[cat] }));
  const priorityList = Object.keys(priorities).map(p => ({ name: p, count: priorities[p] }));
  const statusList = Object.keys(statuses).map(s => ({ name: s, count: statuses[s] }));

  const dateCounts = {};
  tickets.forEach(t => {
    const dateStr = t.createdAt ? t.createdAt.substring(0, 10) : 'Unknown';
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  const trendList = Object.keys(dateCounts).sort().map(d => ({ date: d, tickets: dateCounts[d] }));

  return {
    total,
    open,
    inProgress,
    resolved,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    categoryList,
    priorityList,
    statusList,
    trendList
  };
}

// Work Tracker & Updater Database Methods
const WORK_ITEMS_FILE = path.join(DATA_DIR, 'work_items.json');

const defaultWorkItems = [
  {
    id: "WRK-1001",
    title: "Server 2 RAM & Storage Capacity Upgrade",
    description: "Upgrade DDR4 RAM from 32GB to 64GB and mount 2TB NVMe SSD for ERP database backup.",
    category: "Maintenance",
    priority: "High",
    status: "In Progress",
    progress: 65,
    assignedTo: "Mr. Ramesh (IT Admin)",
    department: "IT Infrastructure",
    estimatedHours: 8,
    actualHours: 5.5,
    linkedTicketId: "TK-1003",
    targetDate: "2026-09-18",
    createdAt: "2026-09-10 10:00:00",
    updatedAt: "2026-09-15 14:30:00",
    updates: [
      {
        id: "UPD-1",
        timestamp: "2026-09-10 10:00:00",
        actor: "Mr. Ramesh (IT Admin)",
        notes: "Work item created for scheduled hardware upgrade during weekend window.",
        progress: 0,
        hoursSpent: 0,
        status: "Pending"
      },
      {
        id: "UPD-2",
        timestamp: "2026-09-12 11:15:00",
        actor: "Mr. Ramesh (IT Admin)",
        notes: "Received 64GB DDR4 ECC RAM modules from vendor. Verified compatibility.",
        progress: 30,
        hoursSpent: 2,
        status: "In Progress"
      },
      {
        id: "UPD-3",
        timestamp: "2026-09-15 14:30:00",
        actor: "Mr. Ramesh (IT Admin)",
        notes: "Physical installation completed on Rack 2. Memory diagnostic check passed with zero errors.",
        progress: 65,
        hoursSpent: 3.5,
        status: "In Progress"
      }
    ]
  },
  {
    id: "WRK-1002",
    title: "Quarterly Network Firewall Audit & Patch Update",
    description: "Perform security audit on main Fortinet firewall, update firmware to v7.4.2, and prune unused NAT rules.",
    category: "Access & Security",
    priority: "Urgent",
    status: "Pending",
    progress: 0,
    assignedTo: "Mr. Selvin (Junior)",
    department: "IT Security",
    estimatedHours: 12,
    actualHours: 0,
    linkedTicketId: "",
    targetDate: "2026-09-20",
    createdAt: "2026-09-14 09:30:00",
    updatedAt: "2026-09-14 09:30:00",
    updates: [
      {
        id: "UPD-1",
        timestamp: "2026-09-14 09:30:00",
        actor: "Mr. Selvin (Junior)",
        notes: "Work item assigned. Awaiting change management window approval.",
        progress: 0,
        hoursSpent: 0,
        status: "Pending"
      }
    ]
  },
  {
    id: "WRK-1003",
    title: "Deploy 10 Workstations for Marketing Team",
    description: "Assemble Dell OptiPlex towers, install Windows 11 Pro, Adobe Creative Cloud, and join domain sujan.local.",
    category: "System Setup",
    priority: "Medium",
    status: "Completed",
    progress: 100,
    assignedTo: "Mr. Selvin (Junior)",
    department: "Marketing",
    estimatedHours: 16,
    actualHours: 14,
    linkedTicketId: "TK-1001",
    targetDate: "2026-09-12",
    createdAt: "2026-09-08 08:00:00",
    updatedAt: "2026-09-12 17:00:00",
    updates: [
      {
        id: "UPD-1",
        timestamp: "2026-09-08 08:00:00",
        actor: "Mr. Selvin (Junior)",
        notes: "Workstation boxes unboxed and labeled.",
        progress: 10,
        hoursSpent: 2,
        status: "In Progress"
      },
      {
        id: "UPD-2",
        timestamp: "2026-09-10 16:20:00",
        actor: "Mr. Selvin (Junior)",
        notes: "OS image deployed on all 10 PCs. Domain join successful.",
        progress: 70,
        hoursSpent: 8,
        status: "In Progress"
      },
      {
        id: "UPD-3",
        timestamp: "2026-09-12 17:00:00",
        actor: "Mr. Selvin (Junior)",
        notes: "All 10 systems installed at Marketing desks with dual monitor setups. Sign-off completed.",
        progress: 100,
        hoursSpent: 4,
        status: "Completed"
      }
    ]
  }
];

export function getAllWorkItems() {
  return readJSONFile(WORK_ITEMS_FILE, defaultWorkItems);
}

export function getWorkItemById(id) {
  const items = getAllWorkItems();
  return items.find(w => w.id.toLowerCase() === id.toLowerCase().trim()) || null;
}

export function createWorkItem(data) {
  const items = getAllWorkItems();
  let nextNum = 1001;
  if (items.length > 0) {
    const ids = items.map(w => parseInt(w.id.replace('WRK-', ''))).filter(n => !isNaN(n));
    if (ids.length > 0) {
      nextNum = Math.max(...ids) + 1;
    }
  }

  const nowStr = formatDate();
  const newItem = {
    id: `WRK-${nextNum}`,
    title: data.title || "Untitled Work Task",
    description: data.description || "",
    category: data.category || "General",
    priority: data.priority || "Medium",
    status: data.status || "Pending",
    progress: parseInt(data.progress) || 0,
    assignedTo: data.assignedTo || "Unassigned",
    department: data.department || "IT",
    estimatedHours: parseFloat(data.estimatedHours) || 0,
    actualHours: parseFloat(data.actualHours) || 0,
    linkedTicketId: data.linkedTicketId || "",
    targetDate: data.targetDate || "",
    createdAt: nowStr,
    updatedAt: nowStr,
    updates: [
      {
        id: `UPD-1`,
        timestamp: nowStr,
        actor: data.actor || "System",
        notes: data.initialNotes || `Work task created by ${data.actor || 'User'}`,
        progress: parseInt(data.progress) || 0,
        hoursSpent: 0,
        status: data.status || "Pending"
      }
    ]
  };

  items.unshift(newItem);
  writeJSONFile(WORK_ITEMS_FILE, items);

  logActivity({
    ticketId: newItem.id,
    action: "WORK_ITEM_CREATED",
    actor: data.actor || "System",
    details: `Created Work Item '${newItem.title}' (${newItem.category} / Assigned to ${newItem.assignedTo})`
  });

  return newItem;
}

export function updateWorkItem(id, updates, actor = "Support Agent") {
  const items = getAllWorkItems();
  const index = items.findIndex(w => w.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;

  const oldItem = items[index];
  const nowStr = formatDate();

  const updatedItem = {
    ...oldItem,
    ...updates,
    updatedAt: nowStr
  };

  items[index] = updatedItem;
  writeJSONFile(WORK_ITEMS_FILE, items);

  logActivity({
    ticketId: id,
    action: "WORK_ITEM_UPDATED",
    actor,
    details: `Updated Work Item ${id} settings`
  });

  return updatedItem;
}

export function addWorkUpdateLog(id, updateData, actor = "Support Agent") {
  const items = getAllWorkItems();
  const index = items.findIndex(w => w.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;

  const item = items[index];
  const nowStr = formatDate();
  const hoursSpent = parseFloat(updateData.hoursSpent) || 0;
  const newProgress = Math.min(100, Math.max(0, parseInt(updateData.progress) ?? item.progress));
  const newStatus = updateData.status || item.status;

  const updateEntry = {
    id: `UPD-${item.updates.length + 1}`,
    timestamp: nowStr,
    actor,
    notes: updateData.notes || 'Status/Progress update logged',
    progress: newProgress,
    hoursSpent,
    status: newStatus
  };

  item.progress = newProgress;
  item.status = newStatus;
  if (newProgress === 100) item.status = "Completed";
  item.actualHours = (parseFloat(item.actualHours) || 0) + hoursSpent;
  item.updatedAt = nowStr;
  item.updates.unshift(updateEntry);

  items[index] = item;
  writeJSONFile(WORK_ITEMS_FILE, items);

  logActivity({
    ticketId: id,
    action: "WORK_UPDATE_LOGGED",
    actor,
    details: `Logged update on ${id}: ${newProgress}% complete (${newStatus}). Notes: ${updateData.notes || 'N/A'}`
  });

  return item;
}

export function deleteWorkItem(id, actor = "Admin User") {
  const items = getAllWorkItems();
  const item = items.find(w => w.id.toLowerCase() === id.toLowerCase().trim());
  if (!item) return false;

  const filtered = items.filter(w => w.id.toLowerCase() !== id.toLowerCase().trim());
  writeJSONFile(WORK_ITEMS_FILE, filtered);

  logActivity({
    ticketId: id,
    action: "WORK_ITEM_DELETED",
    actor,
    details: `Deleted Work Item ${id} ('${item.title}')`
  });

  return true;
}

export function getWorkStats() {
  const items = getAllWorkItems();
  const total = items.length;
  const pending = items.filter(w => w.status === 'Pending').length;
  const inProgress = items.filter(w => w.status === 'In Progress').length;
  const onHold = items.filter(w => w.status === 'On Hold').length;
  const completed = items.filter(w => w.status === 'Completed').length;

  const totalActualHours = items.reduce((sum, w) => sum + (parseFloat(w.actualHours) || 0), 0);
  const totalEstHours = items.reduce((sum, w) => sum + (parseFloat(w.estimatedHours) || 0), 0);
  const avgProgress = total > 0 ? Math.round(items.reduce((sum, w) => sum + (parseInt(w.progress) || 0), 0) / total) : 0;

  return {
    total,
    pending,
    inProgress,
    onHold,
    completed,
    avgProgress,
    totalActualHours: Math.round(totalActualHours * 10) / 10,
    totalEstHours: Math.round(totalEstHours * 10) / 10
  };
}

