import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PieChart, ShieldCheck, Zap, Wallet, Camera, Check } from 'lucide-react';

const WelcomePage = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            position: 'relative',
            overflowX: 'hidden',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Background Orbs */}
            <div className="bg-gradient-orb" style={{ top: '-10%', left: '-10%', background: 'var(--accent-purple)', position: 'fixed' }} />
            <div className="bg-gradient-orb" style={{ bottom: '-10%', right: '-10%', background: 'var(--accent-blue)', position: 'fixed' }} />
            <div className="bg-gradient-orb" style={{ top: '40%', left: '40%', background: 'rgba(16, 185, 129, 0.2)', width: '600px', height: '600px', position: 'fixed' }} />

            <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>

                {/* HERO SECTION */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ textAlign: 'center', marginBottom: '8rem', paddingTop: '4rem' }}
                >
                    <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
                        <span style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '20px',
                            color: 'var(--accent-blue)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'inline-block'
                        }}>
                            New Generation Finance
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-gradient"
                        style={{
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            fontWeight: '800'
                        }}
                    >
                        Master Your Money <br /> With Thrifty AI
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.25rem',
                            maxWidth: '600px',
                            margin: '0 auto 2.5rem auto'
                        }}
                    >
                        Track expenses, manage budgets, and get personalized financial advice powered by advanced artificial intelligence.
                    </motion.p>

                    <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                borderRadius: '50px',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
                            }}
                        >
                            Get Started <ArrowRight size={20} />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* CORE FEATURES GRID */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        marginBottom: '8rem'
                    }}
                >
                    <FeatureCard
                        icon={<PieChart size={32} color="var(--accent-purple)" />}
                        title="Smart Tracking"
                        desc="Visualize your spending habits with beautiful, interactive charts and real-time data."
                    />
                    <FeatureCard
                        icon={<Zap size={32} color="var(--accent-blue)" />}
                        title="AI Advisor"
                        desc="Get instant answers to your financial questions and personalized tips to save more."
                    />
                    <FeatureCard
                        icon={<ShieldCheck size={32} color="var(--accent-green)" />}
                        title="Bank-Grade Security"
                        desc="Your data is protected with state-of-the-art encryption and biometric verification."
                    />
                </motion.div>

                {/* DETAILED FEATURES SECTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', marginBottom: '8rem' }}>

                    {/* Feature 1 */}
                    <div className="grid-layout" style={{ alignItems: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <div style={{ gridColumn: 'span 6' }}>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>Effortless Expense <span style={{ color: 'var(--accent-red)' }}>Tracking</span></h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
                                Stop guessing where your money went. Thrifty automatically categorizes your transactions and gives you a clear view of your spending patterns.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <ListItem text="Automatic Categorization" />
                                <ListItem text="Recurring Subscription Detection" />
                                <ListItem text="Daily Spending Alerts" />
                            </ul>
                        </div>
                        <div style={{ gridColumn: 'span 6', display: 'flex', justifyContent: 'center' }}>
                            <div className="glass-panel" style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.5)' }}>
                                <PieChart size={120} color="var(--accent-red)" style={{ opacity: 0.8 }} />
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="grid-layout" style={{ alignItems: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', direction: 'rtl' }}>
                        <div style={{ gridColumn: 'span 6', direction: 'ltr' }}>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>Stay on Top of <span style={{ color: 'var(--accent-green)' }}>Budgets</span></h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
                                Create custom budgets for different categories like Food, Transport, and Entertainment. We'll help you stick to them without the stress.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <ListItem text="Custom Category Limits" />
                                <ListItem text="Visual Progress Bars" />
                                <ListItem text="Smart Savings Goals" />
                            </ul>
                        </div>
                        <div style={{ gridColumn: 'span 6', display: 'flex', justifyContent: 'center' }}>
                            <div className="glass-panel" style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.5)' }}>
                                <Wallet size={120} color="var(--accent-green)" style={{ opacity: 0.8 }} />
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="grid-layout" style={{ alignItems: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <div style={{ gridColumn: 'span 6' }}>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>Scan & <span style={{ color: 'var(--accent-blue)' }}>Organize</span></h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
                                Have a pile of paper receipts? Just snap a photo. Our AI extracts the details and attaches them to your transactions instantly.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <ListItem text="Instant OCR Tech" />
                                <ListItem text="Cloud Storage for Receipts" />
                                <ListItem text="Export for Tax Season" />
                            </ul>
                        </div>
                        <div style={{ gridColumn: 'span 6', display: 'flex', justifyContent: 'center' }}>
                            <div className="glass-panel" style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.5)' }}>
                                <Camera size={120} color="var(--accent-blue)" style={{ opacity: 0.8 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* HOW IT WORKS */}
                <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>How Thrifty Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
                        <StepCard number="1" title="Sign Up" desc="Create your secure account in seconds using Google or Email." />
                        <StepCard number="2" title="Connect" desc="Link your accounts or start adding expenses manually." />
                        <StepCard number="3" title="Thrive" desc="Watch your savings grow with AI-powered insights." />
                    </div>
                </div>

                {/* CTA SECTION */}
                <div className="glass-panel" style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(99, 102, 241, 0.2))',
                    border: '1px solid var(--accent-blue)'
                }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to Take Control?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                        Join thousands of smart spenders who are mastering their money with Thrifty.
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/login')}
                        style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }}
                    >
                        Start Your Free Journey
                    </button>
                </div>

                <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <p>© 2024 Thrifty AI. All rights reserved.</p>
                </footer>

            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        className="glass-panel"
        whileHover={{ y: -5 }}
        style={{ padding: '2rem', textAlign: 'left', cursor: 'default' }}
    >
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
    </motion.div>
);

const ListItem = ({ text }) => (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '2px', borderRadius: '50%' }}>
            <Check size={14} color="var(--accent-green)" />
        </div>
        {text}
    </li>
);

const StepCard = ({ number, title, desc }) => (
    <div className="glass-panel" style={{ padding: '2rem', position: 'relative', textAlign: 'left' }}>
        <div style={{
            position: 'absolute',
            top: '-20px',
            left: '20px',
            width: '40px',
            height: '40px',
            background: 'var(--accent-blue)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}>
            {number}
        </div>
        <h3 style={{ marginTop: '1rem', marginBottom: '1rem', fontSize: '1.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

export default WelcomePage;
