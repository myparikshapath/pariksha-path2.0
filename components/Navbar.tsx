// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Menu, X, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { motion, AnimatePresence } from "framer-motion";

// const navLinks = [
//     { name: "Home", href: "/" },
//     { name: "About", href: "/about" },
//     {
//         name: "Courses / Programs",
//         dropdown: [
//             { category: "Defence", items: ["NDA", "CDS", "Airforce X/Y", "Navy", "Agniveer"] },
//             { category: "State Exams", items: ["HSSC", "HCS", "Patwari", "Police", "Teachers"] },
//         ],
//     },
//     { name: "Mock", href: "/mock" },
//     { name: "Blog", href: "/blog" },
//     { name: "Contact", href: "/contact" },
// ];

// export default function Navbar() {
//     const pathname = usePathname();
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [dropdownOpen, setDropdownOpen] = useState(false);

//     // Close mobile menu automatically when route changes
//     useEffect(() => {
//         setMenuOpen(false);
//     }, [pathname]);

//     const isActive = (href: string) => pathname === href;

//     return (
//         <nav className="w-full bg-white/90 backdrop-blur-2xl shadow-md fixed top-0 left-0 z-50">
//             <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-6 py-4">
//                 {/* Logo */}
//                 <Link href="/" className="text-2xl font-bold text-blue-700 tracking-tight">
//                     Pariksha Path
//                 </Link>

//                 {/* Desktop Menu */}
//                 <ul className="hidden lg:flex flex-1 justify-center items-center space-x-8 font-medium">
//                     {navLinks.map((link, idx) => (
//                         <li key={idx} className="relative">
//                             {link.dropdown ? (
//                                 <div
//                                     className={`flex items-center cursor-pointer transition-colors ${pathname.startsWith("/courses") ? "text-blue-600" : "hover:text-blue-600"
//                                         }`}
//                                     onMouseEnter={() => setDropdownOpen(true)}
//                                     onMouseLeave={() => setDropdownOpen(false)}
//                                 >
//                                     {link.name} <ChevronDown size={18} className="ml-1" />
//                                 </div>
//                             ) : (
//                                 <Link
//                                     href={link.href}
//                                     className={`transition-colors ${isActive(link.href) ? "text-blue-600" : "hover:text-blue-600"
//                                         }`}
//                                 >
//                                     {link.name}
//                                 </Link>
//                             )}

//                             {/* Dropdown */}
//                             <AnimatePresence>
//                                 {dropdownOpen && link.dropdown && (
//                                     <motion.div
//                                         initial={{ opacity: 0, scale: 0.95, y: -10 }}
//                                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                                         exit={{ opacity: 0, scale: 0.95, y: -10 }}
//                                         transition={{ duration: 0.3 }}
//                                         className="absolute left-1/2 -translate-x-1/2 top-full w-[85vw] max-w-4xl bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-2xl p-6 grid grid-cols-2 gap-8 mt-4"
//                                         onMouseEnter={() => setDropdownOpen(true)}
//                                         onMouseLeave={() => setDropdownOpen(false)}
//                                     >
//                                         {link.dropdown.map((section, sidx) => (
//                                             <div key={sidx}>
//                                                 <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">
//                                                     {section.category}
//                                                 </h3>
//                                                 <ul className="space-y-2">
//                                                     {section.items.map((item, iidx) => (
//                                                         <li
//                                                             key={iidx}
//                                                             className="px-2 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
//                                                         >
//                                                             <Link
//                                                                 href={`/courses/${item.toLowerCase().replace(/\s+/g, "-")}`}
//                                                             >
//                                                                 {item}
//                                                             </Link>
//                                                         </li>
//                                                     ))}
//                                                 </ul>
//                                                 {sidx < link.dropdown.length - 1 && (
//                                                     <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>
//                         </li>
//                     ))}
//                 </ul>

//                 {/* Desktop Login Button */}
//                 <Button asChild className="hidden lg:block bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white px-6 py-2 shadow-md transition-transform hover:scale-105">
//                     <Link href="/login">Login</Link>
//                 </Button>

//                 {/* Mobile Menu Toggle */}
//                 <div className="lg:hidden">
//                     {menuOpen ? (
//                         <X size={28} onClick={() => setMenuOpen(false)} className="cursor-pointer" />
//                     ) : (
//                         <Menu size={28} onClick={() => setMenuOpen(true)} className="cursor-pointer" />
//                     )}
//                 </div>
//             </div>

//             {/* Mobile Dropdown */}
//             <AnimatePresence>
//                 {menuOpen && (
//                     <motion.div
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -20 }}
//                         transition={{ duration: 0.3 }}
//                         className="lg:hidden bg-white/95 backdrop-blur-md shadow-lg px-6 py-4 space-y-4"
//                     >
//                         {navLinks.map((link, idx) => (
//                             <div key={idx}>
//                                 {link.dropdown ? (
//                                     <details className="group">
//                                         <summary className="cursor-pointer font-medium flex items-center justify-between list-none">
//                                             {link.name}
//                                             <ChevronDown
//                                                 size={18}
//                                                 className="ml-2 text-gray-500 transition-transform duration-300 group-open:rotate-180"
//                                             />
//                                         </summary>
//                                         <div className="pl-4 pt-2 space-y-2">
//                                             {link.dropdown.map((section, sidx) => (
//                                                 <div key={sidx}>
//                                                     <p className="font-semibold text-gray-700">{section.category}</p>
//                                                     <ul className="pl-2 space-y-1">
//                                                         {section.items.map((item, iidx) => (
//                                                             <li
//                                                                 key={iidx}
//                                                                 className="hover:text-blue-600 cursor-pointer transition-colors"
//                                                             >
//                                                                 <Link
//                                                                     href={`/courses/${item.toLowerCase().replace(/\s+/g, "-")}`}
//                                                                     className="block w-full"
//                                                                 >
//                                                                     {item}
//                                                                 </Link>
//                                                             </li>
//                                                         ))}
//                                                     </ul>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </details>
//                                 ) : (
//                                     <Link
//                                         href={link.href}
//                                         className={`hover:text-blue-600 cursor-pointer ${isActive(link.href) ? "text-blue-600" : ""
//                                             }`}
//                                     >
//                                         {link.name}
//                                     </Link>
//                                 )}
//                             </div>
//                         ))}
//                         <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
//                             <Link href="/login">Login</Link>
//                         </Button>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </nav>
//     );
// }


"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

    useEffect(() => setMenuOpen(false), [pathname]);

    const isActive = (href: string) => pathname === href;

    // const blue = "#0000D3";
    // const blueHover = "#030397";

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
                        <li
                            key={idx}
                            className="relative group"
                        >
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

                            {/* Mega Dropdown (opens on hover) */}
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


                {/* Desktop Login Button */}
                <Link
                    href="/login"
                    className="hidden lg:inline-block bg-blue-600 text-white px-8 py-2 rounded-xs font-bold text-md shadow-md hover:bg-[#030397] transition-colors"
                >
                    Login
                </Link>

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
                                        {/* Parent Link */}
                                        <div
                                            className="flex justify-between items-center py-2 cursor-pointer text-gray-900 font-semibold hover:text-[#0000D3] transition-colors"
                                            onClick={() => toggleDropdown(link.name)}
                                        >
                                            <span>{link.name}</span>
                                            {dropdownOpen[link.name] ? (
                                                <Minus size={18} />
                                            ) : (
                                                <Plus size={18} />
                                            )}
                                        </div>

                                        {/* Sub Dropdown */}
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

                        {/* Mobile Login Button */}
                        <Link
                            href="/login"
                            className="block w-full bg-blue-600 text-white text-center py-2 rounded-sm font-semibold hover:bg-blue-800 transition-colors"
                        >
                            Login
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

        </nav>
    );
}
