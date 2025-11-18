"use client";
import { MessageCircle, Mail } from "lucide-react";

export default function FloatingContact() {
  const whatsappNumber = "918059562135"; // without + and spaces
  const email = "support@myparikshapath.in";

  return (
    <>
      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <MessageCircle size={28} />
      </a>

      {/* Email Button */}
      <a
        href={`mailto:${email}`}
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-yellow-400 text-black rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
      >
        <Mail size={28} />
      </a>
    </>
  );
}
