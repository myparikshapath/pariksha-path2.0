"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
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

      // If not admin, redirect to appropriate dashboard or unauthorized
      if (role !== "admin") {
        if (role === "student") {
          router.push("/student/dashboard");
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

  // If not authenticated or not admin, don't render children (will redirect)
  if (!isLoggedIn || role !== "admin") {
    return null;
  }

  // Render admin-only content
  return <>{children}</>;
};
