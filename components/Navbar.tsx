"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; // ✅ use context

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    {
        name: "Courses / Programs",
        dropdown: [
            { category: "Defence", items: ["NDA", "CDS", "Airforce X/Y", "Navy", "Agniveer"] },
            { category: "State Exams", items: ["HSSC", "HCS", "Patwari", "Police", "Teachers"] },
        ],
    },
    { name: "Mock", href: "/mock" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { isLoggedIn, logout } = useAuth(); // ✅ comes from context

    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const isActive = (href: string) => pathname === href;

    const toggleDropdown = (name: string) => {
        setDropdownOpen((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-8">
                {/* Logo */}
                <Link href="/" className="text-3xl font-extrabold text-[#002856] tracking-tight">
                    Pariksha Path
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden lg:flex flex-1 justify-center items-center space-x-6 font-semibold">
                    {navLinks.map((link, idx) => (
                        <li key={idx} className="relative group">
                            {link.dropdown ? (
                                <div className="cursor-pointer flex items-center space-x-1 hover:text-blue-700 transition-colors">
                                    <span>{link.name}</span>
                                </div>
                            ) : (
                                <Link
                                    href={link.href!}
                                    className={`hover:text-[#0000D3] transition-colors ${isActive(link.href!) ? "text-[#0000D3]" : ""
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )}

                            {/* Mega Dropdown */}
                            {link.dropdown && (
                                <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-xl rounded-md mt-2 p-6 min-w-[700px] z-50 border border-gray-200">
                                    <div className="grid grid-cols-2 divide-x divide-gray-200 gap-6">
                                        {link.dropdown.map((group, idx) => (
                                            <div key={idx} className="px-6">
                                                <h4 className="font-bold text-[#002856] mb-3 text-lg">
                                                    {group.category}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {group.items.map((item, idx) => (
                                                        <li key={idx}>
                                                            <Link
                                                                href={`/${item.toLowerCase().replace(/\s/g, "-")}`}
                                                                className="text-gray-600 hover:text-[#0000D3] block transition-colors"
                                                            >
                                                                {item}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Desktop Right Section (Dashboard + Login/Logout) */}
                <div className="hidden lg:flex items-center space-x-4">
                    {isLoggedIn && (
                        <Link
                            href="/student/dashboard"
                            className="bg-gray-200 text-[#002856] px-6 py-2 rounded-xs font-bold text-md shadow-sm hover:bg-gray-300 transition-colors"
                        >
                            Dashboard
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <Link
                            onClick={logout}
                            href="/"
                            className="bg-red-600 text-white px-8 py-2 rounded-xs font-bold text-md shadow-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#0000D3] text-white px-8 py-2 rounded-xs font-bold text-md shadow-md hover:bg-[#030397] transition-colors"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden">
                    {menuOpen ? (
                        <X size={28} className="cursor-pointer" onClick={() => setMenuOpen(false)} />
                    ) : (
                        <Menu size={28} className="cursor-pointer" onClick={() => setMenuOpen(true)} />
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-white/95 backdrop-blur-md shadow-lg px-4 py-6 space-y-4"
                    >
                        {navLinks.map((link, idx) => (
                            <div key={idx}>
                                {link.dropdown ? (
                                    <div>
                                        <div
                                            className="flex justify-between items-center py-2 cursor-pointer text-gray-900 font-semibold hover:text-[#0000D3] transition-colors"
                                            onClick={() => toggleDropdown(link.name)}
                                        >
                                            <span>{link.name}</span>
                                            {dropdownOpen[link.name] ? <Minus size={18} /> : <Plus size={18} />}
                                        </div>

                                        <AnimatePresence>
                                            {dropdownOpen[link.name] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="pl-3 mt-2 space-y-3 border-l-2 border-blue-600 overflow-hidden"
                                                >
                                                    {link.dropdown.map((group, idx) => (
                                                        <div key={idx}>
                                                            <h4 className="font-bold text-[#002856] text-sm uppercase tracking-wide">
                                                                {group.category}
                                                            </h4>
                                                            <ul className="mt-1 space-y-1">
                                                                {group.items.map((item, idx) => (
                                                                    <li key={idx}>
                                                                        <Link
                                                                            href={`/${item.toLowerCase().replace(/\s/g, "-")}`}
                                                                            className="block text-gray-600 hover:text-[#0000D3] transition-colors py-1"
                                                                        >
                                                                            {item}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        href={link.href!}
                                        className={`block py-2 font-semibold text-gray-900 hover:text-[#0000D3] transition-colors ${isActive(link.href!) ? "text-[#0000D3]" : ""
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}

                        {/* Mobile Dashboard + Login/Logout */}
                        {isLoggedIn && (
                            <Link
                                href="/student/dashboard"
                                className="block w-full bg-gray-200 text-[#002856] text-center py-2 rounded-sm font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <Link
                                onClick={logout}
                                href="/"
                                className="block w-full bg-red-600 text-white text-center py-2 rounded-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full bg-[#0000D3] text-white text-center py-2 rounded-sm font-semibold hover:bg-blue-800 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
