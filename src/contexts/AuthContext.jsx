import React, { createContext, useState, useContext, useEffect } from 'react';

// Mock users database
const MOCK_USERS = [
    { username: 'admin', password: 'admin123', role: 'admin', bidang: null, name: 'Administrator' },
    { username: 'sekretariat', password: 'sekretariat123', role: 'sekretariat', bidang: 'SEKRETARIAT', name: 'User Sekretariat' },
    { username: 'sdk', password: 'sdk123', role: 'sdk', bidang: 'SDK', name: 'User SDK' },
    { username: 'p2p', password: 'p2p123', role: 'p2p', bidang: 'P2P', name: 'User P2P' },
    { username: 'yankes', password: 'yankes123', role: 'yankes', bidang: 'YANKES', name: 'User YANKES' },
    { username: 'kesmas', password: 'kesmas123', role: 'kesmas', bidang: 'KESMAS', name: 'User KESMAS' },
    { username: 'kb', password: 'kb123', role: 'kb', bidang: 'KB', name: 'User KB' }
];

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('currentUser');
            }
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // Find user in mock database
        const user = MOCK_USERS.find(
            u => u.username === username && u.password === password
        );

        if (user) {
            // Remove password from stored user object
            const { password: _, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, error: 'Username atau password salah' };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const isAdmin = () => {
        return currentUser?.role === 'admin';
    };

    const canAccessBidang = (bidangName) => {
        if (!currentUser) return false;
        if (isAdmin()) return true;
        return currentUser.bidang === bidangName;
    };

    const value = {
        currentUser,
        login,
        logout,
        isAdmin,
        canAccessBidang,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
