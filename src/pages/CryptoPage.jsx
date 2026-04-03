import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bitcoin, TrendingUp, Wallet, ArrowRight, Activity, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COINS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'polkadot', 'chainlink'];

const CryptoPage = () => {
    const { balance, formatCurrency } = useApp();
    const [cryptoData, setCryptoData] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('24H');
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

    const [searchTerm, setSearchTerm] = useState('');

    const filteredCoins = cryptoData.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchCryptoRates = async () => {
            try {
                const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${COINS.join(',')}&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h`);
                const data = await res.json();
                setCryptoData(data);
                if (!selectedCoin && data.length > 0) setSelectedCoin(data[0]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching crypto rates:", error);
                setLoading(false);
            }
        };

        fetchCryptoRates();
        const interval = setInterval(fetchCryptoRates, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedCoin) return;

        const generateHistory = () => {
            const mockHistory = [];
            const now = new Date();
            let points = timeframe === '24H' ? 24 : timeframe === '7D' ? 7 : timeframe === '1M' ? 30 : 12;
            let interval = timeframe === '24H' ? 'hour' : timeframe === '1Y' ? 'month' : 'day';

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

                const basePrice = selectedCoin.current_price;
                const vol = timeframe === '24H' ? 0.02 : timeframe === '1Y' ? 0.25 : 0.08;
                const variation = 1 + (Math.sin(i * 0.8) * vol) + (Math.random() * (vol / 2) - (vol / 4));

                mockHistory.push({
                    date: label,
                    price: basePrice * variation
                });
            }
            setHistory(mockHistory);
        };

        generateHistory();
    }, [selectedCoin, timeframe]);

    if (loading && cryptoData.length === 0) {
        return (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Syncing Live Market Data...</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="crypto-container"
            style={{ color: 'var(--text-primary)' }}
        >
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Crypto Market</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Live tracking inspired by Investing.com Terminal</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                    >Insights View</button>
                    <button
                        onClick={() => setViewMode('table')}
                        style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: viewMode === 'table' ? 'var(--accent-blue)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                    >Market Table</button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid-layout" style={{ gap: '1.5rem' }}>
                    {/* Market Sidebar */}
                    <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="glass-panel" style={{ padding: '1.2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Search market tokens..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 1rem 0.7rem 2.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                            {filteredCoins.length > 0 ? (
                                filteredCoins.map((coin) => (
                                    <motion.div
                                        key={coin.id}
                                        whileHover={{ x: 5 }}
                                        onClick={() => setSelectedCoin(coin)}
                                        className="glass-panel"
                                        style={{
                                            padding: '1.2rem',
                                            cursor: 'pointer',
                                            border: selectedCoin?.id === coin.id ? '2px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                                            background: selectedCoin?.id === coin.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ position: 'relative' }}>
                                                <img src={coin.image} alt={coin.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                                <div style={{ position: 'absolute', bottom: -2, right: -2, width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', border: '2px solid var(--bg-primary)' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{coin.name}</h4>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{coin.symbol}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>₹{coin.current_price.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: coin.price_change_percentage_24h >= 0 ? '#10b981' : '#f43f5e' }}>
                                                <TrendingUp size={12} style={{ transform: coin.price_change_percentage_24h < 0 ? 'rotate(180deg)' : 'none' }} />
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No tokens found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Technical Analysis & Main Chart */}
                    <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {selectedCoin && (
                            <motion.div
                                key={selectedCoin.id}
                                initial={{ scale: 0.98, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="glass-panel"
                                style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 0.6))' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
                                        <img src={selectedCoin.image} alt={selectedCoin.name} style={{ width: '72px', height: '72px' }} />
                                        <div>
                                            <h2 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.02em' }}>{selectedCoin.name} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{selectedCoin.symbol}</span></h2>
                                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                                                <span style={{ color: 'white', background: 'rgba(99, 102, 241, 0.4)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>#{selectedCoin.market_cap_rank} BY CAP</span>
                                                <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Live Node</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '2.8rem', fontWeight: '800' }}>₹{selectedCoin.current_price.toLocaleString()}</div>
                                        <div style={{ color: selectedCoin.price_change_percentage_24h >= 0 ? '#10b981' : '#f43f5e', fontSize: '1.1rem', fontWeight: '600' }}>
                                            {selectedCoin.price_change_percentage_24h > 0 ? '+' : ''}{selectedCoin.price_change_percentage_24h.toLocaleString()} ({selectedCoin.price_change_percentage_24h.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Market Depth (Last {timeframe})</h3>
                                    <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                                        {['24H', '7D', '1M', '1Y'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTimeframe(t)}
                                                style={{
                                                    padding: '5px 15px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    background: timeframe === t ? 'var(--accent-blue)' : 'transparent',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >{t}</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ height: '320px', width: '100%' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={history}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis hide domain={['auto', 'auto']} />
                                            <Tooltip
                                                contentStyle={{ background: '#0f172a', border: '1px solid var(--accent-blue)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: 'white' }}
                                                formatter={(v) => [`₹${v.toLocaleString()}`, 'Rate']}
                                            />
                                            <Area type="monotone" dataKey="price" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={4} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid-layout" style={{ gap: '1.5rem' }}>
                            <div className="glass-panel" style={{ gridColumn: 'span 7', padding: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                                        <div style={{ padding: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px' }}>
                                            <Wallet size={24} color="#f59e0b" />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Allocation Insight</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Based on Wallet Balance</p>
                                        </div>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>
                                        {selectedCoin ? (balance / selectedCoin.current_price).toFixed(6) : '0.000'} <span style={{ fontSize: '1rem', color: 'var(--accent-blue)' }}>{selectedCoin?.symbol.toUpperCase()}</span>
                                    </h3>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                                        Invest Now <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ gridColumn: 'span 5', padding: '1.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
                                        <Activity size={20} color="#10b981" />
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem' }}>Terminal Stats</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Market Cap</span>
                                        <span style={{ fontWeight: '600' }}>₹{(selectedCoin?.market_cap / 10000000).toLocaleString()} Cr</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Vol % (24h)</span>
                                        <span style={{ fontWeight: '600', color: selectedCoin?.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444' }}>
                                            {selectedCoin?.price_change_percentage_24h >= 0 ? '+' : ''}{selectedCoin?.price_change_percentage_24h?.toFixed(2)}% Move
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Sentiment</span>
                                        <span style={{ fontWeight: '600', color:
                                            selectedCoin?.price_change_percentage_24h > 3 ? '#10b981' :
                                            selectedCoin?.price_change_percentage_24h > 0 ? '#6366f1' :
                                            selectedCoin?.price_change_percentage_24h > -3 ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {selectedCoin?.price_change_percentage_24h > 3 ? 'STRONG BUY' :
                                             selectedCoin?.price_change_percentage_24h > 0 ? 'BULLISH' :
                                             selectedCoin?.price_change_percentage_24h > -3 ? 'CAUTIOUS' : 'BEARISH'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ width: '100%', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}># RANK</th>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>NAME / SYMBOL</th>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>LIVE PRICE</th>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>24H CHANGE</th>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>MARKET CAP (₹)</th>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>VOLUME (24H)</th>
                                    <th style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoins.map((coin) => (
                                    <tr
                                        key={coin.id}
                                        onClick={() => { setSelectedCoin(coin); setViewMode('grid'); }}
                                        style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.2rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{coin.market_cap_rank}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <img src={coin.image} alt={coin.name} style={{ width: '28px', height: '28px' }} />
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{coin.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{coin.symbol}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem', fontWeight: '800' }}>₹{coin.current_price.toLocaleString()}</td>
                                        <td style={{ padding: '1.2rem', fontWeight: '600', color: coin.price_change_percentage_24h >= 0 ? '#10b981' : '#f43f5e' }}>
                                            {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                        </td>
                                        <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>₹{(coin.market_cap / 100000000).toFixed(2)}B</td>
                                        <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>₹{(coin.total_volume / 100000000).toFixed(2)}B</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <button style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Trade</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CryptoPage;
