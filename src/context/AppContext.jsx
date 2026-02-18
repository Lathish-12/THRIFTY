import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Auth State
    const [user, setUser] = useState({ name: '', email: null, isAuthenticated: false, settings: { currency: 'INR' } });
    const [authLoading, setAuthLoading] = useState(true);

    // Gamification & Data State
    const [points, setPoints] = useState(0);
    const [badges, setBadges] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    // Fetch user data from backend
    const fetchUserData = async () => {
        try {
            setDataLoading(true);

            // Fetch transactions
            const transactionsRes = await api.get('/users/transactions/');
            setTransactions(transactionsRes.data);

            // Fetch user profile (points)
            const profileRes = await api.get('/users/profile/');
            setPoints(profileRes.data.points || 0);

            // Fetch badges
            const badgesRes = await api.get('/users/badges/');
            setBadges(badgesRes.data);

        } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback to localStorage if backend fails
            const savedPoints = parseInt(localStorage.getItem('thrifty_points') || '0');
            const savedBadges = localStorage.getItem('thrifty_badges');
            const savedTransactions = localStorage.getItem('thrifty_transactions');

            setPoints(savedPoints);
            if (savedBadges) setBadges(JSON.parse(savedBadges));
            if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        } finally {
            setDataLoading(false);
        }
    };

    // Check Auth on Mount
    useEffect(() => {
        console.log('Starting auth check...');
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                console.log('Token exists:', !!token);

                if (token) {
                    try {
                        // Token is valid, fetch user profile
                        const res = await api.get('/users/me/');
                        setUser({
                            ...res.data,
                            name: res.data.first_name || res.data.username || 'User',
                            isAuthenticated: true
                        });

                        // Fetch user data after authentication
                        await fetchUserData();
                    } catch (error) {
                        console.error("Auth check failed", error);
                        logout();
                    }
                } else {
                    // No token, user is not authenticated
                    console.log('No token found, user not authenticated');
                    setUser({ name: '', email: null, isAuthenticated: false, settings: { currency: 'INR' } });
                }
            } catch (error) {
                console.error("Error in auth check:", error);
                // Set default state on error
                setUser({ name: '', email: null, isAuthenticated: false, settings: { currency: 'INR' } });
            } finally {
                console.log('Auth check complete, setting authLoading to false');
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Theme (dark / light)
    const [isDark, setIsDark] = useState(() => {
        try {
            const saved = localStorage.getItem('thrifty_theme');
            return saved ? saved === 'dark' : true;
        } catch (e) {
            return true;
        }
    });

    useEffect(() => {
        try {
            const theme = isDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
            localStorage.setItem('thrifty_theme', isDark ? 'dark' : 'light');
        } catch (e) {
            console.error('Error applying theme:', e);
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    // Fetch current user info (me)
    const fetchMe = async () => {
        try {
            const res = await api.get('/users/me/');
            const userData = res.data;
            setUser({
                ...userData,
                name: userData.first_name || userData.username || 'User',
                email: userData.email,
                isAuthenticated: true
            });
        } catch (error) {
            console.error('Error fetching user (me):', error);
        }
    };

    // Auth Actions
    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login/', { username: email, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode(access);
            setUser(prev => ({
                ...prev,
                name: decoded.username || email,
                email: email,
                isAuthenticated: true
            }));

            // Fetch user data after login
            await fetchUserData();

            toast.success("Login Successful!");
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Login Failed");
            return false;
        }
    };

    const googleLogin = async (credential) => {
        try {
            console.log("Attempting Google Login with backend...");
            console.log("Credential type:", typeof credential);
            console.log("Credential length:", credential?.length);

            const response = await api.post('/users/google/', { token: credential });
            console.log("Google Login Response:", response.data);

            if (!response?.data) {
                console.error("Empty response from backend");
                throw new Error("Invalid response from server");
            }

            const { access, refresh, user: userData } = response.data;

            if (!access || !userData) {
                console.error("Missing access token or user data:", response.data);
                throw new Error("Invalid response structure - missing access token or user data");
            }

            console.log("Google Login successful, user data:", userData);

            localStorage.setItem('access_token', access);
            if (refresh) {
                localStorage.setItem('refresh_token', refresh);
            }

            setUser(prev => ({
                ...prev,
                name: userData.first_name || userData.username || 'User',
                email: userData.email,
                isAuthenticated: true
            }));

            // Fetch user data after Google login
            await fetchUserData();

            toast.success(`Welcome ${userData.first_name || 'back'}!`);
            return true;
        } catch (error) {
            console.error("Google Login Error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            const errorMsg = error.response?.data?.error || error.message || "Google Login Failed";
            toast.error(errorMsg);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/users/register/', userData);
            toast.success("Registration Successful! Please Login.");
            return true;
        } catch (error) {
            console.error(error);
            const msg = Object.values(error.response?.data || {}).flat().join(' ') || "Registration Failed";
            toast.error(msg);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser({ name: '', email: null, isAuthenticated: false, settings: { currency: 'INR' } });
        setTransactions([]);
        setPoints(0);
        setBadges([]);
        toast.info("Logged out");
    };

    const deleteAccount = async () => {
        try {
            const res = await api.delete('/users/delete/');
            console.log('Delete account response:', res.data);
            // After deletion, clear local state and tokens
            logout();
            toast.success('Account deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(error.response?.data?.error || 'Failed to delete account');
            return false;
        }
    };

    // Data Actions - Now using Backend API
    const addTransaction = async (transactionData) => {
        try {
            // Send to backend
            const response = await api.post('/users/transactions/', transactionData);

            // Update local state
            setTransactions(prev => [response.data, ...prev]);

            toast.success('Transaction added!', { theme: "dark" });
            return response.data;
        } catch (error) {
            console.error('Error adding transaction:', error);
            toast.error('Failed to add transaction');
            throw error;
        }
    };

    const deleteTransaction = async (id) => {
        try {
            // Delete from backend
            await api.delete(`/users/transactions/${id}/`);

            // Update local state
            setTransactions(prev => prev.filter(t => t.id !== id));

            toast.info('Transaction deleted', { theme: "dark" });
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete transaction');
        }
    };

    const updateTransaction = async (id, transactionData) => {
        try {
            // Update in backend
            const response = await api.patch(`/users/transactions/${id}/`, transactionData);

            // Update local state
            setTransactions(prev => prev.map(t => t.id === id ? response.data : t));

            toast.success('Transaction updated!', { theme: "dark" });
            return response.data;
        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error('Failed to update transaction');
            throw error;
        }
    };

    // eslint-disable-next-line no-unused-vars
    const addPoints = async (amount) => {
        try {
            const newPoints = points + amount;
            setPoints(newPoints);
            await api.patch('/users/profile/', { points: newPoints });
        } catch (error) {
            console.error('Error updating points:', error);
        }
    };

    const checkBadges = async () => {
        const transactionCount = transactions.length;

        // Define badge rules
        const badgeRules = [
            {
                name: 'Novice Tracker',
                description: 'Added your first transaction',
                icon: 'trophy',
                condition: transactionCount >= 1
            },
            {
                name: 'Budget Master',
                description: 'Added 10 transactions',
                icon: 'award',
                condition: transactionCount >= 10
            },
            {
                name: 'Point Collector',
                description: 'Earned 100 points',
                icon: 'star',
                condition: points >= 100
            }
        ];

        for (const rule of badgeRules) {
            // Check if badge already exists
            const hasBadge = badges.some(b => b.name === rule.name);

            if (rule.condition && !hasBadge) {
                try {
                    // Add badge to backend
                    const response = await api.post('/users/badges/', {
                        name: rule.name,
                        description: rule.description,
                        icon: rule.icon
                    });

                    // Update local state
                    setBadges(prev => [...prev, response.data]);

                    toast.info(`New Badge Unlocked: ${rule.name}! 🏅`, { theme: "dark" });
                } catch (error) {
                    console.error('Error adding badge:', error);
                }
            }
        }
    };

    return (
        <AppContext.Provider value={{
            user,
            authLoading,
            dataLoading,
            login,
            googleLogin,
            register,
            logout,
            deleteAccount,
            transactions,
            addTransaction,
            deleteTransaction,
            updateTransaction,
            points,
            badges,
            fetchUserData,
            fetchMe,
            isDark,
            toggleTheme
        }}>
            {children}
        </AppContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
