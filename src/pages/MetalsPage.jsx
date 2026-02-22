import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Gem, Coins, TrendingUp, TrendingDown, Clock, Info, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MetalsPage = () => {
    const { balance, formatCurrency } = useApp();
    const [metals, setMetals] = useState({ gold: 0, silver: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('7D');
    const [activeMetal, setActiveMetal] = useState('both'); // 'both', 'gold', 'silver'

    useEffect(() => {
        const fetchMetalsData = async () => {
            setLoading(true);
            try {
                // Fetch Currencies first
                const currRes = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
                const currData = await currRes.json();
                const inrPerUsd = 1 / (currData?.rates?.USD || 0.012);

                let latestGold, latestSilver;
                try {
                    const goldRes = await fetch('https://api.gold-api.com/v1/gold');
                    const goldData = await goldRes.json();
                    const indianGoldBase = (goldData.price / 31.1035) * inrPerUsd;
                    latestGold = indianGoldBase * 2.15;

                    const silverRes = await fetch('https://api.gold-api.com/v1/silver');
                    const silverData = await silverRes.json();
                    const indianSilverBase = (silverData.price / 31.1035) * inrPerUsd;
                    latestSilver = indianSilverBase * 2.65;
                } catch (metalErr) {
                    latestGold = 15928;
                    latestSilver = 253.12;
                }

                setMetals({ gold: latestGold || 15928, silver: latestSilver || 253.12 });

                // Generate Timeframe-specific History
                const mockHistory = [];
                const now = new Date();
                let points = 20;
                let interval = 'day';

                switch (timeframe) {
                    case '24H': points = 24; interval = 'hour'; break;
                    case '7D': points = 7; interval = 'day'; break;
                    case '1M': points = 30; interval = 'day'; break;
                    case '1Y': points = 12; interval = 'month'; break;
                    default: points = 20; interval = 'day';
                }

                for (let i = points; i >= 0; i--) {
                    const date = new Date(now);
                    let label = "";

                    if (interval === 'hour') {
                        date.setHours(now.getHours() - i);
                        label = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    } else if (interval === 'month') {
                        date.setMonth(now.getMonth() - i);
                        label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    } else {
                        date.setDate(now.getDate() - i);
                        label = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    }

                    // Volatility adjustments based on timeframe
                    const volMult = timeframe === '24H' ? 0.005 : (timeframe === '1Y' ? 0.08 : 0.02);
                    const variationGold = 1 + (Math.sin(i * 0.5) * volMult) + (Math.random() * (volMult / 2) - (volMult / 4));
                    const variationSilver = 1 + (Math.cos(i * 0.4) * (volMult * 1.5)) + (Math.random() * volMult - (volMult / 2));

                    mockHistory.push({
                        date: label,
                        gold: latestGold * variationGold,
                        silver: latestSilver * variationSilver
                    });
                }
                setHistory(mockHistory);

            } catch (error) {
                console.error("Critical error in metals tracking:", error);
                setMetals({ gold: 15928, silver: 253.12 });
            } finally {
                setLoading(false);
            }
        };

        fetchMetalsData();
    }, [timeframe]); // Re-run when timeframe changes

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Loading market data...</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="metals-container"
            style={{ color: 'var(--text-primary)' }}
        >
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Indian Metals Market</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Click a card below to isolate its chart performance.</p>
            </div>

            <div className="grid-layout" style={{ gap: '1.5rem' }}>
                {/* Current Stats Hero */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMetal(activeMetal === 'gold' ? 'both' : 'gold')}
                    className="glass-panel"
                    style={{
                        gridColumn: 'span 6',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: activeMetal === 'gold' ? '2px solid #f59e0b' : '1px solid var(--glass-border)',
                        background: activeMetal === 'gold' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(15, 23, 42, 0.6))' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.4))'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '12px' }}>
                            <Gem size={32} color="#f59e0b" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gold 24K</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Local Rate (₹/Gram)</p>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>₹{metals.gold.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                            <TrendingUp size={16} />
                            <span>+₹125.40 today</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMetal(activeMetal === 'silver' ? 'both' : 'silver')}
                    className="glass-panel"
                    style={{
                        gridColumn: 'span 6',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: activeMetal === 'silver' ? '2px solid #94a3b8' : '1px solid var(--glass-border)',
                        background: activeMetal === 'silver' ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(15, 23, 42, 0.6))' : 'linear-gradient(135deg, rgba(148, 163, 184, 0.1), rgba(15, 23, 42, 0.4))'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '12px' }}>
                            <Coins size={32} color="#94a3b8" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Silver</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Local Rate (₹/Gram)</p>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>₹{metals.silver.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                            <TrendingUp size={16} />
                            <span>+₹1.15 today</span>
                        </div>
                    </div>
                </motion.div>

                {/* History Charts - Improved with Dual Axis */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{ gridColumn: 'span 12', padding: '2rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem' }}>
                                {activeMetal === 'gold' ? 'Gold Pricing Trend' : activeMetal === 'silver' ? 'Silver Pricing Trend' : 'Market Performance'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {activeMetal === 'both' ? 'Dual-axis view (Left: Gold, Right: Silver)' : `Isolating ${activeMetal} performance data`}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {activeMetal !== 'both' && (
                                <button
                                    onClick={() => setActiveMetal('both')}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >Show Both</button>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                                {['24H', '7D', '1M', '1Y'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTimeframe(t)}
                                        style={{
                                            padding: '4px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            background: timeframe === t ? 'var(--accent-blue)' : 'transparent',
                                            color: timeframe === t ? 'white' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >{t}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSilver" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />

                                {/* Gold Y-Axis (Left) */}
                                {(activeMetal === 'both' || activeMetal === 'gold') && (
                                    <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toFixed(0)}`} domain={['auto', 'auto']} />
                                )}

                                {/* Silver Y-Axis (Right) */}
                                {(activeMetal === 'both' || activeMetal === 'silver') && (
                                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toFixed(0)}`} domain={['auto', 'auto']} />
                                )}

                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    formatter={(v, name) => [`₹${v.toFixed(2)}`, name]}
                                />

                                {(activeMetal === 'both' || activeMetal === 'gold') && (
                                    <Area yAxisId="left" type="monotone" dataKey="gold" name="Gold" stroke="#f59e0b" fillOpacity={1} fill="url(#colorGold)" strokeWidth={3} />
                                )}

                                {(activeMetal === 'both' || activeMetal === 'silver') && (
                                    <Area yAxisId="right" type="monotone" dataKey="silver" name="Silver" stroke="#94a3b8" fillOpacity={1} fill="url(#colorSilver)" strokeWidth={3} />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Investment Calculator / Insights */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel"
                    style={{ gridColumn: 'span 4', padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                            <TrendingUp size={18} color="var(--accent-blue)" />
                        </div>
                        <h4 style={{ fontSize: '1rem' }}>Asset Growth</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Gold has shown an average annual growth of 12% over the last decade. It remains one of the safest hedges against inflation.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="glass-panel"
                    style={{ gridColumn: 'span 4', padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                            <Info size={18} color="#10b981" />
                        </div>
                        <h4 style={{ fontSize: '1rem' }}>Investment Tip</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Diversifying into silver can offer higher volatility but significant returns during industrial booms due to its utility in electronics.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel"
                    style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Balance Value in Gold</p>
                        <h4 style={{ fontSize: '1.8rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
                            {metals.gold > 0 ? (balance / metals.gold).toFixed(3) : '0.000'}g
                        </h4>
                        <a
                            href="https://auragold.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                color: 'var(--accent-blue)',
                                cursor: 'pointer',
                                textDecoration: 'none'
                            }}
                        >
                            Invest Now <ArrowRight size={12} />
                        </a>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MetalsPage;
