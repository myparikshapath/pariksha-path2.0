"use client";
import { MessageCircle, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const phoneNumber = "+919992266559";
    const email = "myparikshapath@gmai.com";
    const whatsappNumber = "919992266559";

    return (
        <footer className="w-full bg-[#101b15] text-gray-200 pt-16 pb-2">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-y-12 md:gap-y-0 md:gap-x-60">

                {/* About Section */}
                <div className="md:flex-1">
                    <Image
                        src="/webLogo.png"
                        alt="ParikshaPath Logo"
                        // fill
                        height={300}
                        width={300}
                        className="object-contain pb-4"
                        priority
                    />
                    {/* <h2 className="text-2xl font-bold text-white mb-4">Pariksha Path</h2> */}
                    <p className="text-gray-300">
                        Your trusted platform for exam preparation. We provide courses, mock tests,
                        and study materials to help you succeed in your competitive exams.
                    </p>
                </div>

                {/* Popular Courses */}
                <div className="md:flex-1">
                    <h3 className="text-xl font-semibold mb-4 text-[#D9E2C4]">Popular Courses</h3>
                    <ul className="space-y-2">
                        {["NDA", "CDS", "HSSC", "HCS", "SSC-CGL"].map((course) => (
                            <li key={course}>
                                <Link
                                    href={`/course/${course.toLowerCase()}`}
                                    className="hover:text-[#869C51] transition-colors block"
                                >
                                    {course}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact & Social */}
                <div className="md:flex-1">
                    <h3 className="text-xl font-semibold mb-4 text-[#D9E2C4]">Contact Us</h3>
                    <p className="flex items-center mb-3">
                        <Phone size={20} className="mr-2" />
                        <a href={`tel:${phoneNumber}`} className="hover:text-[#869C51]">{phoneNumber}</a>
                    </p>
                    <p className="flex items-center mb-3">
                        <Mail size={20} className="mr-2" />
                        <a href={`mailto:${email}`} className="hover:text-[#869C51]">{email}</a>
                    </p>
                    <p className="flex items-center mb-6">
                        <MessageCircle size={20} className="mr-2" />
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#869C51]"
                        >
                            Chat with us on WhatsApp
                        </a>
                    </p>

                    {/* Social Icons */}
                    <div className="flex space-x-4 mt-4">
                        <Link href="https://www.facebook.com/people/M-Parikshapath/61580287940692/" className="hover:text-[#869C51]"><Facebook size={24} /></Link>
                        {/* <Link href="#" className="hover:text-[#869C51]"><Twitter size={24} /></Link> */}
                        <Link href="https://www.instagram.com/myparikshapath_/" className="hover:text-[#869C51]"><Instagram size={24} /></Link>
                        {/* <Link href="#" className="hover:text-[#869C51]"><Linkedin size={24} /></Link> */}
                    </div>
                </div>
            </div>

            <div className="border-t border-[#3D5A4D] mt-8 pt-6 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Pariksha Path. All rights reserved.
            </div>
        </footer>
    );
}
