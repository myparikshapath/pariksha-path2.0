"use client";
import { useState } from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mailto = `mailto:support@parikshapath.com?subject=Contact%20Form&body=Name: ${form.name}%0AEmail: ${form.email}%0APhone: ${form.phone}%0AMessage: ${form.message}`;
        window.location.href = mailto;
    };

    return (
        <main className="bg-gray-50 min-h-screen mt-12">
            <section className="max-w-7xl mx-auto px-6 py-20">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-4xl font-extrabold text-[#2E4A3C]">
                        Contact Us
                    </h1>
                    <div className="mt-3 h-1 w-24 mx-auto bg-yellow-400 rounded-full" />
                    <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                        Have questions or need support? Get in touch with our team - we&apos;ll be happy to help.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

                    {/* Left: Map + Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8 bg-white rounded-2xl shadow-lg p-6 lg:p-8"
                    >
                        <div className="w-full h-72 rounded-xl overflow-hidden shadow-md">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28017.30822899254!2d77.1966518537286!3d28.624860613313185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2b43a255341%3A0x2b687f3210cdd91d!2sNew%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1756055434163!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                allowFullScreen
                                loading="lazy"
                                className="border-0"
                                title="Pariksha Path Location"
                            />
                        </div>

                        <div className="space-y-5">
                            <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-700 hover:text-[#2E4A3C] transition">
                                <Phone size={22} /> +91 9876543210
                            </a>
                            <a href="mailto:support@parikshapath.com" className="flex items-center gap-3 text-gray-700 hover:text-[#2E4A3C] transition">
                                <Mail size={22} /> support@parikshapath.com
                            </a>
                            <a
                                href="https://wa.me/919876543210"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-fit text-white bg-[#25D366] px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-100"
                            >
                                <MessageCircle size={22} /> Chat on WhatsApp
                            </a>
                        </div>
                    </motion.div>

                    {/* Right: Contact Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl shadow-xl p-10 flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-2xl font-semibold text-center text-[#2E4A3C] mb-8">
                                Send Us a Message
                            </h2>

                            {/* Input Fields */}
                            {[
                                { name: "name", label: "Full Name", type: "text" },
                                { name: "email", label: "Email Address", type: "email" },
                                { name: "phone", label: "Phone Number", type: "tel" },
                            ].map((field) => (
                                <div key={field.name} className="relative mb-5">
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name as keyof typeof form]}
                                        onChange={handleChange}
                                        placeholder=" "
                                        required
                                        className="peer w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#869C51] focus:border-[#869C51] transition"
                                    />
                                    <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[#869C51] peer-focus:text-sm">
                                        {field.label}
                                    </label>
                                </div>
                            ))}

                            {/* Textarea */}
                            <div className="relative">
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder=" "
                                    className="peer w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#869C51] focus:border-[#869C51] transition resize-none"
                                />
                                <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[#869C51] peer-focus:text-sm">
                                    Your Message
                                </label>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="mt-8 w-full bg-[#869C51] hover:bg-[#434a34] text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:scale-100 cursor-pointer"
                        >
                            Send Message
                        </button>
                    </motion.form>
                </div>
            </section>
        </main>
    );
}
