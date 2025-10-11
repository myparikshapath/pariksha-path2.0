"use client";
import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Book, BarChart2, Globe, Cpu, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import api from "@/utils/api";

export default function Home() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const testimonials = [
    { name: "Amit Sharma", text: "Cracked SBI PO in first attempt!" },
    { name: "Priya Gupta", text: "Cleared SSC CGL with AIR 45." },
    {
      name: "Rohit Singh",
      text: "Selected in Railways thanks to their mock tests.",
    },
    {
      name: "Neha Verma",
      text: "Board exams became so easy with their notes.",
    },
    { name: "Ankit Mehra", text: "AI analysis helped me identify weak areas." },
  ];

  // For stats animation
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // For marquee animation
  const { ref: marqueeSectionRef, inView: marqueeInView } = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  useAnimationFrame((_, delta) => {
    const el = marqueeRef.current;
    if (!paused && el && marqueeInView) {
      const width = el.scrollWidth;
      setOffset((prev) => {
        let next = prev - delta * 0.05;
        if (Math.abs(next) >= width / 2) next = 0;
        return next;
      });
    }
  });

  const hoverButtonClasses =
    "shadow-xl transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer";

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await api.post("/contact", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });

      if (response.status >= 200 && response.status < 300) {
        // const result = response.data;
        setSubmitMessage(
          "Thank you for your message! We will get back to you soon."
        );
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        const error = response.data;
        setSubmitMessage(
          `Error: ${error.detail || "Something went wrong. Please try again."}`
        );
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitMessage(
        "Error: Unable to connect to server. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-0">
      {/* HERO SECTION */}
      <section className="relative w-full bg-gradient-to-r from-[#2E4A3C] via-[#4F7F52] to-[#9BCB77] text-white py-16 sm:py-20 md:py-28">
        <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-10 px-6 sm:px-12 md:px-20 max-w-none">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight"
            >
              India&apos;s Smartest Learning Platform for <br />
              <span className="text-yellow-300">Govt Exams & Boards</span>
            </motion.h1>
            <p className="mt-4 text-sm sm:text-base text-green-100 font-medium">
              Live Classes | Mock Tests | Notes | Doubt Solving
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
              <Link
                href="/mock"
                className={`bg-yellow-400 text-[#2E4A3C] font-bold px-6 py-3 rounded-xl ${hoverButtonClasses} text-center`}
              >
                Start Learning Free
              </Link>
              <Link
                href="#popular-courses"
                className="bg-white text-[#2E4A3C] font-bold px-6 py-3 rounded-xl hover:bg-gray-100 shadow-xl transition text-center"
              >
                Explore Courses
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1 flex justify-center md:justify-end relative">
            <div className="rounded-full overflow-hidden shadow-2xl border-4 border-white/20 bg-white/10 backdrop-blur-md">
              <Image
                src="/illustration.png"
                alt="Hero Illustration"
                className="w-64 sm:w-80 md:w-[30rem] object-contain drop-shadow-2xl"
                width={480}
                height={480}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="max-w-6xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center px-4 sm:px-6 md:px-0">
        {[
          { icon: Book, title: "Quality Study Material" },
          { icon: Globe, title: "Exam-Focused Preparation" },
          { icon: Download, title: "Downloadable Resources" },
          { icon: BarChart2, title: "Regular Updates" },
        ].map((feature, idx) => (
          <Card
            key={idx}
            className="shadow-md rounded-xl bg-gradient-to-b from-green-50 to-white hover:shadow-xl"
          >
            <CardContent className="flex flex-col items-center p-6">
              <feature.icon className="w-10 h-10 text-[#2E4A3C] mb-4" />
              <p className="font-semibold text-gray-800 text-sm">
                {feature.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* POPULAR COURSES */}
      <section id="popular-courses" className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E4A3C] text-center">
          Popular Courses
        </h2>
        <div className="w-60 h-1 bg-yellow-400 mx-auto mb-8 mt-2 rounded"></div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 px-2 sm:px-0">
          {[
            { icon: Cpu, name: "Engineering Exams", button: "Start Test Free", href: "/course/jee-mains", },
            {
              icon: BookOpen,
              name: "CTET / Teaching Exams",
              button: "Explore Now",
              href: "/course/ctet",
            },
            {
              icon: BarChart2,
              name: "Competitive Exams",
              button: "Explore Now",
              href: "/course/upsc",
            },
            {
              icon: Globe,
              name: "General Knowledge Quizzes",
              button: "Try Now",
              href: "/mock",
            },
          ].map((course, idx) => (
            <Card
              key={idx}
              className="shadow-md rounded-xl hover:shadow-xl transition h-full flex flex-col"
            >
              <CardContent className="p-6 text-center flex flex-col flex-grow justify-between">
                <course.icon className="text-6xl sm:text-3xl mx-auto mb-4 text-[#2E4A3C]" />
                <p className="font-semibold text-[#2E4A3C]">{course.name}</p>
                <Link
                  href={course.href}
                  className="mt-4 inline-block bg-yellow-400 text-[#2E4A3C] font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 shadow-md transition"
                >
                  {course.button}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section ref={statsRef} className="max-w-6xl mx-auto mt-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E4A3C]">
          Why Choose My Parikshapath ?
        </h2>
        <div className="w-[30vw] h-1 bg-yellow-400 mx-auto mb-8 mt-2 rounded"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: 100, suffix: "+", label: "Students Enrolled" },
            { number: 20, suffix: "+", label: "Tests Daily" },
            { number: 100, suffix: "%", label: "Free Resources" },
            { number: 400, suffix: "+", label: "Courses Available" },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="shadow-md rounded-xl hover:shadow-xl transition"
            >
              <CardContent className="p-6">
                <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#2E4A3C] to-[#9BCB77] bg-clip-text text-transparent">
                  {statsInView ? (
                    <CountUp
                      end={stat.number}
                      duration={2.5}
                      separator=","
                      suffix={stat.suffix}
                    />
                  ) : (
                    "0"
                  )}
                </p>
                <p className="text-gray-700 text-sm sm:text-base font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section
        ref={marqueeSectionRef}
        className="max-w-6xl mx-auto mt-16 px-2 sm:px-0 no-scrollbar mb-12"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E4A3C] text-center">
          Success Stories - Our Students, Our Pride
        </h2>
        <div className="w-[40vw] h-1 bg-yellow-400 mx-auto mb-8 mt-2 rounded"></div>

        <div
          className="relative overflow-x-auto w-full cursor-pointer no-scrollbar"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={marqueeRef}
            className="flex gap-0 min-w-max"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {[...testimonials, ...testimonials].map((item, idx) => (
              <Card
                key={idx}
                className="shadow-lg rounded-2xl min-w-[260px] bg-gradient-to-b from-white to-green-50 hover:shadow-2xl transition flex-shrink-0 m-6"
              >
                <CardContent className="p-6 text-center flex flex-col items-center">
                  {/* WhatsApp-style default DP */}
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4 border-2 border-[#2E4A3C]">
                    <span className="text-xl font-bold text-white">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-[#2E4A3C] font-semibold text-lg">
                    {item.name}
                  </p>
                  <p className="text-gray-700 text-sm mt-2">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="max-w-6xl mx-auto mt-24 px-4 sm:px-0 flex flex-col md:flex-row gap-16 items-start mb-24">
        {/* RIGHT SIDE: IMAGE (on mobile, will appear above form) */}
        <div className="order-1 md:order-2 flex justify-center items-center rounded-2xl overflow-hidden w-1/2 h-1/2 md:w-1/2 md:h-full mx-auto">
          <Image
            src="/formImg.png" // Replace with your image path
            alt="Contact Visual"
            className="w-full h-full object-cover rounded-2xl"
            width={600}
            height={600}
            priority
          />
        </div>

        {/* LEFT SIDE: FORM */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="order-2 md:order-1 flex-1 bg-white rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col justify-between border-1 border-green-100 w-full md:w-1/2"
        >
          <h2 className="text-2xl font-semibold text-[#2E4A3C] mb-8 text-center">
            Send Us a Message
          </h2>

          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "email", label: "Email Address", type: "email" },
            { name: "phone", label: "Phone Number", type: "tel" },
          ].map((field) => (
            <div key={field.name} className="relative mb-5">
              <input
                id={field.name} // 👈 id added
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              />
              <label
                htmlFor={field.name} // 👈 link label to input
                className="absolute left-4 top-2 text-gray-400 text-sm transition-all
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:top-2 peer-focus:text-yellow-500 peer-focus:text-sm"
              >
                {field.label}
              </label>
            </div>
          ))}

          <div className="relative">
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition resize-none"
            />
            <label
              htmlFor="message"
              className="absolute left-4 top-2 text-gray-400 text-sm transition-all
        peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:top-2 peer-focus:text-yellow-500 peer-focus:text-sm"
            >
              Your Message
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-8 w-full font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer ${isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 text-black"
              }`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {submitMessage && (
            <div
              className={`mt-4 p-3 rounded-xl text-center font-medium ${submitMessage.includes("Error")
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
                }`}
            >
              {submitMessage}
            </div>
          )}
        </motion.form>
      </section>
    </main>
  );
}
