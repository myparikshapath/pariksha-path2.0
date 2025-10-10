"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Course {
  id: string;
  title: string;
  code: string;
  category: string;
  sub_category: string;
  is_active: boolean | string | number;
}

type ExamItem = { title: string; code: string };
type SubGroup = { subCategory: string; exams: ExamItem[] };
type GroupType = { category: string; items: SubGroup[] };

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isLoggedIn, role, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [groupedData, setGroupedData] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside (desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        hoveredDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setHoveredDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hoveredDropdown]);

  // Fetch only active courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/courses", {
          params: { limit: 100 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const allCourses: Course[] = Array.isArray(res.data)
          ? res.data
          : res.data.courses || res.data.data || [];

        const activeCourses: Course[] = allCourses.filter(
          (c) =>
            c.is_active === true ||
            c.is_active === "true" ||
            c.is_active === 1
        );

        const grouped: GroupType[] = Object.entries(
          activeCourses.reduce<Record<string, Record<string, ExamItem[]>>>(
            (acc, c) => {
              if (!c.category) return acc;
              if (!acc[c.category]) acc[c.category] = {};
              const sub = c.sub_category || "General";
              if (!acc[c.category][sub]) acc[c.category][sub] = [];
              acc[c.category][sub].push({
                title: c.title,
                code: c.code,
              });
              return acc;
            },
            {}
          )
        ).map(([category, subs]) => ({
          category,
          items: Object.entries(subs).map(([subCategory, exams]) => ({
            subCategory,
            exams: exams.sort((a, b) => a.title.localeCompare(b.title)),
          })),
        }));

        setGroupedData(grouped);
        if (grouped.length > 0) setActiveCategory(grouped[0].category);
      } catch (err: unknown) {
        // Fully type-safe error handling
        if (err instanceof Error) {
          console.error("🔥 Error fetching courses:", err.message);
        } else {
          console.error("🔥 Unknown error fetching courses:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Exams", dropdown: true },
    { name: "Mock", href: "/mock" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/35 backdrop-blur-2xl shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* LOGO */}
        <Link href="/" className="block">
          <div className="relative w-40 h-12 sm:w-[200px] sm:h-[50px]">
            <Image
              src="/webLogo.png"
              alt="My ParikshaPath Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden lg:flex flex-1 justify-center items-start space-x-6 font-bold">
          {navLinks.map((link) => (
            <li key={link.name} className="relative group">
              {link.dropdown ? (
                <button
                  type="button"
                  onClick={() =>
                    setHoveredDropdown(
                      hoveredDropdown === link.name ? null : link.name
                    )
                  }
                  className={`capitalize flex items-center space-x-1 transition-colors text-md font-bold cursor-pointer no-underline ${hoveredDropdown === link.name
                    ? "text-[#869C51]"
                    : "text-gray-900 hover:text-[#4f5c38]"
                    }`}
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  href={link.href!}
                  className={`capitalize hover:text-[#6B7B4D] transition-colors ${isActive(link.href!) ? "text-[#869C51]" : "text-gray-900"
                    } text-[16px] cursor-pointer`}
                >
                  {link.name}
                </Link>
              )}

              {/* DESKTOP DROPDOWN */}
              <AnimatePresence>
                {link.dropdown && hoveredDropdown === "Exams" && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[92vw] max-w-[1250px] mt-3 z-50 cursor-pointer rounded-md"
                  >
                    {/* Background overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-40 bg-black"
                    />

                    {/* Dropdown content */}
                    <div className="relative z-50 bg-white shadow-2xl rounded-md border border-gray-200 flex h-[75vh] overflow-hidden">
                      {/* LEFT panel */}
                      <div className="w-[28%] max-w-[300px] border-r border-gray-100 overflow-auto">
                        {loading ? (
                          <div className="p-6 text-gray-500">Loading...</div>
                        ) : groupedData.length === 0 ? (
                          <div className="p-6 text-gray-500">No active exams</div>
                        ) : (
                          groupedData.map((group) => (
                            <button
                              key={group.category}
                              onClick={() => setActiveCategory(group.category)}
                              className={`w-full text-left px-5 py-3 text-lg font-bold capitalize transition-all duration-150 ${activeCategory === group.category
                                ? "bg-yellow-400 text-gray-800 shadow-inner"
                                : "text-gray-700 hover:text-gray-800 hover:bg-yellow-100"
                                }`}
                            >
                              {group.category}
                            </button>
                          ))
                        )}
                      </div>

                      {/* RIGHT panel */}
                      <div className="flex-1 p-6 overflow-auto">
                        {groupedData.length > 0 && activeCategory ? (
                          groupedData
                            .filter((g) => g.category === activeCategory)
                            .map((group) => (
                              <div key={group.category} className="space-y-6">
                                <h3 className="text-2xl font-extrabold text-gray-800 capitalize">
                                  {group.category}
                                </h3>
                                {group.items.map((sub) => (
                                  <section key={sub.subCategory}>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                      {sub.exams.map((ex) => (
                                        <motion.div
                                          key={ex.code}
                                          whileHover={{ scale: 1.03, y: -3 }}
                                          transition={{ type: "spring", stiffness: 260 }}
                                        >
                                          <Link
                                            href={`/course/${ex.code}`}
                                            onClick={() => setHoveredDropdown(null)}
                                            className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-500 shadow-sm transition-all capitalize"
                                          >
                                            {ex.title}
                                          </Link>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </section>
                                ))}
                              </div>
                            ))
                        ) : (
                          <div className="text-gray-500">Select a category</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        {/* RIGHT SECTION */}
        <div className="hidden lg:flex items-center space-x-4">
          {isLoggedIn && (
            <Link
              href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
              className="bg-gray-200 text-[#2E4A3C] px-6 py-2 rounded font-bold hover:bg-gray-300 shadow-xl transition transform hover:-translate-y-1 capitalize"
            >
              {role === "admin" ? "Admin Dashboard" : "Dashboard"}
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="bg-red-600 text-white px-8 py-2 rounded font-bold hover:bg-red-700 transition shadow-xl transform hover:-translate-y-1"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-yellow-400 text-black px-8 py-2 rounded-lg font-bold hover:bg-yellow-500 shadow-xl transition transform hover:-translate-y-1"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <div className="lg:hidden">
          {menuOpen ? (
            <X size={28} className="cursor-pointer" onClick={() => setMenuOpen(false)} />
          ) : (
            <Menu size={28} className="cursor-pointer" onClick={() => setMenuOpen(true)} />
          )}
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-200 lg:hidden z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="p-4 space-y-3">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="exams">
                        <AccordionTrigger className="font-bold text-gray-900 text-lg cursor-pointer hover:text-yellow-600 transition underline-none py-4">
                          Exams
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 pl-1">
                          {loading ? (
                            <div className="p-2 text-gray-500 text-sm">Loading...</div>
                          ) : groupedData.length === 0 ? (
                            <div className="p-2 text-gray-500 text-sm">No active exams</div>
                          ) : (
                            groupedData.map((group) => (
                              <Accordion key={group.category} type="single" collapsible>
                                <AccordionItem value={group.category}>
                                  <AccordionTrigger className="text-base font-semibold text-gray-900 capitalize px-2 py-2 rounded-md bg-yellow-50 hover:bg-yellow-100 transition cursor-pointer">
                                    {group.category}
                                  </AccordionTrigger>

                                  <AccordionContent className="pl-4 space-y-1">
                                    {group.items.map((sub) => (
                                      <div key={sub.subCategory} className="flex flex-col space-y-1">
                                        {sub.exams.map((ex) => (
                                          <Link
                                            key={ex.code}
                                            href={`/course/${ex.code}`}
                                            onClick={() => setMenuOpen(false)}
                                            className="block text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-2 bg-white hover:bg-yellow-50 hover:text-yellow-600 transition cursor-pointer no-underline"
                                          >
                                            {ex.title}
                                          </Link>
                                        ))}
                                      </div>
                                    ))}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ))
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <Link
                      href={link.href!}
                      onClick={() => setMenuOpen(false)}
                      className={`block text-lg font-bold capitalize cursor-pointer ${isActive(link.href!) ? "text-yellow-600" : "text-gray-900 hover:text-yellow-600"
                        }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Bottom buttons */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                {isLoggedIn && (
                  <Link
                    href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
                    onClick={() => setMenuOpen(false)}
                    className="block bg-yellow-400 text-black px-4 py-2 rounded font-bold text-center hover:bg-yellow-500 cursor-pointer"
                  >
                    {role === "admin" ? "Admin Dashboard" : "Dashboard"}
                  </Link>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 cursor-pointer"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block bg-yellow-400 text-black px-4 py-2 rounded font-bold text-center hover:bg-yellow-500 cursor-pointer"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
