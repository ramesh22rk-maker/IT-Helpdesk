import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  BarChart2, 
  PieChart as PieIcon, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  Calendar,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { generateManagementPDFReport } from '../utils/pdfGenerator';
import { downloadTicketsCSV, downloadActivityCSV } from '../utils/csvExporter';
import { downloadTicketsWord } from '../utils/wordExporter';

const COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#7c3aed', '#dc2626'];
const PRIORITY_COLORS = { Low: '#16a34a', Medium: '#d97706', High: '#ea580c', Urgent: '#dc2626' };

const STATUS_COLORS = { 
  Open: '#dc2626', 
  'In Progress': '#2563eb', 
  Resolved: '#16a34a', 
  Closed: '#064e3b' 
};

export default function ManagementReports({ stats, tickets = [], activities = [] }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const ticketDate = t.createdAt ? t.createdAt.slice(0, 10) : '';
      if (startDate && ticketDate < startDate) return false;
      if (endDate && ticketDate > endDate) return false;
      return true;
    });
  }, [tickets, startDate, endDate]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const actDate = a.timestamp ? a.timestamp.slice(0, 10) : '';
      if (startDate && actDate < startDate) return false;
      if (endDate && actDate > endDate) return false;
      return true;
    });
  }, [activities, startDate, endDate]);

  const currentStats = useMemo(() => {
    if (!startDate && !endDate) return stats;
    
    const total = filteredTickets.length;
    const open = filteredTickets.filter(t => t.status.toLowerCase() === 'open').length;
    const inProgress = filteredTickets.filter(t => t.status.toLowerCase() === 'in progress').length;
    const resolved = filteredTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const catMap = {};
    filteredTickets.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
    const categoryList = Object.keys(catMap).map(k => ({ name: k, count: catMap[k] }));

    const prioMap = {};
    filteredTickets.forEach(t => { prioMap[t.priority] = (prioMap[t.priority] || 0) + 1; });
    const priorityList = ['Low', 'Medium', 'High', 'Urgent'].map(k => ({ name: k, count: prioMap[k] || 0 }));

    const statusMap = {};
    filteredTickets.forEach(t => { statusMap[t.status] = (statusMap[t.status] || 0) + 1; });
    const statusList = ['Open', 'In Progress', 'Resolved', 'Closed'].map(k => ({ name: k, count: statusMap[k] || 0 }));

    const trendMap = {};
    filteredTickets.forEach(t => {
      const d = t.createdAt ? t.createdAt.slice(0, 10) : 'Unknown';
      trendMap[d] = (trendMap[d] || 0) + 1;
    });
    const trendList = Object.keys(trendMap).sort().map(d => ({ date: d, tickets: trendMap[d] }));

    return {
      total,
      open,
      inProgress,
      resolved,
      resolutionRate,
      categoryList,
      priorityList,
      statusList,
      trendList
    };
  }, [stats, filteredTickets, startDate, endDate]);

  if (!stats || !currentStats) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading statistics...</div>;

  const dateRangeLabel = (startDate || endDate) 
    ? `${startDate || 'Start'} to ${endDate || 'Present'}`
    : 'All Dates';

  const handleDownloadPDF = async () => {
    generateManagementPDFReport(currentStats, filteredTickets, filteredActivities, dateRangeLabel);
    try {
      await fetch('/api/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: 'MANAGEMENT',
          action: 'REPORT_DOWNLOADED',
          actor: 'Management Admin',
          details: `Downloaded PDF Report for Date Range [${dateRangeLabel}]`
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadTicketsCSV = () => {
    const filename = `IT_Tickets_Report_${dateRangeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    downloadTicketsCSV(filteredTickets, filename);
  };

  const handleDownloadTicketsWord = () => {
    const filename = `IT_Tickets_Report_${dateRangeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    downloadTicketsWord(filteredTickets, filename);
  };

  const handleDownloadActivityCSV = () => {
    const filename = `IT_Audit_Trail_${dateRangeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    downloadActivityCSV(filteredActivities, filename);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner & Date Filter & Export Actions */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Management Analytics & Reports</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Operational overview, ticket performance metrics, visual graphs, and date-filtered downloadable management reports.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleDownloadTicketsWord} className="btn btn-primary" style={{ background: '#2b579a', borderColor: '#2b579a' }}>
              <FileText size={17} />
              <span>Export Word Report (.doc)</span>
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-secondary">
              <FileText size={17} />
              <span>Executive PDF</span>
            </button>
            <button onClick={handleDownloadTicketsCSV} className="btn btn-secondary">
              <FileSpreadsheet size={17} />
              <span>Tickets CSV</span>
            </button>
            <button onClick={handleDownloadActivityCSV} className="btn btn-secondary">
              <Download size={17} />
              <span>Audit Log CSV</span>
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          background: '#f8fafc',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: '#334155' }}>
            <Calendar size={18} style={{ color: '#4f46e5' }} />
            <span>Filter Report By Date:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.825rem', color: '#64748b' }}>From:</label>
            <input
              type="date"
              className="form-control"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '160px' }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.825rem', color: '#64748b' }}>To:</label>
            <input
              type="date"
              className="form-control"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '160px' }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#ef4444' }}
            >
              <X size={14} />
              <span>Clear Date Filter</span>
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>
            Showing <strong>{filteredTickets.length}</strong> tickets ({dateRangeLabel})
          </div>
        </div>

      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        
        <div className="glass-panel metric-card" style={{ '--card-accent': '#4f46e5' }}>
          <div>
            <div className="metric-title">Total Tickets Raised</div>
            <div className="metric-value">{currentStats.total}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{dateRangeLabel}</span>
          </div>
          <div className="metric-icon"><BarChart2 size={24} /></div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#dc2626' }}>
          <div>
            <div className="metric-title">Active Open Tickets</div>
            <div className="metric-value" style={{ color: '#dc2626' }}>{currentStats.open}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Red status - pending</span>
          </div>
          <div className="metric-icon" style={{ color: '#dc2626' }}><Clock size={24} /></div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#2563eb' }}>
          <div>
            <div className="metric-title">In Progress</div>
            <div className="metric-value" style={{ color: '#2563eb' }}>{currentStats.inProgress}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Blue status - active</span>
          </div>
          <div className="metric-icon" style={{ color: '#2563eb' }}><TrendingUp size={24} /></div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#16a34a' }}>
          <div>
            <div className="metric-title">Resolved & Solved</div>
            <div className="metric-value" style={{ color: '#16a34a' }}>{currentStats.resolved}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Green status - {currentStats.resolutionRate}% rate</span>
          </div>
          <div className="metric-icon" style={{ color: '#16a34a' }}><CheckCircle2 size={24} /></div>
        </div>

      </div>

      {/* Visual Analytics Graphs (2x2 Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* Chart 1: Ticket Volume Trend */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#4f46e5" />
            Ticket Volume Trend Over Time
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={currentStats.trendList}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={18} color="#0891b2" />
            Tickets Breakdown by Category
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={currentStats.categoryList}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {currentStats.categoryList.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Priority Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#d97706" />
            Priority Breakdown Distribution
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={currentStats.priorityList}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {currentStats.priorityList.map((entry, index) => (
                    <Cell key={`pcell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Status Breakdown - Open(Red), In Progress(Blue), Resolved(Green), Closed(Dark Green) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            Status Breakdown (Red, Blue, Green, Dark Green)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={currentStats.statusList}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {currentStats.statusList.map((entry, index) => (
                    <Cell key={`scell-${index}`} fill={STATUS_COLORS[entry.name] || '#4f46e5'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
