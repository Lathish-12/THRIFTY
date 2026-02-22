import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, PieChart, CreditCard, LayoutDashboard, Gift, MessageCircle, Wallet, Target, TrendingUp, Gem, Bitcoin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px', // slightly taller for touch targets
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid var(--glass-border)',
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Centered on desktop
            padding: '0 1rem', // Smaller padding on mobile
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
        }} className="navbar-responsive">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                justifyContent: 'space-evenly', // Even spacing for mobile
                maxWidth: '950px' // Wider to accommodate new item
            }}>
                <NavItem to="/" icon={<LayoutDashboard size={20} />} text="Dash" />
                <NavItem to="/transactions" icon={<CreditCard size={20} />} text="Trans" />
                <NavItem to="/budgets" icon={<Wallet size={20} />} text="Budget" />
                <NavItem to="/goals" icon={<Target size={20} />} text="Goals" />
                <NavItem to="/analytics" icon={<TrendingUp size={20} />} text="Charts" />
                <NavItem to="/metals" icon={<Gem size={20} />} text="Metals" />
                <NavItem to="/crypto" icon={<Bitcoin size={20} />} text="Crypto" />
                <NavItem to="/advisor" icon={<MessageCircle size={20} />} text="AI" />
            </div>
        </nav>
    );
};

const NavItem = ({ to, icon, text }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <NavLink
            to={to}
            className={({ isActive }) => (isActive ? "nav-active" : "")}
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '42px',
                minWidth: '42px',
                padding: isHovered || isActive ? '0 0.8rem' : '0',
                borderRadius: '21px',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-blue)' : (isHovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                gap: '0.4rem',
                overflow: 'hidden',
                textDecoration: 'none',
                flexShrink: 0
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {({ isActive }) => (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </div>
                    <span style={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: (isHovered || isActive) ? 'block' : 'none'
                    }}>
                        {text}
                    </span>
                </>
            )}
        </NavLink>
    );
};

export default Navbar;
