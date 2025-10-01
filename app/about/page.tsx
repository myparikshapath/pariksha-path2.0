"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
    return (
        <main className="pt-12 px-6 max-w-7xl mx-auto">

            {/* Coaching Overview */}
            <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl text-[#2E4A3C] font-bold mb-4">Who We Are</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Pariksha Path is a newly established institute in 2025, committed to guiding aspirants towards success in competitive exams.
                        With a team of passionate educators and mentors, we focus on creating a strong foundation for every student.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        We combine structured programs, personalized guidance, and innovative learning strategies to ensure holistic growth and exam readiness.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
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
                <h2 className="text-3xl text-[#2E4A3C] font-bold text-center">Why Choose Us</h2>
                <div className="w-52 h-1 bg-yellow-400 mx-auto mb-12 mt-2 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {[
                        { title: "Expert Mentors", desc: "Our educators are experienced professionals who provide guidance tailored to each student’s needs." },
                        { title: "Personalized Learning", desc: "We design study plans and strategies that focus on individual strengths and areas for improvement." },
                        { title: "Holistic Development", desc: "Along with academics, we focus on building confidence, time management, and mental resilience." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-full mb-6 flex items-center justify-center text-white font-bold text-xl">
                                {idx + 1}
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-[#2E4A3C]">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
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
                        To empower students with the knowledge, guidance, and confidence to excel in competitive exams.
                        We aim to nurture <span className="text-yellow-300 font-semibold">talent, discipline, and critical thinking</span>
                        in every learner, fostering both academic and personal growth.
                    </p>
                </motion.div>
            </section>
        </main>
    );
}
