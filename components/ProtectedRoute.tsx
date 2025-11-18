"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "student";
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = "/login"
}) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);
  const loading = useAuthStore((s) => s.loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not logged in, redirect to login
      if (!isLoggedIn) {
        router.push(fallbackPath);
        return;
      }

      // If specific role is required but user doesn't have it
      if (requiredRole && role !== requiredRole) {
        // Redirect based on user role
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "student") {
          router.push("/student/dashboard");
        } else {
          router.push("/unauthorized");
        }
        return;
      }
    }
  }, [isLoggedIn, role, loading, requiredRole, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  // If specific role required but user doesn't have it, don't render (will redirect)
  if (requiredRole && role !== requiredRole) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
};
