import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Send, Bot, User, Trash2,
    Zap, Lightbulb, RefreshCw, Cpu
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const AIAdvisor = ({ transactions }) => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "👋 Hello! I'm your **Thrifty AI Advisor**, powered by Ollama running privately on your machine. I can analyze your spending, help plan budgets, and give you personalised financial tips. How can I help you today?",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [ollamaOnline, setOllamaOnline] = useState(null); // null = checking
    const [ollamaModel, setOllamaModel] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

    // Check Ollama status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/users/ai/status/');
                setOllamaOnline(res.data.ollama);
                setOllamaModel(res.data.ollama_model || 'deepseek-r1:1.5b');
            } catch {
                setOllamaOnline(false);
            }
        };
        checkStatus();
    }, []);

    // Smart suggestions based on transactions
    const getSmartSuggestions = () => {
        if (transactions.length === 0) {
            return ['How do I start budgeting?', 'Financial tips for beginners', 'What is the 50/30/20 rule?'];
        }
        const expenses = transactions.filter(t => t.type === 'expense');
        const totalExpense = expenses.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
        const totalIncome = transactions.filter(t => t.type === 'income')
            .reduce((a, b) => a + parseFloat(b.amount || 0), 0);
        const suggestions = ['Analyze my spending habits', 'How can I save more?', 'Show my budget status'];
        if (totalIncome - totalExpense < 0) suggestions.push('Help me reduce expenses');
        else suggestions.push('Investment suggestions for my surplus');
        if (expenses.length > 5) suggestions.push('What is my highest spending category?');
        return suggestions.slice(0, 5);
    };

    const [suggestedPrompts, setSuggestedPrompts] = useState(getSmartSuggestions());
    useEffect(() => { setSuggestedPrompts(getSmartSuggestions()); }, [transactions]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', text, type: 'text' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Build history for Ollama multi-turn (exclude the initial greeting)
            const history = messages
                .filter(m => m.role === 'user' || m.role === 'ai')
                .slice(-12) // last 6 exchanges
                .map(m => ({
                    role: m.role === 'ai' ? 'assistant' : 'user',
                    content: m.text
                }));

            const response = await api.post('/users/ai/chat/', {
                message: text,
                history   // send full conversation history
            });
            setMessages(prev => [...prev, {
                role: 'ai',
                text: response.data.response,
                type: response.data.type || 'text',
                poweredBy: response.data.powered_by
            }]);
            setIsTyping(false);
            setSuggestedPrompts(getSmartSuggestions());
        } catch (error) {
            console.error('AI Chat Error:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: "⚠️ I couldn't connect to Ollama right now.\n\nPlease make sure **Ollama is running** on your machine:\n1. Open Ollama from your system tray\n2. Or run: `ollama serve` in a terminal\n3. Then try again!",
                type: 'text'
            }]);
            toast.error('Ollama connection failed. Is Ollama running?');
        }
    };

    const handleClear = () => {
        setMessages([{
            role: 'ai',
            text: "💬 Chat cleared! What would you like to know about your finances?",
            type: 'text'
        }]);
    };

    // Render **bold** markdown
    const renderText = (text, role) =>
        text.split('**').map((part, i) =>
            i % 2 === 1
                ? <strong key={i} style={{ color: role === 'ai' ? '#10b981' : 'white', fontWeight: 700 }}>{part}</strong>
                : part
        );

    // Status colour
    const statusColor = ollamaOnline === null ? '#6366f1' : ollamaOnline ? '#10b981' : '#ef4444';
    const statusLabel = ollamaOnline === null ? 'Checking...' : ollamaOnline ? `Online · ${ollamaModel}` : 'Offline — start Ollama';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '680px', gap: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                }}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(99,102,241,0.08))',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Ollama avatar */}
                        <motion.div
                            animate={{ boxShadow: ['0 4px 20px rgba(16,185,129,0.3)', '0 4px 30px rgba(16,185,129,0.6)', '0 4px 20px rgba(16,185,129,0.3)'] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                padding: '10px', borderRadius: '12px', display: 'flex', flexShrink: 0
                            }}
                        >
                            <Bot size={22} color="white" />
                        </motion.div>

                        <div>
                            <h3 style={{
                                fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem',
                                background: 'linear-gradient(135deg, #10b981, #6366f1)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                                Thrifty AI Advisor
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem' }}>
                                {/* Ollama badge */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: ollamaOnline ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                    border: `1px solid ${ollamaOnline ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.3)'}`,
                                    borderRadius: '20px', padding: '3px 10px',
                                    color: statusColor
                                }}>
                                    <motion.span
                                        animate={{ opacity: ollamaOnline ? [1, 0.3, 1] : 1 }}
                                        transition={{ duration: 1.8, repeat: Infinity }}
                                        style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            background: statusColor, display: 'inline-block'
                                        }}
                                    />
                                    🦙 Ollama · {statusLabel}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                            onClick={async () => {
                                setSuggestedPrompts(getSmartSuggestions());
                                try {
                                    const res = await api.get('/users/ai/status/');
                                    setOllamaOnline(res.data.ollama);
                                    setOllamaModel(res.data.ollama_model || 'deepseek-r1:1.5b');
                                } catch { }
                            }}
                            title="Refresh status"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '0.5rem',
                                cursor: 'pointer', color: 'var(--text-secondary)'
                            }}
                        >
                            <RefreshCw size={16} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                            onClick={handleClear} title="Clear chat"
                            style={{
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '8px', padding: '0.5rem',
                                cursor: 'pointer', color: '#ef4444'
                            }}
                        >
                            <Trash2 size={16} />
                        </motion.button>
                    </div>
                </div>

                {/* Offline warning banner */}
                {ollamaOnline === false && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(239,68,68,0.07)',
                            borderBottom: '1px solid rgba(239,68,68,0.2)',
                            padding: '0.65rem 1.5rem',
                            fontSize: '0.8rem', color: '#f87171',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <Cpu size={14} />
                        Ollama is offline. Open Ollama from your system tray or run <code style={{ background: 'rgba(239,68,68,0.15)', padding: '1px 6px', borderRadius: '4px', marginLeft: '4px' }}>ollama serve</code> in a terminal.
                    </motion.div>
                )}

                {/* ── Messages ─────────────────────────────────────────── */}
                <div style={{
                    flex: 1, padding: '1.5rem',
                    overflowY: 'auto', display: 'flex',
                    flexDirection: 'column', gap: '1.25rem',
                    scrollBehavior: 'smooth'
                }}>
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '88%', display: 'flex', gap: '0.7rem',
                                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                                    background: msg.role === 'user'
                                        ? 'var(--bg-secondary)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginTop: '4px',
                                    boxShadow: msg.role === 'ai' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                                }}>
                                    {msg.role === 'user' ? <User size={16} /> : <span style={{ fontSize: '16px' }}>🦙</span>}
                                </div>

                                {/* Bubble */}
                                <div style={{
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'rgba(255,255,255,0.04)',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '16px',
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                                    borderTopLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.75', fontSize: '0.93rem',
                                    border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.07)' : 'none',
                                    whiteSpace: 'pre-line', flex: 1,
                                    backdropFilter: msg.role === 'ai' ? 'blur(8px)' : 'none'
                                }}>
                                    {renderText(msg.text, msg.role)}

                                    {/* Powered-by badge */}
                                    {msg.role === 'ai' && msg.poweredBy && (
                                        <div style={{
                                            marginTop: '0.7rem', paddingTop: '0.6rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            fontSize: '0.72rem', color: '#10b981',
                                            display: 'flex', alignItems: 'center', gap: '5px'
                                        }}>
                                            <span>🦙</span> {msg.poweredBy}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', gap: '0.7rem', alignSelf: 'flex-start' }}
                        >
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                            }}>
                                <span style={{ fontSize: '16px' }}>🦙</span>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem 1.4rem', borderRadius: '16px', borderTopLeftRadius: '4px',
                                display: 'flex', gap: '6px', alignItems: 'center',
                                border: '1px solid rgba(255,255,255,0.07)'
                            }}>
                                {[0, 1, 2].map(i => (
                                    <motion.div key={i}
                                        style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}
                                        animate={{ y: [0, -8, 0], opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                ))}
                                <span style={{ fontSize: '0.8rem', color: '#10b981', marginLeft: '4px' }}>
                                    Ollama is thinking...
                                </span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input Area ────────────────────────────────────────── */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: 'rgba(15,23,42,0.85)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Smart suggestions */}
                    <div style={{
                        display: 'flex', gap: '0.5rem', marginBottom: '1rem',
                        overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'thin'
                    }}>
                        <AnimatePresence>
                            {suggestedPrompts.map((prompt, idx) => (
                                <motion.button
                                    key={prompt}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend(prompt)}
                                    disabled={isTyping}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1))',
                                        border: '1px solid rgba(16,185,129,0.25)',
                                        padding: '0.45rem 1rem', borderRadius: '20px',
                                        color: '#6ee7b7', fontSize: '0.82rem',
                                        cursor: isTyping ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap', fontWeight: 500,
                                        opacity: isTyping ? 0.5 : 1, transition: 'all 0.2s'
                                    }}
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Input row */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                id="ai-advisor-input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask me anything about your finances..."
                                disabled={isTyping}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '0.9rem 1rem 0.9rem 3rem',
                                    borderRadius: '14px', color: 'white',
                                    outline: 'none', fontSize: '0.93rem', transition: 'all 0.2s'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = '#10b981';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <Zap size={16} style={{
                                position: 'absolute', left: '1rem',
                                top: '50%', transform: 'translateY(-50%)', color: '#10b981'
                            }} />
                        </div>
                        <motion.button
                            id="ai-send-button"
                            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            style={{
                                background: input.trim() && !isTyping
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : 'rgba(255,255,255,0.05)',
                                border: 'none', padding: '0.9rem', borderRadius: '14px',
                                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                minWidth: '52px', transition: 'all 0.2s',
                                boxShadow: input.trim() && !isTyping ? '0 4px 14px rgba(16,185,129,0.35)' : 'none'
                            }}
                        >
                            <Send size={18} color={input.trim() && !isTyping ? 'white' : '#64748b'} />
                        </motion.button>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '0.6rem', fontSize: '0.72rem',
                        color: 'var(--text-secondary)', textAlign: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}>
                        <Lightbulb size={12} />
                        🦙 Powered by Ollama — 100% private, runs on your machine, completely free
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIAdvisor;
