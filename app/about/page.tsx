"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
    return (
        <main className="pt-24 px-6 max-w-7xl mx-auto">

            {/* Coaching Overview */}
            <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl text-[#2E4A3C] font-bold mb-4">Who We Are</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Pariksha Path is dedicated to guiding aspirants towards success in competitive exams.
                        Our expert mentors, structured programs, and personalized approach ensure that every student excels.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        We believe in holistic preparation, combining academic rigor with mental resilience and strategic guidance.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    {/* <div className="w-full h-48 md:h-60 bg-gradient-to-r from-green-200 to-green-400 rounded-xl shadow-lg"></div> */}
                    <div className="w-full h-48 md:h-60 bg-gradient-to-r from-green-100 to-green-300 rounded-xl shadow-lg relative overflow-hidden transform transition-transform duration-200 hover:scale-102">
                        <Image
                            src="/bg1.jpeg"
                            alt="Pariksha-Path-bg"
                            fill
                            className="object-cover rounded-xl"
                            priority
                        />
                    </div>



                </motion.div>
            </section>

            {/* Why Choose Us */}
            <section className="mt-20">
                <h2 className="text-3xl text-[#2E4A3C] font-bold text-center mb-12">Why Choose Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {["Expert Mentors", "Proven Results", "Holistic Preparation"].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2E4A3C] to-[#9BCB77] rounded-full mb-6 flex items-center justify-center text-white font-bold text-xl">
                                {idx + 1}
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-[#2E4A3C]">{item}</h3>
                            <p className="text-gray-600 text-sm">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut quam nec nisi.
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="mt-20">
                <h2 className="text-3xl text-[#2E4A3C] font-bold text-center mb-12">Our Journey</h2>
                <div className="relative ml-6 md:ml-16">
                    {/* Vertical line */}
                    <div className="absolute top-5 left-1 w-1 h-full bg-gradient-to-b from-[#2E4A3C] to-[#9BCB77] rounded"></div>

                    {[2020, 2021, 2022, 2023].map((year, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-16 relative pl-10"
                        >
                            {/* Circle node */}
                            <div className="absolute -left-4 top-0 w-8 h-8 bg-gradient-to-br from-[#2E4A3C] to-[#9BCB77] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                {year.toString().slice(-2)}
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-[#2E4A3C]">{year}</h3>
                            <p className="text-gray-600 text-sm max-w-xl">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus feugiat est at erat malesuada, at placerat turpis consectetur.
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission Statement */}
            <section className="mt-20 mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-[#2E4A3C] via-[#4F7F52] to-[#9BCB77] text-white rounded-2xl shadow-xl p-10 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <h3 className="text-2xl font-bold mb-4 md:mb-0 text-center md:text-left">
                        Our Mission
                    </h3>
                    <p className="text-green-100 max-w-2xl text-center md:text-left">
                        To empower students with knowledge, guidance, and confidence to excel in competitive exams.
                        We aim to create a learning environment that nurtures{" "}
                        <span className="text-yellow-300 font-semibold">
                            talent, discipline, and critical thinking.
                        </span>
                    </p>
                </motion.div>
            </section>
        </main>
    );
}
