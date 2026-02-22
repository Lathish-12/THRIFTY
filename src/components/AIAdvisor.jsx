import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Send, Bot, User, Trash2,
    Zap, Lightbulb, RefreshCw, Info
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const AIAdvisor = ({ transactions }) => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "👋 Hello! I'm your **Thrifty Financial Advisor**. I can provide deep insights into your spending patterns, predict future expenses, and help you achieve your financial goals. How can I help you today?",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [apiStatus, setApiStatus] = useState('checking'); // checking, active, fallback
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Smart suggestions based on transactions
    const getSmartSuggestions = () => {
        if (transactions.length === 0) {
            return [
                "How do I start tracking?",
                "Financial tips for beginners",
                "Tell me about budgeting"
            ];
        }

        const suggestions = [
            "Analyze my spending habits",
            "How can I save more?",
            "Create a budget plan"
        ];

        const expenses = transactions.filter(t => t.type === 'expense');
        const totalExpense = expenses.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
        const income = transactions.filter(t => t.type === 'income');
        const totalIncome = income.reduce((a, b) => a + parseFloat(b.amount || 0), 0);

        if (totalIncome - totalExpense < 0) {
            suggestions.push("How can I save more?");
        } else {
            suggestions.push("Investment suggestions");
        }

        if (expenses.length > 5) {
            suggestions.push("Highest spending category?");
        }

        return suggestions.slice(0, 6);
    };

    const [suggestedPrompts, setSuggestedPrompts] = useState(getSmartSuggestions());

    useEffect(() => {
        setSuggestedPrompts(getSmartSuggestions());
    }, [transactions]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', text: text, type: 'text' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Claude AI backend
            const response = await api.post('/users/ai/chat/', {
                message: text
            });

            const aiResponse = {
                role: 'ai',
                text: response.data.response,
                type: response.data.type || 'text',
                poweredBy: response.data.powered_by
            };

            // Update API status based on new response types
            const pb = response.data.powered_by;
            if (pb === 'Thrifty Local Engine' || pb === 'thrifty-local-analyzer') {
                setApiStatus('active');
            } else {
                setApiStatus('active'); // Default to active for any successful response
            }

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);

            // Update suggestions
            setSuggestedPrompts(getSmartSuggestions());

        } catch (error) {
            console.error('AI Chat Error:', error);
            setIsTyping(false);

            // Fallback response
            const fallbackResponse = {
                role: 'ai',
                text: "I'm having trouble connecting to the AI service right now. Please make sure:\n\n1. The backend server is running\n2. You have a valid Claude API key in your `.env` file\n3. You've installed the required packages\n\nTry running: `pip install anthropic python-decouple` in the backend folder.",
                type: 'text',
                poweredBy: 'error'
            };

            setMessages(prev => [...prev, fallbackResponse]);
            toast.error('Failed to get AI response. Check console for details.');
        }
    };

    const handleClear = () => {
        setMessages([{
            role: 'ai',
            text: "💬 Chat cleared! Ready for a fresh start. What would you like to know about your finances?",
            type: 'text'
        }]);
    };

    // Render message with markdown-style bold
    const renderMessageText = (text, role) => {
        return text.split('**').map((part, i) =>
            i % 2 === 1
                ? <strong key={i} style={{ color: role === 'ai' ? '#10b981' : 'white', fontWeight: 600 }}>{part}</strong>
                : part
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '650px', gap: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Enhanced Header */}
                <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 4px 20px rgba(99, 102, 241, 0.3)',
                                    '0 4px 30px rgba(139, 92, 246, 0.5)',
                                    '0 4px 20px rgba(99, 102, 241, 0.3)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                padding: '10px',
                                borderRadius: '12px',
                                display: 'flex'
                            }}
                        >
                            <Bot size={24} color="white" />
                        </motion.div>
                        <div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 700,
                                marginBottom: '0.25rem'
                            }}>
                                Thrifty AI Advisor
                            </h3>
                            <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: apiStatus === 'active' ? '#10b981' : apiStatus === 'fallback' ? '#f59e0b' : '#6366f1'
                                    }}
                                />
                                <span style={{ color: apiStatus === 'active' ? '#10b981' : apiStatus === 'fallback' ? '#f59e0b' : '#6366f1' }}>
                                    {apiStatus === 'active' ? 'Live Assistant' :
                                        apiStatus === 'fallback' ? 'Smart Data Analysis' :
                                            'Ready'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSuggestedPrompts(getSmartSuggestions())}
                            title="Refresh Suggestions"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <RefreshCw size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClear}
                            title="Clear Chat"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: '#ef4444'
                            }}
                        >
                            <Trash2 size={18} />
                        </motion.button>
                    </div>
                </div>

                {/* API Status Banner */}
                {apiStatus === 'fallback' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
                            padding: '0.75rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            color: '#f59e0b'
                        }}
                    >
                        <Info size={16} />
                        Currently providing insights based on your transaction history.
                    </motion.div>
                )}

                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
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
                                    maxWidth: '85%',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: msg.role === 'user'
                                        ? 'var(--bg-secondary)'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '4px',
                                    boxShadow: msg.role === 'ai' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                }}>
                                    {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} color="white" />}
                                </div>

                                {/* Message Content */}
                                <div style={{
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'rgba(255, 255, 255, 0.03)',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                                    borderTopLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.7',
                                    fontSize: '0.95rem',
                                    border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    whiteSpace: 'pre-line',
                                    backdropFilter: msg.role === 'ai' ? 'blur(10px)' : 'none',
                                    flex: 1
                                }}>
                                    {renderMessageText(msg.text, msg.role)}

                                    {/* Show AI model badge */}
                                    {msg.role === 'ai' && msg.poweredBy && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Sparkles size={12} />
                                            Powered by {msg.poweredBy}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}>
                                <Sparkles size={18} color="white" />
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1rem 1.5rem',
                                borderRadius: '16px',
                                borderTopLeftRadius: '4px',
                                display: 'flex',
                                gap: '6px',
                                alignItems: 'center',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            borderRadius: '50%'
                                        }}
                                        animate={{ y: [0, -8, 0], opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Input Area */}
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Smart Suggestions */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem',
                        scrollbarWidth: 'thin'
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
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '20px',
                                        color: '#a5b4fc',
                                        fontSize: '0.85rem',
                                        cursor: isTyping ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 500,
                                        transition: 'all 0.2s',
                                        opacity: isTyping ? 0.5 : 1
                                    }}
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Input Field */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask me anything about your finances..."
                                disabled={isTyping}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '14px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <Zap
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6366f1'
                                }}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            style={{
                                background: input.trim() && !isTyping
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '14px',
                                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '56px',
                                transition: 'all 0.2s',
                                boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                            }}
                        >
                            <Send size={20} color={input.trim() && !isTyping ? 'white' : '#64748b'} />
                        </motion.button>
                    </div>

                    {/* Info Footer */}
                    <div style={{
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <Lightbulb size={14} />
                        {apiStatus === 'active'
                            ? 'Powered by your real transaction data'
                            : 'Start asking questions to get insights!'}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIAdvisor;
