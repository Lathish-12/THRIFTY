import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

const AIAdvisor = ({ transactions }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I'm Thrifty AI. I can analyze your spending habits. Try asking 'How is my spending this month?' or 'Suggest a budget'." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking and response
        setTimeout(() => {
            let aiResponse = "I'm not sure about that. Try asking about your expenses.";

            const lowerInput = userMessage.text.toLowerCase();
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
            const topCategory = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                }, {});

            const sortedCategories = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
            const highestCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';

            if (lowerInput.includes('spending') || lowerInput.includes('spent')) {
                aiResponse = `You have spent a total of ₹${totalExpense} so far. Your highest spending category is ${highestCategory}.`;
            } else if (lowerInput.includes('budget') || lowerInput.includes('advice')) {
                aiResponse = sortedCategories.length > 0
                    ? `I noticed you spend a lot on ${highestCategory}. Consider setting a limit of ₹${(sortedCategories[0][1] * 0.9).toFixed(0)} for next month to save 10%.`
                    : "Start adding some expenses so I can give you personalized budget advice!";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                aiResponse = "Hello! Ready to save some money today?";
            }

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
                gridColumn: 'span 12',
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '400px'
            }}
        >
            <div style={{ padidng: '1rem', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#6366f1" />
                <h3 style={{ fontSize: '1.1rem' }}>Thrifty AI Advisor</h3>
            </div>

            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.1)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderTopLeftRadius: msg.role === 'ai' ? '2px' : '12px',
                            maxWidth: '80%',
                            lineHeight: '1.5'
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            Analyzing...
                        </motion.span>
                    </div>
                )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask AI about your finances..."
                    style={{
                        flex: 1,
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        background: 'var(--accent-blue)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default AIAdvisor;
