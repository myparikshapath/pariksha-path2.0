"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

import examData from "@/data/exams.json";

// ---------- Types ----------
interface ExamStateGroup {
    state: string;
    exams: string[];
}

interface ExamSubGroup {
    subCategory?: string;
    state?: string;
    exams: string[] | ExamStateGroup[];
}

interface DropdownGroup {
    category: string;
    items: ExamSubGroup[];
}

// ---------- Helpers ----------
const slugify = (val: string): string =>
    val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

export default function Navbar() {
    const pathname = usePathname();
    const { isLoggedIn, logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => setMenuOpen(false), [pathname]);

    const isActive = (href: string) => pathname === href;

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        {
            name: "Exams",
            dropdown: Object.entries(examData).map(([category, sub]) => ({
                category,
                items: Object.entries(sub).map(([subCat, exams]) => {
                    if (Array.isArray(exams)) return { subCategory: subCat, exams };
                    return {
                        subCategory: subCat,
                        exams: Object.entries(exams).map(([state, examsArr]) => ({
                            state,
                            exams: examsArr as string[],
                        })),
                    };
                }),
            })),
        },
        { name: "Mock", href: "/mock" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-3xl font-extrabold text-[#002856] tracking-tight"
                >
                    Pariksha Path
                </Link>

                {/* ---------- DESKTOP MENU ---------- */}
                <ul className="hidden lg:flex flex-1 justify-center items-start space-x-6 font-semibold">
                    {navLinks.map((link, idx) => (
                        <li
                            key={idx}
                            className="relative group"
                            onMouseEnter={() => {
                                setHoveredDropdown(link.name);
                                if (link.dropdown)
                                    setActiveCategory(link.dropdown[0]?.category || null);
                            }}
                            onMouseLeave={() => setHoveredDropdown(null)}
                        >
                            {link.dropdown ? (
                                <button
                                    type="button"
                                    className="cursor-pointer flex items-center space-x-1 hover:text-blue-700 transition-colors text-md font-semibold"
                                >
                                    {link.name}
                                </button>
                            ) : (
                                <Link
                                    href={link.href!}
                                    className={`hover:text-[#0000D3] transition-colors ${isActive(link.href!) ? "text-[#0000D3]" : ""
                                        } text-[16px]`}
                                >
                                    {link.name}
                                </Link>
                            )}


                            {/* --- DESKTOP MEGA DROPDOWN --- */}
                            {link.dropdown && (
                                <AnimatePresence>
                                    {hoveredDropdown === link.name && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-sm  mt-4 w-[95vw] max-w-[1600px] h-[85vh] z-50 border border-gray-200 flex"
                                        >
                                            {/* LEFT panel - categories */}
                                            <div className="w-[28%] max-w-[360px] border-r border-gray-200 overflow-y-auto">
                                                {link.dropdown.map((group: DropdownGroup, i) => (
                                                    <button
                                                        key={i}
                                                        onMouseEnter={() => setActiveCategory(group.category)}
                                                        className={`w-full text-left px-5 py-3 text-lg font-bold ${activeCategory === group.category
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-[#002856] hover:bg-blue-50"
                                                            }`}
                                                    >
                                                        {group.category}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* RIGHT panel - exams */}
                                            <div className="flex-1 p-7 overflow-y-auto">
                                                {link.dropdown
                                                    .filter((g) => g.category === activeCategory)
                                                    .map((group, gi) => (
                                                        <div key={gi} className="space-y-8">
                                                            <h3 className="text-2xl font-extrabold text-[#002856]">
                                                                {group.category}
                                                            </h3>

                                                            {group.items.map((sub, si) => (
                                                                <section key={si}>
                                                                    <h4 className="text-xl font-bold text-[#002856] mb-4">
                                                                        {sub.subCategory}
                                                                    </h4>

                                                                    {/* direct exams */}
                                                                    {Array.isArray(sub.exams) &&
                                                                        typeof sub.exams[0] === "string" ? (
                                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                                                            {sub.exams.map((ex, i) => (
                                                                                <Link
                                                                                    key={i}
                                                                                    href={`/${slugify(ex)}`}
                                                                                    className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 
             hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 
             shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg"
                                                                                >
                                                                                    {ex}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        // state-level exams
                                                                        <div className="space-y-6">
                                                                            {(sub.exams as ExamStateGroup[]).map(
                                                                                (subState, sti) => (
                                                                                    <div key={sti}>
                                                                                        <div className="text-lg font-bold text-black mb-3">
                                                                                            {subState.state}
                                                                                        </div>
                                                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                                                                            {subState.exams.map((ex, ei) => (
                                                                                                <Link
                                                                                                    key={ei}
                                                                                                    href={`/${slugify(ex)}`}
                                                                                                    className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 
             hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 
             shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg"
                                                                                                >
                                                                                                    {ex}
                                                                                                </Link>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </section>
                                                            ))}
                                                        </div>
                                                    ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </li>
                    ))}
                </ul>

                {/* ---------- DESKTOP RIGHT SECTION ---------- */}
                <div className="hidden lg:flex items-center space-x-4">
                    {isLoggedIn && (
                        <Link
                            href="/student/dashboard"
                            className="bg-gray-200 text-[#002856] px-6 py-2 rounded font-bold shadow-sm hover:bg-gray-300 transition"
                        >
                            Dashboard
                        </Link>
                    )}
                    {isLoggedIn ? (
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-8 py-2 rounded font-bold shadow-md hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#0000D3] text-white px-8 py-2 rounded font-bold shadow-md hover:bg-[#030397] transition"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* ---------- MOBILE TOGGLE ---------- */}
                <div className="lg:hidden">
                    {menuOpen ? (
                        <X
                            size={28}
                            className="cursor-pointer"
                            onClick={() => setMenuOpen(false)}
                        />
                    ) : (
                        <Menu
                            size={28}
                            className="cursor-pointer"
                            onClick={() => setMenuOpen(true)}
                        />
                    )}
                </div>
            </div>

            {/* ---------- MOBILE MENU ---------- */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-white/95 backdrop-blur-md shadow-lg px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto"
                    >
                        <Accordion type="multiple" className="w-full space-y-2">
                            {navLinks.map((link, idx) =>
                                !link.dropdown ? (
                                    <Link
                                        key={idx}
                                        href={link.href!}
                                        className={`block py-2 font-semibold hover:text-[#0000D3] ${isActive(link.href!) ? "text-[#0000D3]" : "text-gray-900"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ) : (
                                    <AccordionItem
                                        key={idx}
                                        value={`item-${idx}`}
                                        className="rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <AccordionTrigger className="text-lg font-bold px-4 py-3 hover:bg-blue-50 data-[state=open]:bg-blue-100">
                                            {link.name}
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-3 space-y-2">
                                            {link.dropdown.map((group, gIdx) => (
                                                <Accordion
                                                    key={gIdx}
                                                    type="multiple"
                                                    className="space-y-2"
                                                >
                                                    <AccordionItem
                                                        value={`cat-${gIdx}`}
                                                        className="rounded-lg border border-gray-200"
                                                    >
                                                        <AccordionTrigger className="text-base font-semibold px-3 py-2 hover:bg-gray-50 data-[state=open]:bg-blue-50">
                                                            {group.category}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-3 pb-2">
                                                            {group.items.map((sub, sIdx) => {
                                                                const subName = sub.subCategory;
                                                                return (
                                                                    <Accordion
                                                                        key={sIdx}
                                                                        type="multiple"
                                                                        className="space-y-1"
                                                                    >
                                                                        <AccordionItem
                                                                            value={`sub-${sIdx}`}
                                                                            className="rounded-md border border-gray-100"
                                                                        >
                                                                            <AccordionTrigger className="text-sm font-medium px-3 py-2 hover:bg-gray-50 data-[state=open]:bg-blue-50">
                                                                                {subName}
                                                                            </AccordionTrigger>
                                                                            <AccordionContent className="pl-4 pb-2 space-y-1">
                                                                                {/* exams */}
                                                                                {Array.isArray(sub.exams) &&
                                                                                    typeof sub.exams[0] === "string" ? (
                                                                                    <ul className="space-y-1">
                                                                                        {sub.exams.map((exam, eIdx) => (
                                                                                            <li key={eIdx}>
                                                                                                <Link
                                                                                                    href={`/${slugify(exam)}`}
                                                                                                    className="block px-2 py-1 rounded-md text-gray-600 hover:bg-blue-50 hover:text-[#0000D3]"
                                                                                                >
                                                                                                    {exam}
                                                                                                </Link>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <Accordion type="multiple">
                                                                                        {(sub.exams as ExamStateGroup[]).map(
                                                                                            (subState, stIdx) => (
                                                                                                <AccordionItem
                                                                                                    key={stIdx}
                                                                                                    value={`state-${stIdx}`}
                                                                                                    className="rounded-md border border-gray-100"
                                                                                                >
                                                                                                    <AccordionTrigger className="text-sm font-medium px-2 py-1 hover:bg-gray-50 data-[state=open]:bg-blue-50">
                                                                                                        {subState.state}
                                                                                                    </AccordionTrigger>
                                                                                                    <AccordionContent className="pl-3 pb-2">
                                                                                                        <ul className="space-y-1">
                                                                                                            {subState.exams.map(
                                                                                                                (ex, i) => (
                                                                                                                    <li key={i}>
                                                                                                                        <Link
                                                                                                                            href={`/${slugify(
                                                                                                                                ex
                                                                                                                            )}`}
                                                                                                                            className="block px-2 py-1 rounded-md text-gray-600 hover:bg-blue-50 hover:text-[#0000D3]"
                                                                                                                        >
                                                                                                                            {ex}
                                                                                                                        </Link>
                                                                                                                    </li>
                                                                                                                )
                                                                                                            )}
                                                                                                        </ul>
                                                                                                    </AccordionContent>
                                                                                                </AccordionItem>
                                                                                            )
                                                                                        )}
                                                                                    </Accordion>
                                                                                )}
                                                                            </AccordionContent>
                                                                        </AccordionItem>
                                                                    </Accordion>
                                                                );
                                                            })}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            )}
                        </Accordion>

                        {/* mobile buttons */}
                        {isLoggedIn && (
                            <Link
                                href="/student/dashboard"
                                className="block w-full bg-gray-200 text-[#002856] text-center py-2 rounded font-semibold hover:bg-gray-300"
                            >
                                Dashboard
                            </Link>
                        )}
                        {isLoggedIn ? (
                            <button
                                onClick={logout}
                                className="block w-full bg-red-600 text-white text-center py-2 rounded font-semibold hover:bg-red-700"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full bg-[#0000D3] text-white text-center py-2 rounded font-semibold hover:bg-blue-800"
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
