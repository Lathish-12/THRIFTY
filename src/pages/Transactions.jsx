import React from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ReceiptUpload from '../components/ReceiptUpload'; // Not used directly, but part of Form
import ReportGenerator from '../components/ReportGenerator';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const TransactionsPage = () => {
    const { transactions, deleteTransaction } = useApp();

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid-layout"
        >
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <TransactionForm />
                <ReportGenerator />
            </div>
            <div style={{ gridColumn: 'span 8' }}>
                <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </div>
        </motion.div>
    );
};

export default TransactionsPage;
