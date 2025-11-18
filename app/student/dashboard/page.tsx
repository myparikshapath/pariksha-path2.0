"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function StudentDashboardRedirect() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push("/student/dashboard/overview");
  }, [isLoggedIn, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    </div>
  );
}
