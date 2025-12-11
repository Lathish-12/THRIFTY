import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PieChart, CreditCard, LayoutDashboard, Gift, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
    const { user, logout } = useApp();

    return (
        <nav style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '80px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 0',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ marginBottom: '3rem', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-blue)' }}>
                T
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <NavItem to="/" icon={<LayoutDashboard size={24} />} text="Dashboard" />
                <NavItem to="/transactions" icon={<CreditCard size={24} />} text="Transactions" />
                <NavItem to="/rewards" icon={<Gift size={24} />} text="Rewards" />
                <NavItem to="/advisor" icon={<MessageCircle size={24} />} text="Advisor" />
            </div>

            <button
                onClick={logout}
                style={{
                    marginTop: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '12px'
                }}
                title="Logout"
            >
                <div style={{ width: '24px', height: '24px', border: '2px solid currentColor', borderRadius: '50%', borderTopColor: 'transparent' }} />
            </button>
        </nav>
    );
};

const NavItem = ({ to, icon, text }) => (
    <NavLink
        to={to}
        className={({ isActive }) => (isActive ? "nav-active" : "")}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            color: isActive ? 'white' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-blue)' : 'transparent',
            transition: 'all 0.3s ease'
        })}
        title={text}
    >
        {icon}
    </NavLink>
);

export default Navbar;
