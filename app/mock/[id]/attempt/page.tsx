"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";

export default function AttemptPage() {
    const { id } = useParams();
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const res = await api.get(`/tests/${id}/questions`);
                console.log(res.data);
                setQuestions(res.data.items || []);
            } catch (err) {
                console.error("Error fetching questions", err);
            }
        }

        if (id) fetchQuestions();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold text-green-800 mb-6">
                Test Attempt
            </h1>

            {questions && questions.length > 0 ? (
                <div className="space-y-6">
                    {questions.map((q: any, index: number) => (
                        <div
                            key={q.id?.toString() || index} // object ko string bana diya
                            className="bg-white shadow rounded-xl p-4 border border-gray-200"
                        >
                            <p className="text-lg font-semibold text-gray-800 mb-3">
                                {index + 1}. {q.question_text}
                            </p>
                            <ul className="space-y-2">
                                {q.options.map((opt: any, i: number) => (
                                    <li
                                        key={`${q.id?.toString()}-${i}`} // hamesha unique string banega
                                        className="p-3 border rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-500 transition"
                                    >
                                        {opt.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}


                </div>
            ) : (
                <p className="text-gray-600">No questions found.</p>
            )}
        </div>
    );
}
