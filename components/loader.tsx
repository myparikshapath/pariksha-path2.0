"use client";
import { useEffect, useState } from "react";

export default function Loader() {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState(1);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2; // speed of increment
            });
        }, 100);

        const dotsInterval = setInterval(() => {
            setDots((prev) => (prev >= 4 ? 1 : prev + 1)); // animate 1-4 dots
        }, 500);

        // hide loader after complete
        const hideTimeout = setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(dotsInterval);
            setProgress(100);
        }, 5200); // total ~5s

        return () => {
            clearInterval(progressInterval);
            clearInterval(dotsInterval);
            clearTimeout(hideTimeout);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            {/* Animated dots */}
            <div className="text-4xl font-bold mb-4">
                {".".repeat(dots)}
            </div>

            {/* Loading text with progress */}
            <p className="text-lg font-semibold text-gray-700">
                Loading {progress}%
            </p>

            {/* Optional progress bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div
                    className="h-full bg-green-600 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
