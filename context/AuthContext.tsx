"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = still loading

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token);
    }, []);

    if (isLoggedIn === null) {
        return <div>Loading...</div>; // or splash screen
    }


    const login = (token: string) => {
        localStorage.setItem("access_token", token);
        setIsLoggedIn(true); // ✅ update state immediately
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
};
