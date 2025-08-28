// "use client"
// // import Navbar from "../components/Navbar"
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// export default function Home() {
//   return (
//     <>
//       {/* <main className="flex items-center justify-center h-screen"> */}
//       {/* <Home /> */}
//       <main className="pt-28 md:pt-32 lg:pt-36">

//         {/* ===== Hero Section ===== */}
//         <section className="w-full max-w-7xl mx-auto px-6">
//           <div className="relative h-[400px] md:h-[500px] bg-gray-200 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
//             <h1 className="text-3xl md:text-5xl font-bold text-gray-600 text-center">
//               Welcome to <span className="text-blue-600">Pariksha Path</span>
//             </h1>
//           </div>
//         </section>

//         {/* ===== About / Intro Section ===== */}
//         <section className="w-full max-w-5xl mx-auto px-6 mt-16 text-center">
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-3xl font-bold mb-6"
//           >
//             Your Pathway to Success
//           </motion.h2>
//           <motion.p
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-gray-600 leading-relaxed max-w-3xl mx-auto"
//           >
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec sapien vel
//             urna ultrices scelerisque sit amet id nunc. Aliquam erat volutpat. Suspendisse
//             potenti. Pellentesque habitant morbi tristique senectus et netus.
//           </motion.p>
//         </section>

//         {/* ===== Highlights Section ===== */}
//         <section className="w-full max-w-7xl mx-auto px-6 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//           {[1, 2, 3].map((highlight) => (
//             <motion.div
//               key={highlight}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center"
//             >
//               <div className="w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
//               <h3 className="font-semibold text-lg mb-2">Highlight {highlight}</h3>
//               <p className="text-gray-600 text-sm">
//                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut quam nec nisi.
//               </p>
//             </motion.div>
//           ))}
//         </section>

//         {/* ===== CTA Section ===== */}
//         <section className="w-full max-w-6xl mx-auto px-6 mt-24 mb-16">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             className="bg-gradient-to-r from-[#0000D3] to-[#4a4ae4] text-white rounded-lg shadow-lg p-10 flex flex-col md:flex-row items-center justify-between"
//           >
//             <h3 className="text-2xl font-bold mb-4 md:mb-0 text-center md:text-left">
//               Start your preparation journey today!
//             </h3>
//             <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
//               Get Started
//             </Button>
//           </motion.div>
//         </section>
//       </main>
//       {/* </main> */}
//     </>
//   );
// }
"use client";
import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Book, BarChart2, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  const testimonials = [
    { name: "Amit Sharma", text: "Cracked SBI PO in first attempt!" },
    { name: "Priya Gupta", text: "Cleared SSC CGL with AIR 45." },
    { name: "Rohit Singh", text: "Selected in Railways thanks to their mock tests." },
    { name: "Neha Verma", text: "Board exams became so easy with their notes." },
    { name: "Ankit Mehra", text: "AI analysis helped me identify weak areas." },
  ];

  useAnimationFrame((_, delta) => {
    const el = marqueeRef.current;
    if (!paused && el) {
      const width = el.scrollWidth;
      setOffset((prev) => {
        let next = prev - delta * 0.05;
        if (Math.abs(next) >= width / 2) next = 0;
        return next;
      });
    }
  });

  const hoverButtonClasses =
    "hover:bg-[#030397] shadow-xl transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer";

  return (
    <main className="pt-16 md:pt-28 px-4 sm:px-6 lg:px-8">
      {/* HERO SECTION */}
      <section className="relative bg-gray-100 rounded-lg max-w-6xl mx-auto mt-8 p-6 sm:p-12 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#002856] leading-tight"
          >
            India&apos;s Smartest Learning Platform for <br />
            <span className="text-[#002856]">Govt Exams & Boards</span>
          </motion.h1>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            Live Classes | Mock Tests | Notes | Doubt Solving
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
            <Link
              href="#"
              className={`bg-[#0000D3] text-white px-6 py-3 rounded-xl ${hoverButtonClasses} text-center`}
            >
              Start Learning Free
            </Link>
            <Link
              href="#"
              className={`bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 shadow-xl transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer text-center`}
            >
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex justify-center md:justify-end">
          <Image
            src="/ilust.png" // Replace with your illustration path
            alt="Hero Illustration"
            className="w-64 sm:w-80 md:w-96"
            width={92}
            height={92}
            priority
          />
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center px-2 sm:px-0">
        {[
          { icon: Book, title: "Expert Faculty" },
          { icon: BarChart2, title: "AI-Based Test Analysis" },
          { icon: Globe, title: "Teaching Exams CTET" },
          { icon: Download, title: "Bilingual (Hindi + English)" },
        ].map((feature, idx) => (
          <Card key={idx} className="shadow-md rounded-xl">
            <CardContent className="flex flex-col items-center p-6">
              <feature.icon className="w-10 h-10 text-[#002856] mb-4" />
              <p className="font-semibold text-gray-700 text-sm">{feature.title}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* POPULAR COURSES */}
      <section className="max-w-6xl mx-auto mt-16">
        <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-[#002856] text-center">
          Popular Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2 sm:px-0">
          {[
            { name: "Banking Exams", button: "Explore Now" },
            { name: "SSC & Railways", button: "Explore Now" },
            { name: "Boards (9-12th)", button: "Start Test Free" },
          ].map((course, idx) => (
            <Card key={idx} className="shadow-md rounded-xl">
              <CardContent className="p-6 text-center">
                <p className="font-semibold text-[#002856]">{course.name}</p>
                <Link
                  href="#"
                  className={`mt-4 inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 shadow-xl transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer`}
                >
                  {course.button}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <h2 className="text-xl sm:text-2xl mt-8 font-extrabold mb-6 text-[#002856] text-center">
        Why Choose My ParikshaPath ?
      </h2>
      <section className="max-w-6xl mx-auto font-bold grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center px-2 sm:px-0">
        {[
          { number: "10,000+", label: "Students Enrolled" },
          { number: "1,000+", label: "Tests Daily" },
          { number: "Free", label: "Resources" },
        ].map((stat, idx) => (
          <Card key={idx} className="shadow-md rounded-xl">
            <CardContent className="p-6">
              <p className="text-2xl sm:text-3xl font-bold text-[#002856]">{stat.number}</p>
              <p className="text-gray-600 text-sm sm:text-base">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* SUCCESS STORIES MARQUEE */}
      <section className="max-w-6xl mx-auto mt-16 px-2 sm:px-0 no-scrollbar">
        <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-center text-[#002856]">
          Success Stories - Our Students, Our Pride
        </h2>
        <div
          className="relative overflow-x-auto w-full cursor-pointer no-scrollbar"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={marqueeRef}
            className="flex gap-4 min-w-max"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {[...testimonials, ...testimonials].map((item, idx) => (
              <Card
                key={idx}
                className="shadow-md rounded-xl min-w-[200px] sm:min-w-[250px] hover:shadow-lg transition-shadow duration-300 flex-shrink-0"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <p className="text-[#002856] font-semibold">{item.name}</p>
                  <p className="text-gray-600 text-sm mt-2">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      {/* <section className="max-w-6xl mx-auto p-8 sm:p-12 mt-16 mb-16 text-center bg-gray-200 rounded-md">
        <h3 className="text-lg sm:text-xl font-bold text-[#002856] mb-4">Download the App</h3>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <Link
            href="https://play.google.com/store/apps/details?id=com.example.app"
            target="_blank"
            className={`bg-black text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 ${hoverButtonClasses}`}
          >
            <Download className="w-5 h-5" /> Play Store
          </Link>
          <Link
            href="https://apps.apple.com/us/app/example-app/id123456789"
            target="_blank"
            className={`bg-black text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 ${hoverButtonClasses}`}
          >
            <Download className="w-5 h-5" /> App Store
          </Link>
        </div>
      </section> */}
    </main>
  );
}
