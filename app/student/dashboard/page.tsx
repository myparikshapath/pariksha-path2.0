"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardRedirect() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Redirect to default dashboard view
    // You can customize this based on user preferences or default view
    router.push("/student/dashboard/overview");
  }, [isLoggedIn, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0000D3]"></div>
      </div>
    </div>
  );
}