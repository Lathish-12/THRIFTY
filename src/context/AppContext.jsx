import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState({ name: 'Lathish', isAuthenticated: false, settings: { currency: 'INR' } });
    const [points, setPoints] = useState(() => {
        return parseInt(localStorage.getItem('thrifty_points') || '0');
    });
    const [badges, setBadges] = useState(() => {
        const saved = localStorage.getItem('thrifty_badges');
        return saved ? JSON.parse(saved) : [];
    });
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('thrifty_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('thrifty_points', points.toString());
    }, [points]);

    useEffect(() => {
        localStorage.setItem('thrifty_badges', JSON.stringify(badges));
    }, [badges]);

    useEffect(() => {
        localStorage.setItem('thrifty_transactions', JSON.stringify(transactions));
        checkBadges();
    }, [transactions]);

    const login = (userData = {}) => {
        setUser(prev => ({
            ...prev,
            ...userData,
            isAuthenticated: true
        }));
        // toast.success(`Welcome back, ${userData.name || user.name}!`, { theme: "dark" });
    };

    const logout = () => {
        setUser(prev => ({ ...prev, isAuthenticated: false }));
    };

    const addTransaction = (t) => {
        setTransactions(prev => [...prev, t]);
        addPoints(10); // Reward for adding data
        toast.success('Transaction added! +10 Points', { theme: "dark" });
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast.info('Transaction deleted', { theme: "dark" });
    };

    const addPoints = (amount) => {
        setPoints(prev => prev + amount);
    };

    const checkBadges = () => {
        const transactionCount = transactions.length;
        const newBadges = [...badges];

        if (transactionCount >= 1 && !newBadges.includes('Novice Tracker')) {
            newBadges.push('Novice Tracker');
            toast.info('New Badge Unlocked: Novice Tracker! 🏅', { theme: "dark" });
        }
        if (transactionCount >= 10 && !newBadges.includes('Budget Master')) {
            newBadges.push('Budget Master');
            toast.info('New Badge Unlocked: Budget Master! 🏆', { theme: "dark" });
        }
        if (points >= 100 && !newBadges.includes('Point Collector')) {
            newBadges.push('Point Collector');
            toast.info('New Badge Unlocked: Point Collector! ⭐', { theme: "dark" });
        }

        if (newBadges.length !== badges.length) {
            setBadges(newBadges);
        }
    };

    return (
        <AppContext.Provider value={{
            user,
            login,
            logout,
            transactions,
            addTransaction,
            deleteTransaction,
            points,
            badges
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
