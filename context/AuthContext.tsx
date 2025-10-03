// "use client";
// import { createContext, useContext, useState, useEffect } from "react";

// interface AuthContextType {
//     isLoggedIn: boolean;
//     role: "student" | "admin" | null;
//     login: (token: string, role: "student" | "admin") => void;
//     logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
//     const [role, setRole] = useState<"student" | "admin" | null>(null);

//     useEffect(() => {
//         const token = localStorage.getItem("access_token");
//         const storedRole = localStorage.getItem("user_role") as "student" | "admin" | null;

//         // ✅ yahan par token ke sath role bhi check kar
//         if (token && storedRole) {
//             setIsLoggedIn(true);
//             setRole(storedRole);
//         } else {
//             setIsLoggedIn(false);
//             setRole(null);
//         }
//     }, []);


//     if (isLoggedIn === null) {
//         return <div>Loading...</div>; // or splash screen
//     }

//     const login = (token: string, role: "student" | "admin") => {
//         localStorage.setItem("access_token", token);
//         localStorage.setItem("user_role", role);
//         setIsLoggedIn(true);
//         setRole(role);
//     };

//     const logout = () => {
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("user_role");
//         setIsLoggedIn(false);
//         setRole(null);
//     };

//     return (
//         <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     // console.log("logout button clicked");
//     const ctx = useContext(AuthContext);
//     if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
//     return ctx;
// };


// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import api from "@/utils/api"; // Axios instance

// interface User {
//     name: string;
//     email: string;
//     phone?: string;
// }

// interface AuthContextType {
//     isLoggedIn: boolean;
//     role: "student" | "admin" | null;
//     user: User | null;
//     loading: boolean;
//     login: (token: string, role: "student" | "admin") => void;
//     logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
//     const [role, setRole] = useState<"student" | "admin" | null>(null);
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);

//     const fetchUser = async () => {
//         try {
//             const token = localStorage.getItem("access_token");
//             const storedRole = localStorage.getItem("user_role") as
//                 | "student"
//                 | "admin"
//                 | null;

//             if (token && storedRole) {
//                 setIsLoggedIn(true);
//                 setRole(storedRole);

//                 // ✅ Call backend /user-data
//                 const res = await api.get("/payments/user-data");
//                 setUser(res.data);
//             } else {
//                 setIsLoggedIn(false);
//                 setRole(null);
//                 setUser(null);
//             }
//         } catch (err) {
//             console.error("Failed to fetch user:", err);
//             setIsLoggedIn(false);
//             setRole(null);
//             setUser(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchUser();
//     }, []);

//     if (isLoggedIn === null || loading) {
//         return <div>Loading...</div>; // splash screen
//     }

//     const login = (token: string, role: "student" | "admin") => {
//         localStorage.setItem("access_token", token);
//         localStorage.setItem("user_role", role);
//         setIsLoggedIn(true);
//         setRole(role);
//         fetchUser(); // immediately fetch fresh user data
//     };

//     const logout = () => {
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("user_role");
//         setIsLoggedIn(false);
//         setRole(null);
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider
//             value={{ isLoggedIn, role, user, loading, login, logout }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const ctx = useContext(AuthContext);
//     if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
//     return ctx;
// };


"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

interface User {
    name: string;
    email: string;
    phone?: string;
}

interface AuthContextType {
    isLoggedIn: boolean | null; // allow null while checking
    role: "student" | "admin" | null;
    user: User | null;
    loading: boolean;
    login: (token: string, role: "student" | "admin") => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [role, setRole] = useState<"student" | "admin" | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const storedRole = localStorage.getItem("user_role") as
                | "student"
                | "admin"
                | null;

            if (token && storedRole) {
                setIsLoggedIn(true);
                setRole(storedRole);

                const res = await api.get("/payments/user-data");
                // ensure shape: adjust if backend wraps user
                const userData = res.data?.user ?? res.data;
                setUser(userData ?? null);
            } else {
                setIsLoggedIn(false);
                setRole(null);
                setUser(null);
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setIsLoggedIn(false);
            setRole(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // This component is client-only (use client), so localStorage is available
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoggedIn === null || loading) {
        return <div>Loading...</div>;
    }

    const login = (token: string, role: "student" | "admin") => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_role", role);
        setIsLoggedIn(true);
        setRole(role);
        // Fire and forget fetchUser to update user info
        fetchUser();
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        setIsLoggedIn(false);
        setRole(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, role, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
};
