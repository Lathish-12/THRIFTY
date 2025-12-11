import React from 'react';
import { FileText, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

const ReportGenerator = () => {
    const { transactions } = useApp();

    const generatePDF = () => {
        const input = document.getElementById('report-content'); // ID of element to capture
        if (!input) {
            // Fallback if no specific element, just make a simple text PDF
            const doc = new jsPDF();
            doc.text("Thrifty Expense Report", 10, 10);
            transactions.forEach((t, i) => {
                doc.text(`${t.date.split('T')[0]} - ${t.description}: ${t.amount} (${t.type})`, 10, 20 + (i * 10));
            });
            doc.save('thrifty-report.pdf');
            toast.success('Report downloaded!', { theme: "dark" });
            return;
        }

        html2canvas(input, { backgroundColor: '#0f172a' }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('thrifty-visual-report.pdf');
            toast.success('Visual Report downloaded!', { theme: "dark" });
        });
    };

    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Type,Category,Description,Amount\n"
            + transactions.map(t => `${t.date},${t.type},${t.category},${t.description},${t.amount}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "thrifty_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV Exported!', { theme: "dark" });
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
