"use client";
import { useState } from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";

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
        <main className="max-w-7xl mx-auto px-6 py-16 space-y-16">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Contact Us</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Map & Contact Info */}
                <div className="space-y-6">
                    <div className="w-full h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7004.505951216757!2d77.30098639113308!3d28.622179270460087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce4b7aefba75d%3A0xc69fcbb19f87ffbf!2sVinod%20Nagar%20East%2C%20Delhi%2C%20110091!5e0!3m2!1sen!2sin!4v1755949033869!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            allowFullScreen
                            loading="lazy"
                            className="border-0"
                            title="Pariksha Path Location"
                        />
                    </div>

                    <div className="space-y-4">
                        <a href="tel:+919876543210" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                            <Phone size={20} /> +91 9876543210
                        </a>
                        <a href="mailto:support@parikshapath.com" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                            <Mail size={20} /> support@parikshapath.com
                        </a>
                        <a
                            href="https://wa.me/919876543210"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white bg-green-500 px-5 py-3 rounded-sm shadow-lg hover:bg-green-600 transition transform hover:-translate-y-1 hover:scale-105"
                        >
                            <MessageCircle size={20} /> Chat on WhatsApp
                        </a>
                    </div>
                </div>

                {/* Right: Modern Highlighted Contact Form */}
                <form
                    onSubmit={handleSubmit}
                    className="relative bg-white rounded-sm shadow-2xl p-10 hover:shadow-3xl transition-shadow duration-500 space-y-6 border border-gray-100"
                >
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Send Us a Message</h2>

                    {[
                        { name: "name", label: "Full Name", type: "text" },
                        { name: "email", label: "Email Address", type: "email" },
                        { name: "phone", label: "Phone Number", type: "tel" },
                    ].map((field) => (
                        <div key={field.name} className="relative w-full">
                            <input
                                type={field.type}
                                name={field.name}
                                value={form[field.name as keyof typeof form]}
                                onChange={handleChange}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 rounded-sm px-4 pt-5 pb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                            />
                            <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-blue-500 peer-focus:text-sm">
                                {field.label}
                            </label>
                        </div>
                    ))}

                    <div className="relative w-full">
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder=" "
                            className="peer w-full border border-gray-300 rounded-sm px-4 pt-5 pb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 resize-none"
                        />
                        <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-blue-500 peer-focus:text-sm">
                            Your Message
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#0000D3] hover:bg-blue-700 text-white font-bold py-3 rounded-sm shadow-xl transition transform hover:-translate-y-1 hover:scale-105"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </main>
    );
}
