import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, PieChart, CreditCard, LayoutDashboard, Gift, MessageCircle, Wallet, Target, TrendingUp } from 'lucide-react';
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
                gap: '0.8rem',
                width: '100%',
                justifyContent: 'space-evenly', // Even spacing for mobile
                maxWidth: '800px' // Constraint width on desktop
            }}>
                <NavItem to="/" icon={<LayoutDashboard size={22} />} text="Dashboard" />
                <NavItem to="/transactions" icon={<CreditCard size={22} />} text="Transactions" />
                <NavItem to="/budgets" icon={<Wallet size={22} />} text="Budget" />
                <NavItem to="/goals" icon={<Target size={22} />} text="Goals" />
                <NavItem to="/analytics" icon={<TrendingUp size={22} />} text="Analytics" />
                <NavItem to="/rewards" icon={<Gift size={22} />} text="Rewards" />
                <NavItem to="/advisor" icon={<MessageCircle size={22} />} text="Advisor" />
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
                height: '44px',
                minWidth: '44px', // ensure touch target size
                padding: isHovered || isActive ? '0 1rem' : '0',
                borderRadius: '22px',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-blue)' : (isHovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
                transition: 'all 0.3s ease',
                gap: '0.5rem',
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
                    {/* Text hidden on mobile via CSS class or check */}
                    <span className="desktop-only" style={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.85rem',
                        fontWeight: '500',
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
