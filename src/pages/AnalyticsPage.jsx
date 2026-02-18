import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../context/AppContext';


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color || entry.stroke || '#fff', margin: 0 }}>
                        {entry.name}: ₹{parseFloat(entry.value).toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AnalyticsPage = () => {
    const { transactions } = useApp();

    // 1. Process Spending Data (by category)
    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            const cat = curr.category || 'Other';
            acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount);
            return acc;
        }, {});

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#8b5cf6'];
    const spendingData = Object.entries(categoryTotals).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.colors?.length || index % 7]
    }));

    // 2. Process Monthly Data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySummary = transactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (!acc[monthYear]) {
            acc[monthYear] = { name: monthYear, income: 0, expense: 0, sortKey: date.getTime() };
        }
        if (t.type === 'income') acc[monthYear].income += parseFloat(t.amount);
        else acc[monthYear].expense += parseFloat(t.amount);
        return acc;
    }, {});

    const monthlyData = Object.values(monthlySummary)
        .sort((a, b) => a.sortKey - b.sortKey)
        .slice(-6); // Only show last 6 months

    if (transactions.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Financial Analytics</h2>
                <div className="glass-panel" style={{ padding: '3rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                        Add some transactions to see your financial analytics here!
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Financial Analytics</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Deep dive into your financial health.</p>
            </header>

            <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(1, 1fr)', gap: '2rem' }}>

                {/* Spending Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{ padding: '2rem' }}
                >
                    <h3 style={{ marginBottom: '2rem' }}>Income vs Expense</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel"
                        style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}
                    >
                        <h3 style={{ marginBottom: '2rem' }}>Expense Breakdown</h3>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={spendingData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {spendingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                                {spendingData.map((entry, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }} />
                                        <span>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Spending Trend */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel"
                        style={{ padding: '2rem' }}
                    >
                        <h3 style={{ marginBottom: '2rem' }}>Monthly Trend</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="expense" stroke="#a855f7" strokeWidth={3} dot={{ stroke: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPage;
