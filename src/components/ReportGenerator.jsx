import React from 'react';
import { FileText, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

const ReportGenerator = () => {
    const { transactions } = useApp();

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(99, 102, 241); // var(--accent-blue)
            doc.text("Thrifty Financial Report", 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Total Transactions: ${transactions.length}`, 14, 35);

            // Table Header
            let y = 50;
            doc.setFontSize(11);
            doc.setTextColor(255);
            doc.setFillColor(30, 41, 59); // Dark blue header
            doc.rect(14, y - 5, 182, 8, 'F');
            doc.text("Date", 16, y);
            doc.text("Category", 45, y);
            doc.text("Description", 80, y);
            doc.text("Amount (INR)", 160, y);

            // Data Rows
            doc.setTextColor(40);
            y += 10;

            transactions.forEach((t, i) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                const dateStr = t.date ? t.date.split('T')[0] : 'N/A';
                doc.setFontSize(9);
                doc.text(dateStr, 16, y);
                doc.text(t.category || 'Other', 45, y);
                doc.text(t.description?.substring(0, 40) || 'No description', 80, y);

                // Color amount based on type
                if (t.type === 'income') {
                    doc.setTextColor(16, 185, 129); // Green
                } else {
                    doc.setTextColor(244, 63, 94); // Red
                }
                const prefix = t.type === 'income' ? '+' : '-';
                doc.text(`${prefix}${t.amount}`, 160, y);
                doc.setTextColor(40); // Reset to default dark

                y += 8;
                // Subtle line
                doc.setDrawColor(240);
                doc.line(14, y - 5, 196, y - 5);
            });

            doc.save(`thrifty_report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('PDF Report Generated!', { theme: "dark" });
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF");
        }
    };

    const downloadCSV = () => {
        try {
            // Properly format and escape CSV data
            const headers = ["Date", "Type", "Category", "Description", "Amount (INR)"];

            const rows = transactions.map(t => {
                const date = t.date ? t.date.split('T')[0] : 'N/A';
                const type = (t.type || 'expense').toUpperCase();
                const category = t.category || 'Other';
                // Escape quotes and commas in description
                const description = `"${(t.description || '').replace(/"/g, '""')}"`;
                const amount = t.amount;

                return [date, type, category, description, amount].join(",");
            });

            const csvContent = "\uFEFF" // Byte Order Mark for Excel UTF-8 support
                + headers.join(",") + "\n"
                + rows.join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `thrifty_transactions_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('CSV Exported Successfully!', { theme: "dark" });
        } catch (error) {
            console.error("CSV export failed:", error);
            toast.error("Failed to export CSV");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Reports & Analysis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                    onClick={generatePDF}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                        color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                    }}
                >
                    <Download size={16} /> PDF
                </button>
                <button
                    onClick={downloadCSV}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                        color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                    }}
                >
                    <Download size={16} /> Excel/CSV
                </button>
            </div>
        </div>
    );
};

export default ReportGenerator;
