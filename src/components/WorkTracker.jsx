import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  PlayCircle, 
  CheckCircle2, 
  PauseCircle, 
  AlertCircle,
  TrendingUp, 
  UserCheck, 
  Calendar, 
  FileText, 
  Edit3, 
  Trash2, 
  History, 
  Send, 
  LayoutGrid, 
  List, 
  Activity,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

export default function WorkTracker({ currentUser, onWorkItemChanged }) {
  const [workItems, setWorkItems] = useState([]);
  const [workStats, setWorkStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'table', 'updates'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // New Work Item Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Maintenance');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newStatus, setNewStatus] = useState('Pending');
  const [newAssignedTo, setNewAssignedTo] = useState(currentUser?.name || 'Mr. Ramesh (IT Admin)');
  const [newDepartment, setNewDepartment] = useState(currentUser?.department || 'IT Infrastructure');
  const [newEstimatedHours, setNewEstimatedHours] = useState('4');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newLinkedTicketId, setNewLinkedTicketId] = useState('');
  const [newInitialNotes, setNewInitialNotes] = useState('');

  // Update Progress Form
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [updateHoursSpent, setUpdateHoursSpent] = useState('1');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchWorkItems = async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes] = await Promise.all([
        fetch('/api/work-items'),
        fetch('/api/work-items/stats')
      ]);
      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();

      if (itemsData.success) setWorkItems(itemsData.data);
      if (statsData.success) setWorkStats(statsData.data);
    } catch (err) {
      console.error('Error fetching work items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkItems();
    const interval = setInterval(fetchWorkItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateWorkItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          priority: newPriority,
          status: newStatus,
          assignedTo: newAssignedTo,
          department: newDepartment,
          estimatedHours: parseFloat(newEstimatedHours) || 0,
          targetDate: newTargetDate,
          linkedTicketId: newLinkedTicketId,
          initialNotes: newInitialNotes,
          actor: currentUser?.name || 'User'
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        resetCreateForm();
        fetchWorkItems();
        if (onWorkItemChanged) onWorkItemChanged();
      } else {
        alert('Failed to create work item: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('Maintenance');
    setNewPriority('Medium');
    setNewStatus('Pending');
    setNewEstimatedHours('4');
    setNewTargetDate('');
    setNewLinkedTicketId('');
    setNewInitialNotes('');
  };

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setUpdateProgress(item.progress || 0);
    setUpdateStatus(item.status || 'In Progress');
    setUpdateNotes('');
    setUpdateHoursSpent('1');
    setIsUpdateModalOpen(true);
  };

  const handleLogWorkUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmittingUpdate(true);
    try {
      const res = await fetch(`/api/work-items/${selectedItem.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: updateNotes,
          progress: parseInt(updateProgress),
          status: updateStatus,
          hoursSpent: parseFloat(updateHoursSpent) || 0,
          actor: currentUser?.name || 'Support Agent'
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsUpdateModalOpen(false);
        setSelectedItem(null);
        fetchWorkItems();
        if (onWorkItemChanged) onWorkItemChanged();
      } else {
        alert('Failed to submit work update: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating work status');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleDeleteWorkItem = async (id) => {
    if (!window.confirm(`Are you sure you want to delete work item ${id}?`)) return;

    try {
      const res = await fetch(`/api/work-items/${id}?actor=${encodeURIComponent(currentUser?.name || 'Admin')}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkItems();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Items
  const filteredItems = workItems.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || item.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Extract all updates across items for the Recent Updates Feed
  const allUpdatesFeed = [];
  workItems.forEach(item => {
    if (item.updates && Array.isArray(item.updates)) {
      item.updates.forEach(upd => {
        allUpdatesFeed.push({
          ...upd,
          itemId: item.id,
          itemTitle: item.title,
          itemCategory: item.category
        });
      });
    }
  });

  allUpdatesFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', icon: CheckCircle2 };
      case 'In Progress': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', icon: PlayCircle };
      case 'On Hold': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', icon: PauseCircle };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', icon: Clock };
    }
  };

  return (
    <div style={{ padding: '0 0.5rem' }}>
      
      {/* Header Title Bar & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckSquare className="text-indigo-600" size={28} />
            Work Tracker & Daily Progress Updater
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Track task progress, update daily work logs, record hours spent, and monitor execution milestones.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.2rem', borderRadius: '12px', gap: '0.5rem', fontWeight: 700 }}
        >
          <Plus size={18} />
          <span>New Work Item</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {workStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #4f46e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 600 }}>Total Work Tasks</span>
              <CheckSquare size={20} color="#4f46e5" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
              {workStats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              {workStats.pending} Pending • {workStats.inProgress} In Progress
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 600 }}>In Execution</span>
              <PlayCircle size={20} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '0.3rem' }}>
              {workStats.inProgress}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Active updates being logged
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 600 }}>Completed</span>
              <CheckCircle2 size={20} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '0.3rem' }}>
              {workStats.completed}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              100% finished tasks
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 600 }}>Avg Completion</span>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.3rem' }}>
              {workStats.avgProgress}%
            </div>
            <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${workStats.avgProgress}%`, background: '#8b5cf6', height: '100%' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 600 }}>Time Logged</span>
              <Clock size={20} color="#ea580c" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', marginTop: '0.3rem' }}>
              {workStats.totalActualHours} hrs
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Estimated: {workStats.totalEstHours} hrs total
            </div>
          </div>
        </div>
      )}

      {/* View Selector & Search / Filters Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', gap: '0.25rem' }}>
            <button
              onClick={() => setViewMode('kanban')}
              className={`btn ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                borderRadius: '8px',
                background: viewMode === 'kanban' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'kanban' ? 'white' : '#475569',
                boxShadow: 'none'
              }}
            >
              <LayoutGrid size={15} />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`btn ${viewMode === 'table' ? 'btn-primary' : ''}`}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                borderRadius: '8px',
                background: viewMode === 'table' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'table' ? 'white' : '#475569',
                boxShadow: 'none'
              }}
            >
              <List size={15} />
              <span>List Table</span>
            </button>

            <button
              onClick={() => setViewMode('updates')}
              className={`btn ${viewMode === 'updates' ? 'btn-primary' : ''}`}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                borderRadius: '8px',
                background: viewMode === 'updates' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'updates' ? 'white' : '#475569',
                boxShadow: 'none'
              }}
            >
              <Activity size={15} />
              <span>Daily Update Feed</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="input"
                placeholder="Search work task or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', height: '38px', borderRadius: '8px' }}
              />
            </div>

            {/* Status Filter */}
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.825rem', height: '38px', borderRadius: '8px' }}
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Category Filter */}
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.825rem', height: '38px', borderRadius: '8px' }}
            >
              <option value="All">Category: All</option>
              <option value="Maintenance">Maintenance</option>
              <option value="System Setup">System Setup</option>
              <option value="Hardware Repair">Hardware Repair</option>
              <option value="Network">Network</option>
              <option value="Access & Security">Access & Security</option>
              <option value="Software Dev">Software Dev</option>
              <option value="General">General</option>
            </select>

            {/* Priority Filter */}
            <select
              className="select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.825rem', height: '38px', borderRadius: '8px' }}
            >
              <option value="All">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

          </div>
        </div>
      </div>

      {/* Main View Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading work tracking items...
        </div>
      ) : filteredItems.length === 0 && viewMode !== 'updates' ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <CheckSquare size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>No Work Items Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.4rem' }}>
            No work tasks match your search filters or none have been logged yet.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            <Plus size={16} /> Create Work Item
          </button>
        </div>
      ) : (
        <>
          {/* 1. KANBAN BOARD VIEW */}
          {viewMode === 'kanban' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              alignItems: 'start'
            }}>
              {['Pending', 'In Progress', 'On Hold', 'Completed'].map(columnStatus => {
                const columnItems = filteredItems.filter(item => item.status === columnStatus);
                const statusStyle = getStatusBadgeStyle(columnStatus);
                const ColumnIcon = statusStyle.icon;

                return (
                  <div key={columnStatus} style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem'
                  }}>
                    {/* Column Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      paddingBottom: '0.65rem',
                      borderBottom: '2px solid ' + statusStyle.border
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ColumnIcon size={18} color={statusStyle.text} />
                        <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{columnStatus}</h4>
                      </div>
                      <span style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.6rem',
                        borderRadius: '999px',
                        border: `1px solid ${statusStyle.border}`
                      }}>
                        {columnItems.length}
                      </span>
                    </div>

                    {/* Column Item Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {columnItems.map(item => (
                        <div key={item.id} className="card" style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          cursor: 'pointer'
                        }} onClick={() => { setSelectedItem(item); setIsDetailModalOpen(true); }}>
                          
                          {/* Top Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>{item.id}</span>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <span className={`badge ${getPriorityBadgeClass(item.priority)}`} style={{ fontSize: '0.65rem' }}>
                                {item.priority}
                              </span>
                              <span className="badge" style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569' }}>
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                            {item.title}
                          </h4>

                          {item.description && (
                            <p style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              marginBottom: '0.75rem'
                            }}>
                              {item.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          <div style={{ margin: '0.6rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#334155' }}>
                              <span>Progress</span>
                              <span style={{ color: '#4f46e5' }}>{item.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${item.progress}%`,
                                height: '100%',
                                background: item.progress === 100 ? '#16a34a' : 'linear-gradient(90deg, #4f46e5, #0284c7)',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>

                          {/* Footer details & Action */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.6rem',
                            borderTop: '1px solid #f1f5f9',
                            fontSize: '0.75rem',
                            color: '#64748b'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={`Assigned to ${item.assignedTo}`}>
                              <UserCheck size={13} />
                              <span style={{ fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.assignedTo}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openUpdateModal(item);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.725rem',
                                borderRadius: '6px',
                                background: '#eef2ff',
                                color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                                fontWeight: 700
                              }}
                            >
                              <Edit3 size={12} />
                              Update Progress
                            </button>
                          </div>

                        </div>
                      ))}

                      {columnItems.length === 0 && (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: '0.8rem',
                          border: '2px dashed #e2e8f0',
                          borderRadius: '10px'
                        }}>
                          No tasks in {columnStatus}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* 2. LIST TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Title & Description</th>
                      <th>Assignee & Dept</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Completion %</th>
                      <th>Hours Logged</th>
                      <th>Target Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => {
                      const statusStyle = getStatusBadgeStyle(item.status);
                      return (
                        <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedItem(item); setIsDetailModalOpen(true); }}>
                          <td style={{ fontWeight: 800, color: '#4f46e5' }}>{item.id}</td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Category: {item.category}</span>
                            {item.linkedTicketId && (
                              <span style={{ fontSize: '0.7rem', color: '#0284c7', marginLeft: '0.5rem', fontWeight: 600 }}>
                                (Ref: {item.linkedTicketId})
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#334155' }}>{item.assignedTo}</div>
                            <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{item.department}</div>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(item.priority)}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              padding: '0.2rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: `1px solid ${statusStyle.border}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}>
                              <statusStyle.icon size={12} />
                              {item.status}
                            </span>
                          </td>
                          <td style={{ minWidth: '120px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${item.progress}%`, height: '100%', background: item.progress === 100 ? '#16a34a' : '#4f46e5' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{item.progress}%</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
                            {item.actualHours || 0} / {item.estimatedHours || 0} hrs
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {item.targetDate || 'N/A'}
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                onClick={() => openUpdateModal(item)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#eef2ff', color: '#4f46e5', fontWeight: 700 }}
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDeleteWorkItem(item.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem', color: '#e11d48' }}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. RECENT WORK UPDATES FEED */}
          {viewMode === 'updates' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <Activity size={20} className="text-indigo-600" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Live Daily Work Updates Timeline</h3>
              </div>

              {allUpdatesFeed.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No work update logs recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {allUpdatesFeed.map((upd, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#e0e7ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        {upd.actor ? upd.actor.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{upd.actor}</span>
                            <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.4rem' }}>
                              updated <strong style={{ color: '#4f46e5' }}>{upd.itemId}</strong>: {upd.itemTitle}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} /> {upd.timestamp}
                          </span>
                        </div>

                        <div style={{ marginTop: '0.5rem', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155' }}>
                          {upd.notes || 'Progress update logged'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem', fontSize: '0.775rem', color: '#64748b' }}>
                          <span>New Progress: <strong style={{ color: '#16a34a' }}>{upd.progress}%</strong></span>
                          <span>Status: <strong style={{ color: '#0284c7' }}>{upd.status}</strong></span>
                          {upd.hoursSpent > 0 && (
                            <span>Time Logged: <strong>+{upd.hoursSpent} hrs</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CREATE NEW WORK ITEM MODAL */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus className="text-indigo-600" size={22} /> Create New Work Task
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Upgrade Server RAM or Configure VPN Gateway"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Description & Scope</label>
                <textarea
                  className="textarea"
                  placeholder="Provide technical details, requirements, and steps..."
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Category</label>
                  <select className="select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="Maintenance">Maintenance</option>
                    <option value="System Setup">System Setup</option>
                    <option value="Hardware Repair">Hardware Repair</option>
                    <option value="Network">Network</option>
                    <option value="Access & Security">Access & Security</option>
                    <option value="Software Dev">Software Dev</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Priority Level</label>
                  <select className="select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Assigned Technician / Staff</label>
                  <input
                    type="text"
                    className="input"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Department / Unit</label>
                  <input
                    type="text"
                    className="input"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Est. Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input"
                    value={newEstimatedHours}
                    onChange={(e) => setNewEstimatedHours(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Target Completion</label>
                  <input
                    type="date"
                    className="input"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Link Ticket ID (Opt)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. TK-1002"
                    value={newLinkedTicketId}
                    onChange={(e) => setNewLinkedTicketId(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Initial Kickoff Note / Note</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Initiated work item, ordered replacement hardware"
                  value={newInitialNotes}
                  onChange={(e) => setNewInitialNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Create Work Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK WORK UPDATER MODAL */}
      {isUpdateModalOpen && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 105,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '550px',
            padding: '1.75rem',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4f46e5' }}>{selectedItem.id}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Log Daily Work Update
                </h3>
              </div>
              <button onClick={() => setIsUpdateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{selectedItem.title}</div>
              <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
                Assigned to: {selectedItem.assignedTo} • Current: {selectedItem.progress}% ({selectedItem.status})
              </div>
            </div>

            <form onSubmit={handleLogWorkUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Progress Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Progress Completed (%)</label>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: updateProgress === 100 ? '#16a34a' : '#4f46e5' }}>
                    {updateProgress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updateProgress}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setUpdateProgress(val);
                    if (val === 100) setUpdateStatus('Completed');
                    else if (val > 0 && updateStatus === 'Pending') setUpdateStatus('In Progress');
                  }}
                  style={{ width: '100%', accentColor: '#4f46e5', height: '8px', cursor: 'pointer' }}
                />
              </div>

              {/* Status Select */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Updated Status</label>
                  <select className="select" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Time Spent (Hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    className="input"
                    placeholder="e.g. 1.5"
                    value={updateHoursSpent}
                    onChange={(e) => setUpdateHoursSpent(e.target.value)}
                  />
                </div>
              </div>

              {/* Work Notes */}
              <div>
                <label className="form-label">Work Progress Log Notes *</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Describe what action was performed today, findings, or remaining tasks..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUpdate}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, gap: '0.4rem' }}
                >
                  <Send size={15} />
                  <span>{submittingUpdate ? 'Submitting...' : 'Post Update'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL HISTORY MODAL */}
      {isDetailModalOpen && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#4f46e5' }}>{selectedItem.id}</span>
                  <span className={`badge ${getPriorityBadgeClass(selectedItem.priority)}`}>{selectedItem.priority}</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{selectedItem.category}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{selectedItem.title}</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {selectedItem.description && (
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.875rem', color: '#334155', marginBottom: '1.25rem' }}>
                {selectedItem.description}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.85rem', borderRadius: '10px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Assigned To:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedItem.assignedTo}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Hours Logged / Est:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedItem.actualHours || 0} / {selectedItem.estimatedHours || 0} hrs</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Target Completion:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedItem.targetDate || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={16} className="text-indigo-600" /> Work Progress Updates Log History
              </h4>
              <button
                onClick={() => { setIsDetailModalOpen(false); openUpdateModal(selectedItem); }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
              >
                + Add Update
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {selectedItem.updates && selectedItem.updates.length > 0 ? (
                selectedItem.updates.map((upd, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #4f46e5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{upd.actor}</span>
                      <span>{upd.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.3rem 0' }}>{upd.notes}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.725rem', color: '#64748b', marginTop: '0.4rem' }}>
                      <span>Progress: <strong style={{ color: '#4f46e5' }}>{upd.progress}%</strong></span>
                      <span>Status: <strong>{upd.status}</strong></span>
                      {upd.hoursSpent > 0 && <span>Logged: <strong>+{upd.hoursSpent} hrs</strong></span>}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No updates logged yet.</div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
