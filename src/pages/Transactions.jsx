import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ReceiptUpload from '../components/ReceiptUpload'; // Not used directly, but part of Form
import ReportGenerator from '../components/ReportGenerator';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';



const TransactionsPage = () => {
    const { transactions, deleteTransaction } = useApp();
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        // Scroll to top to show the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingTransaction(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid-layout"
        >
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TransactionForm editingTransaction={editingTransaction} onCancel={cancelEdit} />
                <ReportGenerator />
            </div>
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TransactionList
                    transactions={transactions}
                    onDelete={deleteTransaction}
                    onEdit={handleEdit}
                />


            </div>
        </motion.div>
    );
};


export default TransactionsPage;
