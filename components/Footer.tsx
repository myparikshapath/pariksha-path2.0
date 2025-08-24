"use client";
import { MessageCircle, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    const phoneNumber = "+919876543210";
    const email = "support@parikshapath.com";
    const whatsappNumber = "919876543210"; // without + and spaces

    return (
        <footer className="w-full bg-gray-900 text-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-y-12 md:gap-y-0 md:gap-x-60 h-auto md:h-[50vh]">

                {/* About Section */}
                <div className="md:flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">Pariksha Path</h2>
                    <p className="text-gray-400">
                        Your trusted platform for exam preparation. We provide courses, mock tests, and study materials to help you succeed in your competitive exams.
                    </p>
                </div>

                {/* Quick Links
                <div className="md:flex-1">
                    <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        {["Home", "About", "Courses", "Mock", "Contact"].map((link) => (
                            <li key={link}>
                                <Link href={`/${link.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-blue-500 transition-colors block">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div> */}

                {/* Popular Courses */}
                <div className="md:flex-1">
                    <h3 className="text-xl font-semibold mb-4">Popular Courses</h3>
                    <ul className="space-y-2">
                        {["NDA", "CDS", "HSSC", "HCS", "SSC"].map((course) => (
                            <li key={course}>
                                <Link href={`/courses/${course.toLowerCase()}`} className="hover:text-blue-500 transition-colors block">
                                    {course}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact & Social */}
                <div className="md:flex-1">
                    <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                    <p className="flex items-center mb-3">
                        <Phone size={20} className="mr-2" />
                        <a href={`tel:${phoneNumber}`} className="hover:text-blue-500">{phoneNumber}</a>
                    </p>
                    <p className="flex items-center mb-3">
                        <Mail size={20} className="mr-2" />
                        <a href={`mailto:${email}`} className="hover:text-blue-500">{email}</a>
                    </p>
                    <p className="flex items-center mb-6">
                        <MessageCircle size={20} className="mr-2" />
                        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                            Chat with us on WhatsApp
                        </a>
                    </p>

                    <div className="flex space-x-4 mt-4">
                        <Link href="#" className="hover:text-[#0000D3]"><Facebook size={24} /></Link>
                        <Link href="#" className="hover:text-blue-500"><Twitter size={24} /></Link>
                        <Link href="#" className="hover:text-red-500"><Instagram size={24} /></Link>
                        <Link href="#" className="hover:text-blue-500"><Linkedin size={24} /></Link>
                    </div>
                </div>

            </div>

            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Pariksha Path. All rights reserved.
            </div>
        </footer>
    );
}
