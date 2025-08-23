"use client"
// import Navbar from "../components/Navbar"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <>
      {/* <main className="flex items-center justify-center h-screen"> */}
      {/* <Home /> */}
      <main className="pt-28 md:pt-32 lg:pt-36">

        {/* ===== Hero Section ===== */}
        <section className="w-full max-w-7xl mx-auto px-6">
          <div className="relative h-[400px] md:h-[500px] bg-gray-200 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-600 text-center">
              Welcome to <span className="text-blue-600">Pariksha Path</span>
            </h1>
          </div>
        </section>

        {/* ===== About / Intro Section ===== */}
        <section className="w-full max-w-5xl mx-auto px-6 mt-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            Your Pathway to Success
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600 leading-relaxed max-w-3xl mx-auto"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec sapien vel
            urna ultrices scelerisque sit amet id nunc. Aliquam erat volutpat. Suspendisse
            potenti. Pellentesque habitant morbi tristique senectus et netus.
          </motion.p>
        </section>

        {/* ===== Highlights Section ===== */}
        <section className="w-full max-w-7xl mx-auto px-6 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[1, 2, 3].map((highlight) => (
            <motion.div
              key={highlight}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
              <h3 className="font-semibold text-lg mb-2">Highlight {highlight}</h3>
              <p className="text-gray-600 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut quam nec nisi.
              </p>
            </motion.div>
          ))}
        </section>

        {/* ===== CTA Section ===== */}
        <section className="w-full max-w-6xl mx-auto px-6 mt-24 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#0000D3] to-[#4a4ae4] text-white rounded-lg shadow-lg p-10 flex flex-col md:flex-row items-center justify-between"
          >
            <h3 className="text-2xl font-bold mb-4 md:mb-0 text-center md:text-left">
              Start your preparation journey today!
            </h3>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              Get Started
            </Button>
          </motion.div>
        </section>
      </main>
      {/* </main> */}
    </>
  );
}
