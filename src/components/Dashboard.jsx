import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#ec4899', '#8b5cf6'];

const Dashboard = ({ transactions }) => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const balance = totalIncome - totalExpense;

    // Prepare data for chart (Expenses by Category)
    const categoryData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            const existing = acc.find(item => item.name === curr.category);
            if (existing) {
                existing.value += Number(curr.amount);
            } else {
                acc.push({ name: curr.category, value: Number(curr.amount) });
            }
            return acc;
        }, []);

    return (
        <div className="grid-layout" style={{ marginBottom: '2rem' }}>
            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ gridColumn: 'span 12', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.05))' }}
            >
                <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Balance</p>
                    <h2 style={{ fontSize: '2.5rem' }}>{formatCurrency(balance)}</h2>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%' }}>
                    <Wallet size={32} color="#818cf8" />
                </div>
            </motion.div>

            {/* Income Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ gridColumn: 'span 6', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                    <TrendingUp size={24} color="#10b981" />
                </div>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Income</p>
                    <h3 style={{ color: '#10b981' }}>{formatCurrency(totalIncome)}</h3>
                </div>
            </motion.div>

            {/* Expense Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel"
                style={{ gridColumn: 'span 6', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
                <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.2)', borderRadius: '12px' }}>
                    <TrendingDown size={24} color="#f43f5e" />
                </div>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Expenses</p>
                    <h3 style={{ color: '#f43f5e' }}>{formatCurrency(totalExpense)}</h3>
                </div>
            </motion.div>

            {/* Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel"
                style={{ gridColumn: 'span 12', padding: '2rem', minHeight: '300px' }}
            >
                <h3 style={{ marginBottom: '1.5rem' }}>Spending Analysis</h3>
                {categoryData.length > 0 ? (
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                            {categoryData.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                    <span>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        No expense data to analyze yet using AI.
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
