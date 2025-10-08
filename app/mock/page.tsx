"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Book, User, GraduationCap, Clipboard, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/utils/api";
import Link from "next/link";

interface MockTest {
  id: string;
  title: string;
  description?: string;
  is_free: boolean;
  duration?: number;
  total_marks?: number;
  created_at: string;
  updated_at: string;
  slug?: string; // ✅ Add slug if API provides, else generate from title
}

const mockCategories = [
  { name: "Medical", icon: <Book size={28} /> },
  { name: "Engineering", icon: <GraduationCap size={28} /> },
  { name: "SSC", icon: <Clipboard size={28} /> },
  { name: "Banking", icon: <User size={28} /> },
  { name: "Defence", icon: <GraduationCap size={28} /> },
  { name: "Teaching", icon: <Book size={28} /> },
];

export default function MockPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const [freeTests, setFreeTests] = useState<MockTest[]>([]);
  const [paidTests, setPaidTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAllPaid, setShowAllPaid] = useState(false);

  const freeTestsRef = useRef<HTMLDivElement>(null);
  const paidTestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const freeRes = await api.get("/courses?is_free=true");
        setFreeTests(freeRes.data.courses || []);

        const paidRes = await api.get("/courses?is_free=false");
        setPaidTests(paidRes.data.courses || []);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredFreeTests = freeTests.filter(
    (test) =>
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      (test.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPaidTests = paidTests.filter(
    (test) =>
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      (test.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  // ✅ Scroll to section on Enter
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (filteredFreeTests.length > 0 && freeTestsRef.current) {
        freeTestsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (filteredPaidTests.length > 0 && paidTestsRef.current) {
        paidTestsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-8 max-w-7xl mx-auto px-6 space-y-20">
        {/* ===== Hero Section ===== */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.7 }}
          className="rounded-3xl bg-gradient-to-r from-[#2E4A3C] to-[#869C51] text-white py-20 px-6 text-center shadow-lg"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Boost Your Prep with Mock Tests 🚀
          </h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90 mb-8">
            Attempt free demos, unlock full-length test series, and track your
            progress with detailed insights.
          </p>

          {/* ✅ Search Bar */}
          <div className="max-w-xl mx-auto flex items-center bg-white rounded-xl shadow-md px-4 py-2">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
              className="w-full px-3 py-2 bg-transparent outline-none text-gray-700"
            />
          </div>
        </motion.section>

        {/* ===== Categories Section ===== */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <h2 className="text-3xl font-bold text-center text-[#2E4A3C]">
            Test Categories
          </h2>
          <div className="w-56 h-1 bg-yellow-400 mx-auto mb-8 mt-2 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 mb-12 gap-10 relative">
            {mockCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition"
              >
                <div className="bg-yellow-400 p-4 rounded-full mb-4 shadow">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-lg text-[#2E4A3C]">
                  {cat.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== Free Demo Tests ===== */}
        <motion.section
          ref={freeTestsRef}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 id="free" className="text-3xl font-bold text-center text-[#2E4A3C]">
            Free Demo Tests
          </h2>
          <div className="w-56 h-1 bg-yellow-400 mx-auto mb-12 mt-2 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredFreeTests.length > 0 ? (
              filteredFreeTests.map((test) => (
                <motion.div
                  key={test.id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition-all p-6 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 text-[#2E4A3C]">
                      {test.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {test.description ||
                        "Try a free demo to experience the test interface."}
                    </p>
                  </div>
                  <Link href={`/mock/${test.id}/attempt`}>
                    <Button className="bg-[#869C51] hover:bg-[#6e8343] text-white w-full rounded-lg hover:cursor-pointer">
                      Attempt
                    </Button>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-center col-span-3 text-gray-500">
                No free tests found for &quot;{search}&quot;
              </p>

            )}
          </div>
        </motion.section>

        {/* ===== Paid Test Series ===== */}
        <motion.section
          ref={paidTestsRef}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center text-[#2E4A3C]">
            Paid Test Series
          </h2>
          <div className="w-56 h-1 bg-yellow-400 mx-auto mb-12 mt-2 rounded"></div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : filteredPaidTests.length === 0 ? (
            <p className="text-center text-gray-500">
              No paid test series available right now.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(showAllPaid ? filteredPaidTests : filteredPaidTests.slice(0, 6)).map(
                  (test) => (
                    <motion.div
                      key={test.id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white rounded-2xl shadow hover:shadow-lg transition-all p-6 flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-[#2E4A3C]">
                          {test.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {test.description || "Get full-length tests and detailed solutions."}
                        </p>
                      </div>
                      <Link
                        href={`/course/${test.slug || generateSlug(test.title)}`}
                      >
                        <Button className="bg-[#869C51] hover:bg-[#6e8343] text-white w-full rounded-lg hover:cursor-pointer">
                          Buy Now
                        </Button>
                      </Link>
                    </motion.div>
                  )
                )}
              </div>

              {filteredPaidTests.length > 6 && !showAllPaid && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setShowAllPaid(true)}
                    className="bg-yellow-400 text-[#2E4A3C] hover:bg-yellow-300 rounded-lg px-8 py-4 font-semibold"
                  >
                    Read More
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.section>

        {/* ===== CTA Banner ===== */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-[#869C51] to-[#2E4A3C] py-16 px-6 text-center text-white shadow-lg mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Ace Your Exams?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of learners, attempt unlimited mock tests, and track
            your progress like never before.
          </p>
          <Link href="#free">
            <Button className="bg-yellow-400 text-[#2E4A3C] font-semibold px-10 py-6 rounded-xl shadow hover:bg-yellow-300 transition">
              Get Started
            </Button>
          </Link>
        </motion.section>
      </main>
    </>
  );
}
