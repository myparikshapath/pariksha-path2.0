// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import Loader from "@/components/loader";
// import SecureTokenStorage from "@/utils/secureStorage";
// import { useAuthStore } from "@/stores/auth";

// interface User {
//     name: string;
//     email: string;
//     phone?: string;
// }

// interface AuthContextType {
//     isLoggedIn: boolean | null; // allow null while checking
//     role: "student" | "admin" | null;
//     user: User | null;
//     loading: boolean;
//     login: (accessToken: string, refreshToken: string, role: "student" | "admin") => void;
//     logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const { isLoggedIn, role, user, loading, login: storeLogin, logout: storeLogout, bootstrap, setState } = useAuthStore();
//     const [/*legacyLoading*/ , setLoading] = useState(true);
//     const [showLoader, setShowLoader] = useState(true); // control loader visibility

//     const fetchUser = async () => {
//         try {
//             await bootstrap();
//         } finally {
//             // Ensure loader shows at least 3–4 seconds
//             setTimeout(() => {
//                 setShowLoader(false);
//                 setLoading(false);
//             }, 4000);
//         }
//     };

//     useEffect(() => {
//         fetchUser();

//         // Listen for logout events from other tabs
//         const handleStorageChange = (e: StorageEvent) => {
//             if (e.key === 'logout' && e.newValue) {
//                 // Another tab logged out, clear this tab's state
//                 SecureTokenStorage.clearAllTokens();
//                 setState({ isLoggedIn: false, role: null, user: null });
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);

//         // Cleanup function
//         return () => {
//             window.removeEventListener('storage', handleStorageChange);
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // Show full-screen loader while fetching user or during fixed delay
//     if (showLoader || isLoggedIn === null || loading) {
//         return <Loader />;
//     }

//     const login = (accessToken: string, refreshToken: string, role: "student" | "admin") => {
//         void storeLogin(accessToken, refreshToken, role);
//     };

//     const logout = () => {
//         storeLogout();
//     };

//     return (
//         <AuthContext.Provider value={{ isLoggedIn, role, user, loading, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const ctx = useContext(AuthContext);
//     if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
//     return ctx;
// };
