import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircle, X, Send } from 'lucide-react';

const CustomerSupport = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'agent', text: 'Hello! Welcome to Thrifty Premium Support. How can we help you today?' }
    ]);
    const [input, setInput] = useState('');

    const toggle = () => setIsOpen(!isOpen);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { from: 'user', text: input }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'agent', text: 'Thank you for reaching out. An agent will be with you shortly (approx wait: 2 mins).' }]);
        }, 1000);
    };

    return (
        <>
            <button
                onClick={toggle}
                style={{
                    position: 'fixed',
                    bottom: '85px',
                    right: '1.5rem',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--accent-blue)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    color: 'white',
                    cursor: 'pointer',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isOpen ? <X size={20} /> : <HelpCircle size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '145px',
                            right: '1.5rem',
                            width: '300px',
                            height: '400px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '1rem', background: 'var(--accent-blue)', color: 'white' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageCircle size={18} /> Customer Support</h4>
                            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>We usually reply in a few minutes</p>
                        </div>

                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{
                                    alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                                    background: m.from === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    maxWidth: '80%',
                                    fontSize: '0.875rem'
                                }}>
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe your issue..."
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={sendMessage} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CustomerSupport;
