import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Trophy, RefreshCcw, Coins, Gem, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { toast } from 'react-toastify';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#ec4899', '#8b5cf6'];

const Dashboard = ({ transactions }) => {
    const { formatCurrency, level, points, nextThreshold, user, fetchUserData } = useApp();





    // Calculate total income, expense, balance
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const balance = totalIncome - totalExpense;

    // Currency & Commodity State
    const [rates, setRates] = useState({ USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.79 });
    const [metals, setMetals] = useState({ gold: 15928, silver: 253 });
    const [isLive, setIsLive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch USD → INR (consistent with MetalsPage)
                const currRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const currData = await currRes.json();
                const usdToInr = currData?.rates?.INR || 84.0;

                // Build forex rates (convert from USD base to INR base)
                if (currData?.rates) {
                    const inrBase = {
                        USD: 1 / usdToInr,
                        EUR: (1 / usdToInr) / (1 / currData.rates.EUR),
                        GBP: (1 / usdToInr) / (1 / currData.rates.GBP),
                    };
                    // Simpler: rates relative to 1 INR
                    setRates({
                        USD: 1 / usdToInr,
                        EUR: (currData.rates.EUR || 0.011) / usdToInr,
                        GBP: (currData.rates.GBP || 0.0094) / usdToInr,
                        JPY: (currData.rates.JPY || 1.79) / usdToInr,
                    });
                }

                try {
                    // Correct endpoints: /price/XAU for Gold, /price/XAG for Silver
                    const [goldRes, silverRes] = await Promise.all([
                        fetch('https://api.gold-api.com/price/XAU'),
                        fetch('https://api.gold-api.com/price/XAG'),
                    ]);
                    const goldData = await goldRes.json();
                    const silverData = await silverRes.json();

                    // Price per troy oz (USD) ÷ 31.1035 g/troy oz × INR rate
                    const goldRate = (goldData.price / 31.1035) * usdToInr;
                    const silverRate = (silverData.price / 31.1035) * usdToInr;
                    setMetals({ gold: goldRate || 9500, silver: silverRate || 105 });
                } catch (metalErr) {
                    console.warn('Metal price fetch failed:', metalErr);
                    setMetals({ gold: 9500, silver: 105 });
                }

                setIsLive(true);
                setLastUpdate(new Date().toLocaleTimeString());
            } catch (error) {
                console.warn('Dashboard market data fetch failed:', error);
                setMetals({ gold: 9500, silver: 105 });
            }
        };

        fetchAllData();
        const interval = setInterval(fetchAllData, 600000);
        return () => clearInterval(interval);
    }, []);

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


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ gridColumn: 'span 8', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))' }}
            >
                <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Balance</p>
                    <h2 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {formatCurrency(balance)}
                    </h2>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%' }}>
                    <Wallet size={38} color="#818cf8" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Thrifty Status</span>
                    <Trophy size={18} color="#f59e0b" />
                </div>
                <h3 style={{ fontSize: '1.8rem', color: '#f59e0b' }}>Level {level}</h3>
                <div style={{ marginTop: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                        <span>{points} pts</span>
                        <span>{nextThreshold} pts</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.min((points / nextThreshold) * 100, 100)}%`,
                                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                borderRadius: '3px',
                                transition: 'width 0.5s ease-out'
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-panel"
                style={{ gridColumn: 'span 12', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}
            >
                {(() => {
                    const now = new Date();
                    const transThisMonth = transactions.filter(t => new Date(t.date).getMonth() === now.getMonth());
                    const avgTrans = transactions.length > 0 ? (transactions.reduce((a, b) => a + Number(b.amount), 0) / transactions.length) : 0;
                    const topCat = categoryData.reduce((prev, curr) => (curr.value > (prev?.value || 0) ? curr : prev), null)?.name || '—';

                    return [
                        { title: 'Monthly Txns', value: transThisMonth.length },
                        { title: 'Avg Amount', value: formatCurrency(avgTrans) },
                        { title: 'Top Category', value: topCat },
                        { title: 'Wallet Rank', value: level > 3 ? 'Elite' : 'Starter' }
                    ].map((s) => (
                        <div key={s.title} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.title}</p>
                            <h4 style={{ fontSize: '1.1rem' }}>{s.value}</h4>
                        </div>
                    ));
                })()}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel"
                style={{ gridColumn: 'span 8', padding: '2rem', minHeight: '300px' }}
            >
                <h3 style={{ marginBottom: '1.5rem' }}>Spending Analysis</h3>
                {categoryData.length > 0 ? (
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={categoryData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {categoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(v) => formatCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                            {categoryData.map((e, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                                    <span>{e.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No data yet.</div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-panel"
                style={{ gridColumn: 'span 4', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(148, 163, 184, 0.05))' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Metal Rates</h3>
                    {isLive && <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.6rem', color: '#10b981' }}>LIVE</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <MetalItem label="Gold 24K" value={metals.gold} icon={<Gem size={16} />} color="#f59e0b" balance={balance} />
                    <MetalItem label="Silver" value={metals.silver} icon={<Coins size={16} />} color="#94a3b8" balance={balance} />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel"
                style={{ gridColumn: 'span 12', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}
            >
                <div style={{ flex: '0 0 auto' }}>
                    <h3 style={{ fontSize: '1rem' }}>Global Forex</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Base ₹1</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <CurrencyBadge label="USD" value={rates.USD} symbol="$" color="#3b82f6" />
                    <CurrencyBadge label="EUR" value={rates.EUR} symbol="€" color="#10b981" />
                    <CurrencyBadge label="GBP" value={rates.GBP} symbol="£" color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Updated: {lastUpdate}</div>
            </motion.div>
        </div>
    );
};

const MetalItem = ({ label, value, icon, color, balance }) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '12px', border: `1px solid ${color}33` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color, fontWeight: '600', fontSize: '0.85rem' }}>{icon} {label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>₹{value.toLocaleString()} <span style={{ fontSize: '0.6rem' }}>/gm</span></span>
        </div>
        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Buy power: <span style={{ color, fontWeight: 'bold' }}>{(balance / value).toFixed(3)}g</span></p>
    </div>
);

const CurrencyBadge = ({ label, value, symbol, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${color}22` }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color }}>{label}</span>
        <span style={{ fontSize: '0.85rem' }}>{symbol}{value?.toFixed(4)}</span>
    </div>
);

export default Dashboard;
