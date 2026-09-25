export function downloadTicketsCSV(tickets, filename = 'IT_Helpdesk_Tickets_Report.csv') {
  if (!tickets || tickets.length === 0) return;

  const headers = [
    'Ticket ID',
    'Created At',
    'Status',
    'Priority',
    'Category',
    'Title',
    'Requester Name',
    'Department',
    'Email',
    'Assigned Agent',
    'Resolved At',
    'Resolution Notes'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tickets.map(t => [
    escapeCSV(t.id),
    escapeCSV(t.createdAt),
    escapeCSV(t.status),
    escapeCSV(t.priority),
    escapeCSV(t.category),
    escapeCSV(t.title),
    escapeCSV(t.requesterName),
    escapeCSV(t.department),
    escapeCSV(t.email),
    escapeCSV(t.assignedTo),
    escapeCSV(t.resolvedAt || 'N/A'),
    escapeCSV(t.resolutionNotes || 'N/A')
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadActivityCSV(activities, filename = 'IT_Helpdesk_Activity_Audit_Log.csv') {
  if (!activities || activities.length === 0) return;

  const headers = ['Activity ID', 'Timestamp', 'Ticket ID', 'Action', 'Actor', 'Details'];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = activities.map(a => [
    escapeCSV(a.id),
    escapeCSV(a.timestamp),
    escapeCSV(a.ticketId),
    escapeCSV(a.action),
    escapeCSV(a.actor),
    escapeCSV(a.details)
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
