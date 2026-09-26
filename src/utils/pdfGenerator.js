import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateManagementPDFReport(stats, tickets, activities, dateRangeLabel = 'All Dates') {
  const doc = new jsPDF();
  const nowStr = new Date().toLocaleString();

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SIHPL HELPDESK MANAGEMENT REPORT', 14, 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Date Range: ${dateRangeLabel}  |  Generated On: ${nowStr}`, 14, 25);
  doc.text(`Host: Local IT Operations Server`, 14, 31);

  // Executive Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, 182, 32, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE PERFORMANCE SUMMARY', 20, 53);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Tickets Raised: ${stats.total}`, 20, 62);
  doc.text(`Open Tickets: ${stats.open}`, 20, 69);
  
  doc.text(`In Progress: ${stats.inProgress}`, 90, 62);
  doc.text(`Resolved / Closed: ${stats.resolved}`, 90, 69);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`Resolution Rate: ${stats.resolutionRate}%`, 150, 62);

  // Category Breakdown Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Category & Priority Distribution', 14, 86);

  const catRows = stats.categoryList.map(c => [c.name, c.count]);
  
  doc.autoTable({
    startY: 90,
    head: [['Category', 'Ticket Volume']],
    body: catRows,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 110 }
  });

  const prioRows = stats.priorityList.map(p => [p.name, p.count]);
  
  doc.autoTable({
    startY: 90,
    head: [['Priority Level', 'Count']],
    body: prioRows,
    theme: 'striped',
    headStyles: { fillColor: [6, 182, 212] },
    margin: { left: 110, right: 14 }
  });

  // Recent Tickets Overview Table
  const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 140;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Ticket Resolution & Creation Records', 14, currentY);

  const ticketRows = tickets.slice(0, 10).map(t => [
    t.id,
    t.createdAt,
    t.category,
    t.priority,
    t.status,
    t.requesterName,
    t.assignedTo
  ]);

  doc.autoTable({
    startY: currentY + 4,
    head: [['ID', 'Created Date & Time', 'Category', 'Priority', 'Status', 'Requester', 'Assigned Agent']],
    body: ticketRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    styles: { fontSize: 8 }
  });

  // Save the PDF
  doc.save(`IT_Helpdesk_Management_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
