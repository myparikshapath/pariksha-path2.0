"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    role: "student" | "admin" | null;
    login: (token: string, role: "student" | "admin") => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [role, setRole] = useState<"student" | "admin" | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const storedRole = localStorage.getItem("user_role") as "student" | "admin" | null;

        if (token) {
            setIsLoggedIn(true);
            setRole(storedRole);
        } else {
            setIsLoggedIn(false);
            setRole(null);
        }
    }, []);

    if (isLoggedIn === null) {
        return <div>Loading...</div>; // or splash screen
    }

    const login = (token: string, role: "student" | "admin") => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_role", role);
        setIsLoggedIn(true);
        setRole(role);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        setIsLoggedIn(false);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
};
