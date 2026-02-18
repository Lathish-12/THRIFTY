import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircle, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const CustomerSupport = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('chat'); // 'chat' or 'request'
    const [messages, setMessages] = useState([
        { from: 'agent', text: 'Hello! Welcome to Thrifty Premium Support. How can we help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (mode === 'request') {
            await handleRequestSubmit();
            return;
        }

        const userMsg = input;
        setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
        setInput('');

        // Provide immediate feedback
        setTimeout(() => {
            setMessages(prev => [...prev, {
                from: 'agent',
                text: 'Thank you for reaching out. If this is a project change request, please use the "Request Changes" button above. Otherwise, an agent will be with you shortly.'
            }]);
        }, 1000);
    };

    const handleRequestSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/users/support/', {
                message: input,
                type: 'Project Change Request'
            });

            toast.success('Your request has been sent to the developer!');
            setMessages(prev => [...prev, { from: 'user', text: `[REQUEST]: ${input}` }]);
            setMessages(prev => [...prev, {
                from: 'agent',
                text: '✅ Your change request has been received and emailed to yappank31@gmail.com. Our team will review it shortly!'
            }]);
            setInput('');
            setMode('chat');
        } catch (error) {
            console.error('Support Error:', error);
            toast.error('Failed to send request. Is the backend running?');
        } finally {
            setIsSubmitting(false);
        }
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
                            width: '320px',
                            height: '450px',
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <MessageCircle size={18} /> Support
                                </h4>
                                <button
                                    onClick={() => setMode(mode === 'chat' ? 'request' : 'chat')}
                                    style={{
                                        fontSize: '0.7rem',
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {mode === 'chat' ? 'Request Change' : 'Back to Chat'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                {mode === 'chat' ? 'We usually reply in a few minutes' : 'Direct request to yappank31@gmail.com'}
                            </p>
                        </div>

                        {mode === 'request' && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                fontSize: '0.8rem',
                                color: '#a5b4fc',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <Sparkles size={14} /> Request a feature or UI change below.
                            </div>
                        )}

                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{
                                    alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                                    background: m.from === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    maxWidth: '85%',
                                    fontSize: '0.875rem',
                                    color: 'white'
                                }}>
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.1)' }}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode === 'chat' ? "Describe your issue..." : "What changes would you like to see?"}
                                rows={mode === 'chat' ? 1 : 3}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    resize: 'none',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isSubmitting || !input.trim()}
                                style={{
                                    background: isSubmitting ? 'transparent' : 'var(--accent-blue)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'flex-end',
                                    opacity: !input.trim() ? 0.5 : 1
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CustomerSupport;
