"use client";
import { MessageCircle, Mail, Phone, Facebook, Instagram } from "lucide-react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa"; // ✅ brand icons
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Footer() {
  const phoneNumber = "+919992266559";
  const email = "myparikshapath@gmail.com";
  const whatsappNumber = "919992266559";

  const pathname = usePathname();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  };

  return (
    <footer className="w-full bg-[#101b15] text-gray-200 pt-16 pb-2">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-y-12 md:gap-y-0 md:gap-x-28">
        {/* About Section */}
        <div className="md:flex-1">
          <div onClick={handleLogoClick} className="cursor-pointer w-fit">
            <Image
              src="/webLogo.png"
              alt="My ParikshaPath Logo"
              width={180}
              height={0}
              style={{ height: "auto" }}
              className="object-contain pb-4"
            />
          </div>
          <p className="text-gray-300">
            Your trusted platform for exam preparation. We provide courses, mock
            tests, and study materials to help you succeed in your competitive
            exams.
          </p>
        </div>

        {/* Popular Courses */}
        <div className="md:flex-1">
          <h3 className="text-xl font-semibold mb-4 text-[#D9E2C4]">
            Popular Courses
          </h3>
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

        {/* Legal Section */}
        <div className="md:flex-1">
          <h3 className="text-xl font-semibold mb-4 text-[#D9E2C4]">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/privacy"
                className="hover:text-[#869C51] transition-colors block"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-[#869C51] transition-colors block"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/refund"
                className="hover:text-[#869C51] transition-colors block"
              >
                Refund & Cancellation
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="md:flex-1">
          <h3 className="text-xl font-semibold mb-4 text-[#D9E2C4]">
            Contact Us
          </h3>
          <p className="flex items-center mb-3">
            <Phone size={20} className="mr-2" />
            <Link href={`tel:${phoneNumber}`} className="hover:text-[#869C51]">
              {phoneNumber}
            </Link>
          </p>
          <p className="flex items-center mb-3">
            <Mail size={20} className="mr-2" />
            <Link href={`mailto:${email}`} className="hover:text-[#869C51]">
              {email}
            </Link>
          </p>
          <p className="flex items-center mb-6">
            <MessageCircle size={20} className="mr-2" />
            <Link
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#869C51]"
            >
              Chat with us on WhatsApp
            </Link>
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-4">
            <Link
              href="https://www.facebook.com/people/M-Parikshapath/61580287940692/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#869C51]"
            >
              <Facebook size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/myparikshapath_/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#869C51]"
            >
              <Instagram size={24} />
            </Link>
            <Link
              href="https://whatsapp.com/channel/0029VbBWkrOIt5s1ahSOyl1A"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#869C51]"
            >
              <FaWhatsapp size={24} />
            </Link>
            <Link
              href="https://t.me/MyParikshaPath"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#869C51]"
            >
              <FaTelegramPlane size={24} />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#3D5A4D] mt-8 pt-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()}My Pariksha Path. All rights reserved.
      </div>
    </footer>
  );
}
