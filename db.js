import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatic .env file loader
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex !== -1) {
        const key = trimmed.slice(0, eqIndex).trim();
        let val = trimmed.slice(eqIndex + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (_) {}

const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), 'sihpl_data') : path.join(__dirname, 'data'));
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORK_ITEMS_FILE = path.join(DATA_DIR, 'work_items.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Storage Notice] Could not create DATA_DIR:', err.message);
}

// Format local date string (YYYY-MM-DD HH:mm:ss)
export function formatDate(date = new Date()) {
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

// Company IT Admin default credentials
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

// Helper: JSON File IO
function readJSONFile(filePath, defaultContent) {
  try {
    if (!fs.existsSync(filePath)) {
      const baseName = path.basename(filePath);
      const bundledPath = path.join(__dirname, 'data', baseName);
      let initialData = defaultContent;
      if (fs.existsSync(bundledPath)) {
        try {
          initialData = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
        } catch (_) {}
      }
      try {
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch (_) {}
      return initialData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultContent;
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // In serverless / read-only environment, file writes might fail silently while memory cache still retains updates
    return false;
  }
}

// In-Memory Storage Caches for Ultra-Fast Instant Queries
let cachedTickets = readJSONFile(TICKETS_FILE, defaultTickets);
let cachedActivity = readJSONFile(ACTIVITY_FILE, defaultActivity);
let cachedUsers = readJSONFile(USERS_FILE, defaultUsers);
let cachedWorkItems = readJSONFile(WORK_ITEMS_FILE, defaultWorkItems);

// Database Engine State
let dbEngine = 'json'; // 'postgres' | 'mongodb' | 'json'
let dbConnected = false;
let dbStatusMessage = 'Running on Local / Ephemeral Storage';
let pgPool = null;
let mongoClient = null;
let mongoDb = null;

// Initialize Database Connection
export async function initDatabase() {
  const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGURI || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL;
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;

  // 1. Check PostgreSQL (Supabase / Neon / Render Postgres) Connection
  if (pgUrl) {
    try {
      console.log('[Database] Connecting to PostgreSQL / Supabase Database...');
      const sslConfig = pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false };

      pgPool = new pg.Pool({
        connectionString: pgUrl,
        ssl: sslConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });

      // Test connection
      await pgPool.query('SELECT NOW()');

      // Create Tables if not exist
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS helpdesk_tickets (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS helpdesk_activity (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS helpdesk_work_items (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS helpdesk_users (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL
        );
      `);

      // Load existing records from Postgres or Seed from JSON
      const ticketsRes = await pgPool.query('SELECT data FROM helpdesk_tickets ORDER BY (data->>\'id\') DESC');
      if (ticketsRes.rows.length > 0) {
        cachedTickets = ticketsRes.rows.map(r => r.data);
        console.log(`[Database] Loaded ${cachedTickets.length} tickets from PostgreSQL.`);
      } else {
        console.log('[Database] Seeding initial tickets to PostgreSQL...');
        for (const t of cachedTickets) {
          await pgPool.query(
            'INSERT INTO helpdesk_tickets (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET data = $2',
            [t.id, JSON.stringify(t)]
          );
        }
      }

      const activityRes = await pgPool.query('SELECT data FROM helpdesk_activity ORDER BY (data->>\'id\') DESC');
      if (activityRes.rows.length > 0) {
        cachedActivity = activityRes.rows.map(r => r.data);
      } else {
        for (const a of cachedActivity) {
          await pgPool.query(
            'INSERT INTO helpdesk_activity (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
            [a.id, JSON.stringify(a)]
          );
        }
      }

      const workRes = await pgPool.query('SELECT data FROM helpdesk_work_items ORDER BY (data->>\'id\') DESC');
      if (workRes.rows.length > 0) {
        cachedWorkItems = workRes.rows.map(r => r.data);
      } else {
        for (const w of cachedWorkItems) {
          await pgPool.query(
            'INSERT INTO helpdesk_work_items (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET data = $2',
            [w.id, JSON.stringify(w)]
          );
        }
      }

      const usersRes = await pgPool.query('SELECT data FROM helpdesk_users');
      if (usersRes.rows.length > 0) {
        cachedUsers = usersRes.rows.map(r => r.data);
      } else {
        for (const u of cachedUsers) {
          await pgPool.query(
            'INSERT INTO helpdesk_users (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
            [u.id, JSON.stringify(u)]
          );
        }
      }

      dbEngine = 'postgres';
      dbConnected = true;
      dbStatusMessage = 'Connected to PostgreSQL Cloud Database (100% Persistent across restarts)';
      console.log('[Database] ✅ PostgreSQL Cloud Database connected successfully! All data is permanently saved.');
      return;
    } catch (err) {
      console.error('[Database] ⚠️ PostgreSQL connection failed:', err.message);
      dbStatusMessage = `PostgreSQL error: ${err.message}. Falling back to file storage.`;
    }
  }

  // 2. Check MongoDB Connection
  if (mongoUrl) {
    try {
      console.log('[Database] Connecting to MongoDB Atlas Database...');
      mongoClient = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 5000 });
      await mongoClient.connect();
      mongoDb = mongoClient.db('sihpl_helpdesk');

      const ticketsCol = mongoDb.collection('tickets');
      const count = await ticketsCol.countDocuments();
      if (count > 0) {
        const docs = await ticketsCol.find({}).toArray();
        cachedTickets = docs.map(({ _id, ...rest }) => rest);
        console.log(`[Database] Loaded ${cachedTickets.length} tickets from MongoDB.`);
      } else {
        for (const t of cachedTickets) {
          await ticketsCol.updateOne({ id: t.id }, { $set: t }, { upsert: true });
        }
      }

      const activityCol = mongoDb.collection('activity');
      const actCount = await activityCol.countDocuments();
      if (actCount > 0) {
        const docs = await activityCol.find({}).toArray();
        cachedActivity = docs.map(({ _id, ...rest }) => rest);
      } else {
        for (const a of cachedActivity) {
          await activityCol.updateOne({ id: a.id }, { $set: a }, { upsert: true });
        }
      }

      const workCol = mongoDb.collection('work_items');
      const workCount = await workCol.countDocuments();
      if (workCount > 0) {
        const docs = await workCol.find({}).toArray();
        cachedWorkItems = docs.map(({ _id, ...rest }) => rest);
      } else {
        for (const w of cachedWorkItems) {
          await workCol.updateOne({ id: w.id }, { $set: w }, { upsert: true });
        }
      }

      const usersCol = mongoDb.collection('users');
      const usersCount = await usersCol.countDocuments();
      if (usersCount > 0) {
        const docs = await usersCol.find({}).toArray();
        cachedUsers = docs.map(({ _id, ...rest }) => rest);
      } else {
        for (const u of cachedUsers) {
          await usersCol.updateOne({ id: u.id }, { $set: u }, { upsert: true });
        }
      }

      dbEngine = 'mongodb';
      dbConnected = true;
      dbStatusMessage = 'Connected to MongoDB Atlas Cloud Database (100% Persistent across restarts)';
      console.log('[Database] ✅ MongoDB Cloud Database connected successfully! All data is permanently saved.');
      return;
    } catch (err) {
      console.error('[Database] ⚠️ MongoDB connection failed:', err.message);
      dbStatusMessage = `MongoDB error: ${err.message}. Falling back to file storage.`;
    }
  }

  // 3. Fallback: Local JSON Storage
  dbEngine = 'json';
  dbConnected = true;
  dbStatusMessage = process.env.DATA_DIR 
    ? `Running on Mounted Persistent Storage: ${process.env.DATA_DIR}`
    : 'Running on Local/Ephemeral Storage (Add DATABASE_URL on Render for cloud persistence)';
  console.log(`[Database] ℹ️ Storage Engine: ${dbStatusMessage}`);
}

// Background Async Sync Helpers
async function persistTicket(ticket, isDelete = false) {
  writeJSONFile(TICKETS_FILE, cachedTickets);
  if (dbEngine === 'postgres' && pgPool) {
    try {
      if (isDelete) {
        await pgPool.query('DELETE FROM helpdesk_tickets WHERE id = $1', [ticket.id]);
      } else {
        await pgPool.query(
          'INSERT INTO helpdesk_tickets (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()',
          [ticket.id, JSON.stringify(ticket)]
        );
      }
    } catch (err) {
      console.error('[Database Error] Postgres ticket sync:', err.message);
    }
  } else if (dbEngine === 'mongodb' && mongoDb) {
    try {
      const col = mongoDb.collection('tickets');
      if (isDelete) {
        await col.deleteOne({ id: ticket.id });
      } else {
        await col.updateOne({ id: ticket.id }, { $set: ticket }, { upsert: true });
      }
    } catch (err) {
      console.error('[Database Error] MongoDB ticket sync:', err.message);
    }
  }
}

async function persistActivity(activityLog) {
  writeJSONFile(ACTIVITY_FILE, cachedActivity);
  if (dbEngine === 'postgres' && pgPool) {
    try {
      await pgPool.query(
        'INSERT INTO helpdesk_activity (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
        [activityLog.id, JSON.stringify(activityLog)]
      );
    } catch (err) {
      console.error('[Database Error] Postgres activity sync:', err.message);
    }
  } else if (dbEngine === 'mongodb' && mongoDb) {
    try {
      await mongoDb.collection('activity').updateOne(
        { id: activityLog.id },
        { $set: activityLog },
        { upsert: true }
      );
    } catch (err) {
      console.error('[Database Error] MongoDB activity sync:', err.message);
    }
  }
}

async function persistWorkItem(workItem, isDelete = false) {
  writeJSONFile(WORK_ITEMS_FILE, cachedWorkItems);
  if (dbEngine === 'postgres' && pgPool) {
    try {
      if (isDelete) {
        await pgPool.query('DELETE FROM helpdesk_work_items WHERE id = $1', [workItem.id]);
      } else {
        await pgPool.query(
          'INSERT INTO helpdesk_work_items (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()',
          [workItem.id, JSON.stringify(workItem)]
        );
      }
    } catch (err) {
      console.error('[Database Error] Postgres work item sync:', err.message);
    }
  } else if (dbEngine === 'mongodb' && mongoDb) {
    try {
      const col = mongoDb.collection('work_items');
      if (isDelete) {
        await col.deleteOne({ id: workItem.id });
      } else {
        await col.updateOne({ id: workItem.id }, { $set: workItem }, { upsert: true });
      }
    } catch (err) {
      console.error('[Database Error] MongoDB work item sync:', err.message);
    }
  }
}

export function getDatabaseStatus() {
  const isCloudPersistent = dbEngine === 'postgres' || dbEngine === 'mongodb' || !!process.env.DATA_DIR;
  return {
    engine: dbEngine,
    connected: dbConnected,
    isCloudPersistent,
    statusMessage: dbStatusMessage,
    counts: {
      tickets: cachedTickets.length,
      activity: cachedActivity.length,
      workItems: cachedWorkItems.length,
      users: cachedUsers.length
    },
    cloudPersistenceGuide: {
      isReady: isCloudPersistent,
      renderPostgresRecommended: true,
      setupInstruction: "To make your data 100% persistent forever on Render Free Tier: Create a free PostgreSQL database on Neon.tech, Supabase, or Render, and add DATABASE_URL into your Render Web Service Environment Variables."
    }
  };
}

// User Authentication Methods
export function getAllUsers() {
  return cachedUsers;
}

export function authenticateUser(username, password) {
  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, message: 'Admin username and password are required' };
  }

  // Admin Login: Username must be 'Admin.rk' or 'admin.rk' and password 'admin@rk06'
  if (cleanUsername.toLowerCase() === 'admin.rk' && cleanPassword === 'admin@rk06') {
    const adminUser = {
      id: "USR-ADMIN",
      username: "Admin.rk",
      name: "Mr. Ramesh (IT Admin)",
      role: "admin",
      email: "rk.ramesh@sujanindustries.com",
      department: "IT/Admin"
    };

    logActivity({
      ticketId: "AUTH",
      action: "ADMIN_LOGIN",
      actor: adminUser.name,
      details: `Logged into system as IT Admin`
    });

    return { success: true, user: adminUser };
  }

  return { success: false, message: 'Invalid Admin Username or Password' };
}

// Ticket Management Methods
export async function getAllTickets() {
  if (dbEngine === 'postgres' && pgPool) {
    try {
      const ticketsRes = await pgPool.query('SELECT data FROM helpdesk_tickets ORDER BY (data->>\'id\') DESC');
      if (ticketsRes.rows.length > 0) {
        cachedTickets = ticketsRes.rows.map(r => r.data);
      }
    } catch (err) {
      console.error('[Database Error] Postgres getAllTickets:', err.message);
    }
  } else if (dbEngine === 'mongodb' && mongoDb) {
    try {
      const docs = await mongoDb.collection('tickets').find({}).sort({ id: -1 }).toArray();
      if (docs.length > 0) {
        cachedTickets = docs.map(({ _id, ...rest }) => rest);
      }
    } catch (err) {}
  }
  return cachedTickets;
}

export function getUserTickets(userEmail, userName) {
  const emailLower = (userEmail || '').toLowerCase().trim();
  const nameLower = (userName || '').toLowerCase().trim();

  return cachedTickets.filter(t => 
    (emailLower && t.email && t.email.toLowerCase().trim() === emailLower) ||
    (nameLower && t.requesterName && t.requesterName.toLowerCase().trim() === nameLower)
  );
}

export function getTicketById(id) {
  return cachedTickets.find(t => t.id.toLowerCase() === id.toLowerCase().trim()) || null;
}

export async function createTicket(ticketData) {
  let nextNum = 1001;
  if (cachedTickets.length > 0) {
    const ids = cachedTickets.map(t => parseInt(t.id.replace('TK-', ''))).filter(n => !isNaN(n));
    if (ids.length > 0) {
      nextNum = Math.max(...ids) + 1;
    }
  }
  
  const nowStr = formatDate();
  const newTicket = {
    id: `TK-${nextNum}`,
    title: ticketData.title || "Untitled Ticket",
    description: ticketData.description || "",
    category: ticketData.category || "Others",
    priority: ticketData.priority || "Medium",
    status: "Open",
    requesterName: ticketData.requesterName || "Anonymous User",
    department: ticketData.department || "General",
    email: ticketData.email || "",
    attachment: ticketData.attachment || null,
    assignedTo: "Unassigned",
    resolutionNotes: "",
    createdAt: nowStr,
    updatedAt: nowStr,
    resolvedAt: null
  };

  cachedTickets.unshift(newTicket);
  await persistTicket(newTicket);

  await logActivity({
    ticketId: newTicket.id,
    action: "TICKET_CREATED",
    actor: newTicket.requesterName,
    details: `Created ticket '${newTicket.title}' (${newTicket.category} / ${newTicket.priority} Priority)`
  });

  return newTicket;
}

export async function updateTicket(id, updates, actor = "Support Agent") {
  const index = cachedTickets.findIndex(t => t.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;

  const oldTicket = cachedTickets[index];
  const nowStr = formatDate();
  
  const isResolving = (updates.status === 'Resolved' || updates.status === 'Closed') && oldTicket.status !== 'Resolved' && oldTicket.status !== 'Closed';

  const updatedTicket = {
    ...oldTicket,
    ...updates,
    updatedAt: nowStr,
    resolvedAt: isResolving ? nowStr : (updates.status === 'Open' || updates.status === 'In Progress' ? null : oldTicket.resolvedAt)
  };

  cachedTickets[index] = updatedTicket;
  await persistTicket(updatedTicket);

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

  await logActivity({
    ticketId: id,
    action,
    actor,
    details: detailMsg
  });

  return updatedTicket;
}

export async function deleteTicket(id, actor = "Admin User") {
  const ticket = cachedTickets.find(t => t.id.toLowerCase() === id.toLowerCase().trim());
  if (!ticket) return false;

  cachedTickets = cachedTickets.filter(t => t.id.toLowerCase() !== id.toLowerCase().trim());
  await persistTicket(ticket, true);

  await logActivity({
    ticketId: id,
    action: "TICKET_DELETED",
    actor,
    details: `Deleted ticket ${id} ('${ticket.title}')`
  });

  return true;
}

// Activity Log Methods
export async function getAllActivity() {
  if (dbEngine === 'postgres' && pgPool) {
    try {
      const activityRes = await pgPool.query('SELECT data FROM helpdesk_activity ORDER BY (data->>\'id\') DESC');
      if (activityRes.rows.length > 0) {
        cachedActivity = activityRes.rows.map(r => r.data);
      }
    } catch (err) {}
  }
  return cachedActivity;
}

export async function logActivity({ ticketId = "SYSTEM", action, actor = "System", details }) {
  let nextNum = 1001;
  if (cachedActivity.length > 0) {
    const ids = cachedActivity.map(a => parseInt(a.id.replace('ACT-', ''))).filter(n => !isNaN(n));
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

  cachedActivity.unshift(newLog);
  await persistActivity(newLog);
  return newLog;
}

export function getStats() {
  const tickets = cachedTickets;
  
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
export function getAllWorkItems() {
  return cachedWorkItems;
}

export function getWorkItemById(id) {
  return cachedWorkItems.find(w => w.id.toLowerCase() === id.toLowerCase().trim()) || null;
}

export function createWorkItem(data) {
  let nextNum = 1001;
  if (cachedWorkItems.length > 0) {
    const ids = cachedWorkItems.map(w => parseInt(w.id.replace('WRK-', ''))).filter(n => !isNaN(n));
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

  cachedWorkItems.unshift(newItem);
  persistWorkItem(newItem);

  logActivity({
    ticketId: newItem.id,
    action: "WORK_ITEM_CREATED",
    actor: data.actor || "System",
    details: `Created Work Item '${newItem.title}' (${newItem.category} / Assigned to ${newItem.assignedTo})`
  });

  return newItem;
}

export function updateWorkItem(id, updates, actor = "Support Agent") {
  const index = cachedWorkItems.findIndex(w => w.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;

  const oldItem = cachedWorkItems[index];
  const nowStr = formatDate();

  const updatedItem = {
    ...oldItem,
    ...updates,
    updatedAt: nowStr
  };

  cachedWorkItems[index] = updatedItem;
  persistWorkItem(updatedItem);

  logActivity({
    ticketId: id,
    action: "WORK_ITEM_UPDATED",
    actor,
    details: `Updated Work Item ${id} settings`
  });

  return updatedItem;
}

export function addWorkUpdateLog(id, updateData, actor = "Support Agent") {
  const index = cachedWorkItems.findIndex(w => w.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;

  const item = cachedWorkItems[index];
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

  cachedWorkItems[index] = item;
  persistWorkItem(item);

  logActivity({
    ticketId: id,
    action: "WORK_UPDATE_LOGGED",
    actor,
    details: `Logged update on ${id}: ${newProgress}% complete (${newStatus}). Notes: ${updateData.notes || 'N/A'}`
  });

  return item;
}

export function deleteWorkItem(id, actor = "Admin User") {
  const item = cachedWorkItems.find(w => w.id.toLowerCase() === id.toLowerCase().trim());
  if (!item) return false;

  cachedWorkItems = cachedWorkItems.filter(w => w.id.toLowerCase() !== id.toLowerCase().trim());
  persistWorkItem(item, true);

  logActivity({
    ticketId: id,
    action: "WORK_ITEM_DELETED",
    actor,
    details: `Deleted Work Item ${id} ('${item.title}')`
  });

  return true;
}

export function getWorkStats() {
  const items = cachedWorkItems;
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
