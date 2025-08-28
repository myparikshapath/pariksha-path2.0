"use client";
import { useRef, useState, useEffect } from "react";

export function useCursorGlow() {
	const ref = useRef<HTMLDivElement>(null);
	const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (ref.current) {
				const rect = ref.current.getBoundingClientRect();
				setCursorPos({
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				});
			}
		};

		const node = ref.current;
		if (node) {
			node.addEventListener("mousemove", handleMouseMove);
			node.addEventListener("mouseleave", () =>
				setCursorPos({ x: -9999, y: -9999 })
			);
		}

		return () => {
			if (node) {
				node.removeEventListener("mousemove", handleMouseMove);
			}
		};
	}, []);

	return { ref, cursorPos };
}
