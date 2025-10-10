"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface StudentRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const StudentRoute: React.FC<StudentRouteProps> = ({
  children,
  fallbackPath = "/unauthorized"
}) => {
  const { isLoggedIn, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not logged in, redirect to login
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // If not student, redirect to appropriate dashboard or unauthorized
      if (role !== "student") {
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push(fallbackPath);
        }
        return;
      }
    }
  }, [isLoggedIn, role, loading, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If not authenticated or not student, don't render children (will redirect)
  if (!isLoggedIn || role !== "student") {
    return null;
  }

  // Render student-only content
  return <>{children}</>;
};
