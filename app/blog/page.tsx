"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const categories = ["Notifications", "Syllabus", "Strategy", "Motivation"];
const articles = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Sample Article Title ${i + 1}`,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, justo vitae dictum blandit, arcu odio consequat erat, at commodo.",
    category: categories[i % categories.length],
}));

export default function ArticlesPage() {
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 6;

    const filteredArticles = articles.filter(
        (a) =>
            (!currentCategory || a.category === currentCategory) &&
            a.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const displayedArticles = filteredArticles.slice(
        (currentPage - 1) * articlesPerPage,
        currentPage * articlesPerPage
    );

    return (
        <main className="pt-28 max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">Articles</h1>

            {/* Categories */}
            <div className="flex overflow-x-auto space-x-3 mb-8 pb-2 no-scrollbar">
                <button
                    className={`flex-shrink-0 px-5 py-2 rounded-full font-medium transition-all ${!currentCategory
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 hover:bg-blue-100"
                        }`}
                    onClick={() => setCurrentCategory(null)}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`flex-shrink-0 px-5 py-2 rounded-full font-medium transition-all ${currentCategory === cat
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-blue-100"
                            }`}
                        onClick={() => setCurrentCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>


            {/* Search */}
            <div className="relative mb-10 max-w-md">
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full rounded-full border border-gray-300 px-4 py-2 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedArticles.map((article) => (
                    <motion.div
                        key={article.id}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                        <h2 className="font-semibold text-xl mb-2 text-gray-800">{article.title}</h2>
                        <p className="text-gray-600 mb-3">{article.body}</p>
                        <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600 font-medium">
                            {article.category}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 mb-8 gap-3 flex-wrap">
                <button
                    className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`px-4 py-2 rounded-full border font-medium transition ${currentPage === i + 1
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-blue-100 hover:text-blue-600"
                            }`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </main>
    );
}
