import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User, Trash2, TrendingUp, DollarSign } from 'lucide-react';

const SUGGESTED_PROMPTS = [
    "How is my spending?",
    "Suggest a budget plan",
    "How can I save more?",
    "Do I have subscriptions?",
    "Investment tips",
    "List recent transactions"
];

const AIAdvisor = ({ transactions }) => {
    // ... existing state ...
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hello! I'm Thrifty AI. I can analyze your finances, track spending patterns, and offer personalized advice. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const analyzeFinances = (query) => {
        const lowerQuery = query.toLowerCase();
        const expenses = transactions.filter(t => t.type === 'expense');
        const income = transactions.filter(t => t.type === 'income');
        const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
        const totalIncome = income.reduce((a, b) => a + b.amount, 0);

        // Category Analysis
        const categoryMap = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});
        const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

        if (lowerQuery.includes('spending') || lowerQuery.includes('spent') || lowerQuery.includes('expense')) {
            if (expenses.length === 0) return "You haven't added any expenses yet. Start tracking to get insights!";

            let response = `You have spent a total of **₹${totalExpense.toFixed(2)}** so far.`;
            if (topCategory) {
                response += `\n\nYour highest spending category is **${topCategory[0]}** (₹${topCategory[1]}).`;
            }
            return response;
        }

        if (lowerQuery.includes('highlight') || lowerQuery.includes('highest')) {
            if (!topCategory) return "No expenses recorded yet.";
            return `Your highest expense category is **${topCategory[0]}** with a total of **₹${topCategory[1]}**. Watch out for this category!`;
        }

        if (lowerQuery.includes('budget') || lowerQuery.includes('plan')) {
            if (expenses.length === 0) return "I need more data to create a budget plan. Add some expenses!";

            return `Based on your spending, here is a suggested budget for next month:\n` +
                sortedCategories.slice(0, 3).map(([cat, amount]) =>
                    `- **${cat}**: Try to limit to ₹${(amount * 0.9).toFixed(0)} (Save 10%)`
                ).join('\n') +
                `\n\nTotal Savings Target: ₹${(totalExpense * 0.1).toFixed(0)}`;
        }

        if (lowerQuery.includes('save') || lowerQuery.includes('savings')) {
            return `**Savings Tip:**\nTo save more, try the 50/30/20 rule:\n- 50% for Needs\n- 30% for Wants\n- 20% for Savings\n\nBased on your current data, you should aim to save **₹${(totalIncome * 0.2).toFixed(0)}** per month.`;
        }

        if (lowerQuery.includes('subscription') || lowerQuery.includes('recurring')) {
            // Mock detection logic
            const potentialSubs = expenses.filter(t => t.amount < 1000 && (t.description.toLowerCase().includes('netflix') || t.description.toLowerCase().includes('spotify') || t.description.toLowerCase().includes('plan')));
            if (potentialSubs.length > 0) {
                return `I found some potential subscriptions:\n${potentialSubs.map(t => `- ${t.description} (₹${t.amount})`).join('\n')}\n\nCheck if you still need all of these!`;
            }
            return "I didn't detect any obvious subscriptions in your recent transactions. Look for small, regular monthly charges.";
        }

        if (lowerQuery.includes('invest') || lowerQuery.includes('stock')) {
            return `**Investment Basics:**\n1. Start with an Emergency Fund (3-6 months of expenses).\n2. Consider low-cost Index Funds for long-term growth.\n3. Diversify to reduce risk.\n\n*Note: I am an AI, not a certified financial advisor.*`;
        }

        if (lowerQuery.includes('recent') || lowerQuery.includes('list')) {
            const recent = transactions.slice(-5).reverse();
            if (recent.length === 0) return "No recent transactions found.";
            return "Here are your last 5 transactions:\n" +
                recent.map(t => `- **${t.description}**: ₹${t.amount} (${t.type})`).join('\n');
        }

        if (lowerQuery.includes('income') || lowerQuery.includes('earning')) {
            return `Total recorded income is **₹${totalIncome}**. Net balance: **₹${totalIncome - totalExpense}**.`;
        }

        if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            return "Hi there! Ready to organize your finances?";
        }

        if (lowerQuery.includes('thank')) {
            return "You're welcome! Happy saving! 💰";
        }

        return "I can help you track expenses, suggest budgets, or analyze your spending habits. Try asking 'How can I save more?' or 'Show recent transactions'.";
    };

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', text: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate network delay for realism
        setTimeout(() => {
            const responseText = analyzeFinances(text);
            setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
            setIsTyping(false);
        }, 1200);
    };

    const handleClear = () => {
        setMessages([{ role: 'ai', text: "Chat cleared. How can I assist you now?" }]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '600px', gap: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            padding: '8px',
                            borderRadius: '10px',
                            display: 'flex'
                        }}>
                            <Bot size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Thrifty AI</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
                                Online & Ready
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        title="Clear Chat"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem' }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

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
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: msg.role === 'user' ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: '4px'
                            }}>
                                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} color="white" />}
                            </div>

                            <div style={{
                                background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)',
                                padding: '1rem',
                                borderRadius: '16px',
                                borderTopRightRadius: msg.role === 'user' ? '2px' : '16px',
                                borderTopLeftRadius: msg.role === 'ai' ? '2px' : '16px',
                                color: 'var(--text-primary)',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none',
                                whiteSpace: 'pre-line' // Handle newlines
                            }}>
                                {msg.text.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i} style={{ color: msg.role === 'ai' ? 'var(--accent-green)' : 'white' }}>{part}</strong> : part
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}
                        >
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={16} color="white" />
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1rem',
                                borderRadius: '16px',
                                borderTopLeftRadius: '2px',
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center'
                            }}>
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }}
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--glass-border)' }}>
                    {/* Quick Prompts */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {SUGGESTED_PROMPTS.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(prompt)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                                    e.target.style.color = 'var(--accent-blue)';
                                    e.target.style.borderColor = 'var(--accent-blue)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.color = 'var(--text-secondary)';
                                    e.target.style.borderColor = 'var(--glass-border)';
                                }}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about your money..."
                            style={{
                                flex: 1,
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid var(--glass-border)',
                                padding: '1rem',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="btn-primary"
                            style={{
                                width: '56px',
                                padding: 0,
                                borderRadius: '12px',
                                opacity: (!input.trim() || isTyping) ? 0.7 : 1
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIAdvisor;
