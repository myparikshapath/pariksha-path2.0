/* --------- GREEN THEME NAVBAR (UPDATED) --------- */

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
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

import examData from "@/public/data/exams.json";

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
  const { isLoggedIn, role, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (hoveredDropdown) {
      const examsDropdown = navLinks.find((link) => link.name === hoveredDropdown)?.dropdown;
      if (examsDropdown && examsDropdown.length > 0 && !activeCategory) {
        setActiveCategory(examsDropdown[0].category); // SSC or first category
      }
      document.body.style.overflow = "hidden"; // lock background scroll
    } else {
      setActiveCategory(null);
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [hoveredDropdown]);



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
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/35 backdrop-blur-2xl shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="block">
          <div className="relative w-40 h-12 sm:w-[200px] sm:h-[50px]">
            <Image
              src="/webLogo.png"
              alt="ParikshaPath Logo"
              // height={800}
              // width={200}
              fill
              sizes="(max-width: 640px) 160px, 200px"
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* ---------- DESKTOP MENU ---------- */}
        <ul className="hidden lg:flex flex-1 justify-center items-start space-x-6 font-bold">
          {navLinks.map((link, idx) => (
            <li key={idx} className="relative group">
              {link.dropdown ? (
                <button
                  type="button"
                  onClick={() =>
                    setHoveredDropdown(
                      hoveredDropdown === link.name ? null : link.name
                    )
                  }
                  className="cursor-pointer flex items-center space-x-1 hover:text-[#2E4A3C] transition-colors text-md font-bold"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  href={link.href!}
                  className={`hover:text-[#2E4A3C] transition-colors ${isActive(link.href!)
                    ? "text-[#869C51]"
                    : "text-gray-900"
                    } text-[16px]`}
                >
                  {link.name}
                </Link>
              )}

              {/* --- DESKTOP MEGA DROPDOWN --- */}
              <AnimatePresence>
                {hoveredDropdown === link.name && link.dropdown && (
                  <>
                    {/* Overlay blur background */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setHoveredDropdown(null)}
                    ></motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-sm mt-4 w-[92vw] max-w-[1600px] h-[80vh] z-50 border border-gray-200 flex ${isLoggedIn ? `ml-12` : `ml-[-60px]`
                        }`}
                    >
                      {/* LEFT panel - categories */}
                      <div className="w-[28%] max-w-[360px] border-r border-gray-100 overflow-y-auto bg-gradient-to-b from-green-50 to-green-100">
                        {link.dropdown.map((group: DropdownGroup, i) => (
                          <motion.button
                            key={i}
                            onClick={() => setActiveCategory(group.category)}
                            className={`w-full text-left px-5 py-3 text-lg font-bold transition-all duration-300 rounded-r-full
                ${activeCategory === group.category
                                ? "bg-green-100 text-green-800 shadow-inner"
                                : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                              }`}
                            whileHover={{ x: 4 }}
                          >
                            {group.category}
                          </motion.button>
                        ))}
                      </div>

                      {/* RIGHT panel - exams (scrollable only inside panel) */}
                      <motion.div
                        // key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="flex-1 p-7 overflow-y-auto"
                      >
                        {link.dropdown
                          .filter((g) => g.category === activeCategory)
                          .map((group, gi) => (
                            <div key={gi} className="space-y-8">
                              <h3 className="text-2xl font-extrabold text-green-900">
                                {group.category}
                              </h3>

                              {group.items.map((sub, si) => (
                                <section key={si}>
                                  <h4 className="text-xl font-semibold text-green-800 mb-4">
                                    {sub.subCategory}
                                  </h4>

                                  {/* direct exams */}
                                  {Array.isArray(sub.exams) &&
                                    typeof sub.exams[0] === "string" ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                      {sub.exams.map((ex, i) => (
                                        <motion.div
                                          key={i}
                                          whileHover={{ scale: 1.05, y: -4 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 250,
                                          }}
                                        >
                                          <Link
                                            onClick={() => setHoveredDropdown(null)}
                                            href={`/course/${slugify(ex)}`}
                                            className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-green-50 hover:border-green-400 hover:text-green-900 shadow-sm transition-all"
                                          >
                                            {ex}
                                          </Link>
                                        </motion.div>
                                      ))}
                                    </div>
                                  ) : (
                                    // state-level exams
                                    <div className="space-y-6">
                                      {(sub.exams as ExamStateGroup[]).map(
                                        (subState, sti) => (
                                          <div key={sti}>
                                            <div className="text-lg font-bold text-gray-900 mb-3">
                                              {subState.state}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                              {subState.exams.map((ex, ei) => (
                                                <motion.div
                                                  key={ei}
                                                  whileHover={{
                                                    scale: 1.05,
                                                    y: -4,
                                                  }}
                                                  transition={{
                                                    type: "spring",
                                                    stiffness: 250,
                                                  }}
                                                >
                                                  <Link
                                                    onClick={() => setHoveredDropdown(null)}
                                                    href={`/course/${slugify(
                                                      ex
                                                    )}`}
                                                    className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-green-50 hover:border-green-400 hover:text-green-900 shadow-sm transition-all"
                                                  >
                                                    {ex}
                                                  </Link>
                                                </motion.div>
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
                      </motion.div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        {/* ---------- DESKTOP RIGHT SECTION ---------- */}
        <div className="hidden lg:flex items-center space-x-4">
          {isLoggedIn === true && (
            <Link
              href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
              className="bg-gray-200 text-[#2E4A3C] px-6 py-2 rounded font-bold hover:bg-gray-300 shadow-xl transition transform hover:-translate-y-1 hover:scale-100"
            >
              {role === "admin" ? "Admin Dashboard" : "Dashboard"}
            </Link>
          )}

          {isLoggedIn === true ? (
            <button
              onClick={logout}
              className="bg-red-600 text-white px-8 py-2 rounded font-bold hover:bg-red-700 transition shadow-xl transform hover:-translate-y-1 hover:scale-100 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-yellow-400 text-black px-8 py-2 rounded-lg font-bold hover:bg-yellow-500 shadow-xl transition transform hover:-translate-y-1 hover:scale-100"
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
                    className={`block py-2 font-extrabold hover:text-[#2E4A3C] ${isActive(link.href!)
                      ? "text-[#869C51]"
                      : "text-gray-900"
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
                    <AccordionTrigger className="text-lg font-bold px-4 py-3 hover:bg-green-50 data-[state=open]:bg-green-100">
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
                            <AccordionTrigger className="text-base font-semibold px-3 py-2 hover:bg-gray-50 data-[state=open]:bg-green-50">
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
                                      <AccordionTrigger className="text-sm font-medium px-3 py-2 hover:bg-gray-50 data-[state=open]:bg-green-50">
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
                                                  href={`/course/${slugify(
                                                    exam
                                                  )}`}
                                                  className="block px-2 py-1 rounded-md text-gray-600 hover:bg-green-50 hover:text-[#2E4A3C]"
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
                                                  <AccordionTrigger className="text-sm font-medium px-2 py-1 hover:bg-gray-50 data-[state=open]:bg-green-50">
                                                    {subState.state}
                                                  </AccordionTrigger>
                                                  <AccordionContent className="pl-3 pb-2">
                                                    <ul className="space-y-1">
                                                      {subState.exams.map(
                                                        (ex, i) => (
                                                          <li key={i}>
                                                            <Link
                                                              href={`/course/${slugify(
                                                                ex
                                                              )}`}
                                                              className="block px-2 py-1 rounded-md text-gray-600 hover:bg-green-50 hover:text-[#2E4A3C]"
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
            {isLoggedIn === true && (
              <Link
                href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
                className="block w-full bg-gray-200 text-[#2E4A3C] text-center py-2 rounded font-semibold hover:bg-gray-300"
              >
                {role === "admin" ? "Admin Dashboard" : "Dashboard"}
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={logout}
                className="block w-full bg-red-600 text-white text-center py-2 rounded font-semibold hover:bg-red-700 "
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full bg-yellow-400 text-black text-center py-2 rounded-lg font-semibold hover:bg-yellow-500"
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
