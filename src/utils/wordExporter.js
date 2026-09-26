export function downloadTicketsWord(tickets, filename = 'IT_Tickets_Report.doc') {
  if (!tickets || tickets.length === 0) return;

  const tableRows = tickets.map(t => `
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(t.id)}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(t.status)}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(t.category)}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(t.title)}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(t.requesterName)}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(t.department)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>SIHPL Helpdesk - IT Tickets Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #1e293b; }
        h2 { color: #4f46e5; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #4f46e5; color: #ffffff; border: 1px solid #3730a3; padding: 10px; text-align: left; font-size: 11pt; }
        td { font-size: 10pt; text-align: left; }
        tr:nth-child(even) { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <h2>SIHPL Helpdesk - IT Tickets Report</h2>
      <table>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Status</th>
            <th>Category</th>
            <th>Title</th>
            <th>Requester Name</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
