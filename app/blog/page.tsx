"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Section = {
    heading: string;
    content: string | string[];
    type?: "list" | "steps"; // differentiate between normal lists and numbered steps
};

type Article = {
    id: number;
    title: string;
    sections: Section[];
};
const articles: Article[] = [
    {
        id: 1,
        title: "Exams Are Not the End, They’re Just a Beginning",
        sections: [
            {
                heading: "Introduction",
                content:
                    "Every year, millions of students prepare for exams. Some achieve success, while others face failure. But failure does not mean the end of life. An exam is just a milestone, not the final destination.",
            },
            {
                heading: "Failure is Not Final",
                content: [
                    "If you did not succeed in an exam, it simply means you have another chance to improve.",
                    "Thomas Edison failed 1000 times before inventing the bulb.",
                    "Dr. APJ Abdul Kalam was rejected in his first attempt at ISRO.",
                    "Amitabh Bachchan was rejected by All India Radio.",
                    "But they never gave up. Their persistence turned their failures into great success.",
                ],
                type: "list",
            },
            {
                heading: "What Exams Really Teach Us",
                content: ["Patience", "Value of time", "Courage to face failure", "Confidence to keep moving forward"],
                type: "list",
            },
            {
                heading: "How to Bounce Back from Failure",
                content: [
                    "Review – Find out where you went wrong and which subjects were weak.",
                    "Plan Again – Create a smart study plan and timetable for next attempt.",
                    "Think Positive – Keep telling yourself 'I can do it.'",
                    "Practice Consistently – Study daily in small portions instead of last-minute cramming.",
                ],
                type: "steps",
            },
            {
                heading: "Conclusion",
                content:
                    "If you failed today, it’s not the end – it’s the beginning of your success story. Don’t see exams as the end, see them as a new beginning. 🌟",
            },
        ],
    },
    {
        id: 2,
        title: "Consistency Beats Talent – Every Single Time",
        sections: [
            {
                heading: "Introduction",
                content:
                    "When it comes to success in exams and life, many people believe that talent alone is enough. But the truth is, consistency always outshines raw talent. Talent might give you a head start, but it’s consistency that takes you across the finish line.",
            },
            {
                heading: "Why Consistency Matters",
                content:
                    "Consistency means putting in effort every day, even if it’s small. A student who studies 2 hours daily will achieve more than someone who studies 20 hours once a week.",
            },
            {
                heading: "Talent vs. Consistency",
                content: [
                    "Talent is natural ability.",
                    "Consistency is regular practice.",
                    "A talented student without discipline may fail, but an average student who studies daily can become a topper.",
                ],
                type: "list",
            },
            {
                heading: "Examples from Real Life",
                content: [
                    "Cricketers who practice daily improve more than those relying only on talent.",
                    "Famous scientists and leaders achieved greatness through years of consistent effort.",
                    "Exam toppers often say they didn’t study overnight; they studied every day.",
                ],
                type: "list",
            },
            {
                heading: "How to Build Consistency",
                content: [
                    "Start Small – Even 1 hour daily is enough in the beginning.",
                    "Fix a Routine – Study at the same time every day.",
                    "Stay Accountable – Track your progress in a diary or calendar.",
                    "Avoid Burnout – Take short breaks but don’t skip study days.",
                    "Focus on Progress – Small improvements daily create big results.",
                ],
                type: "steps",
            },
            {
                heading: "The Formula",
                content: "💡 Formula for success: 2 hours daily > 20 hours once a week",
            },
            {
                heading: "Conclusion",
                content:
                    "Consistency beats talent every single time. Talent may shine in the short term, but consistency builds a strong foundation for lifelong success.",
            },
        ],
    },
    {
        id: 3,
        title: "Your Struggles Today Will Become Your Strength Tomorrow",
        sections: [
            {
                heading: "Introduction",
                content:
                    "Every student faces struggles during exam preparation – sleepless nights, stress, and self-doubt. But these struggles are not wasted; they become the foundation of your strength.",
            },
            {
                heading: "Struggles Make You Stronger",
                content: [
                    "Struggles teach patience.",
                    "They prepare you for challenges in life.",
                    "They shape your mental and emotional strength.",
                ],
                type: "list",
            },
            {
                heading: "Examples from Great Personalities",
                content: [
                    "Dr. APJ Abdul Kalam faced many failures before becoming 'Missile Man of India.'",
                    "Thomas Edison failed over 1000 times before inventing the bulb.",
                    "Every successful person has a story of struggles.",
                ],
                type: "list",
            },
            {
                heading: "How to Handle Struggles",
                content: [
                    "Stay Positive – Struggles are temporary.",
                    "Journal Your Journey – Write down your progress.",
                    "Practice Meditation – Keep your mind calm.",
                    "Never Give Up – Remember why you started.",
                ],
                type: "steps",
            },
            {
                heading: "Conclusion",
                content:
                    "Your struggles are not signs of weakness, but signs of growth. What feels tough today will become your greatest strength tomorrow.",
            },
        ],
    },
    {
        id: 4,
        title: "Hard Work vs Smart Work – Which One Wins in Exams?",
        sections: [
            {
                heading: "Introduction",
                content:
                    "When it comes to exam preparation, students often wonder: should I work hard or work smart? The truth is, both are important, but in different ways.",
            },
            {
                heading: "Hard Work",
                content:
                    "Hard work means consistency, discipline, and dedication. It is about putting in regular effort, staying focused, and never giving up.",
            },
            {
                heading: "Smart Work",
                content:
                    "Smart work means studying with planning and prioritizing. It includes learning techniques like time management, revision strategies, and focusing on important topics first.",
            },
            {
                heading: "Examples from Toppers",
                content: [
                    "Many toppers study fewer hours than others but with proper planning.",
                    "They focus on quality, not just quantity.",
                    "They balance hard work with smart techniques.",
                ],
                type: "list",
            },
            {
                heading: "Conclusion",
                content:
                    "Hard work builds discipline, while smart work gives direction. A balance of both is the real formula for success in exams.",
            },
        ],
    },
    {
        id: 5,
        title: "Why Self-Belief is Your Strongest Weapon",
        sections: [
            {
                heading: "Introduction",
                content:
                    "Exams test more than just your knowledge – they test your confidence and belief in yourself. Even the brightest students can underperform if they lack self-belief, while average students can achieve greatness by trusting their abilities.",
            },
            {
                heading: "The Power of Self-Belief",
                content:
                    "Self-belief is the mindset that says, 'Yes, I can do it.' When you believe in yourself, challenges look smaller, problems seem solvable, and exams feel like opportunities instead of threats.",
            },
            {
                heading: "Why Students Lose Self-Belief",
                content: [
                    "Fear of failure",
                    "Comparing with others",
                    "Pressure from parents or society",
                    "Past mistakes or low scores",
                ],
                type: "list",
            },
            {
                heading: "How Self-Belief Impacts Success",
                content: [
                    "A confident student walks into the exam hall with a calm mind and performs better.",
                    "Self-belief reduces stress and boosts focus.",
                    "It helps you stay consistent, even when the journey is tough.",
                ],
                type: "list",
            },
            {
                heading: "Ways to Build Self-Belief",
                content: [
                    "Positive Affirmations – Repeat daily: 'I am capable. I can do this.'",
                    "Visualize Success – Imagine yourself writing exams with confidence.",
                    "Stop Comparisons – Focus on your own growth, not others.",
                    "Learn from Mistakes – Treat them as lessons, not setbacks.",
                    "Celebrate Progress – Acknowledge even small achievements.",
                ],
                type: "steps",
            },
            {
                heading: "Real-Life Example",
                content:
                    "There are countless stories of students who were considered 'average' but cleared tough exams because they trusted themselves. Self-belief can turn weakness into strength and doubts into determination.",
            },
            {
                heading: "Conclusion",
                content:
                    "Your knowledge, preparation, and notes matter, but your strongest weapon will always be your belief in yourself. When you enter the exam hall with confidence, half the battle is already won. ✨ Remember: If you believe you can, you are already halfway there.",
            },
        ],
    },
];


// --- Modern Renderers ---

function AccentList({ items }: { items: string[] }) {
    return (
        <div className="space-y-3">
            {items.map((line, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-l-4 border-[#2E4A3C] pl-4 text-gray-800 text-lg leading-relaxed"
                >
                    {line}
                </motion.div>
            ))}
        </div>
    );
}

function StepList({ items }: { items: string[] }) {
    return (
        <div className="space-y-5">
            {items.map((line, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 sm:gap-4"
                >
                    {/* Number Circle */}
                    <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#2E4A3C] text-white font-semibold text-sm sm:text-lg flex-shrink-0">
                        {i + 1}
                    </div>

                    {/* Text */}
                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                        {line}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

export default function ArticlesPanels() {
    const [index, setIndex] = useState(0);
    const article = articles[index];

    const next = () => setIndex((i) => (i + 1) % articles.length);
    const prev = () => setIndex((i) => (i - 1 + articles.length) % articles.length);

    return (
        <div className="bg-gray-50 min-h-screen py-16 px-6 flex flex-col items-center">
            {/* Title */}
            <motion.div
                key={article.id + "-title"}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-extrabold text-[#2E4A3C] leading-tight">
                    {article.title}
                </h1>
                {/* <div className="h-1 w-[50vw] mx-auto mt-2 bg-yellow-400 rounded-full" /> */}
            </motion.div>

            {/* Panels */}
            <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8"
            >
                {article.sections.map((sec, i) => (
                    <div
                        key={i}
                        className="bg-white shadow-lg rounded-xl p-6 sm:p-8 md:p-10 hover:shadow-xl transition"
                    >
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[#2E4A3C]">
                            {sec.heading}
                        </h2>
                        <div className="h-1 w-24 sm:w-36 mb-5 bg-yellow-400 rounded-full" />
                        {Array.isArray(sec.content) ? (
                            sec.type === "steps" ? (
                                <StepList items={sec.content} />
                            ) : (
                                <AccentList items={sec.content} />
                            )
                        ) : (
                            <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                                {sec.content}
                            </p>
                        )}
                    </div>
                ))}
            </motion.div>


            {/* Navigation */}
            <div className="flex justify-center mt-14 gap-6 items-center">
                <button
                    onClick={prev}
                    className="flex items-center gap-2 px-3 py-3 rounded-full bg-gray-200 hover:bg-green-100 text-[#2E4A3C] font-semibold text-lg transition shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* 👇 Status indicator */}
                <span className="text-[#2E4A3C] font-medium text-lg">
                    {index + 1} / {articles.length}
                </span>

                <button
                    onClick={next}
                    className="flex items-center gap-2 px-3 py-3 rounded-full bg-[#2E4A3C] text-white font-semibold text-lg shadow-md hover:opacity-90 transition"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

        </div>
    );
}
