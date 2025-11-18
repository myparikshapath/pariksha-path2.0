"use client";
import { useEffect } from "react";
import Loader from "@/components/loader";
import { useAuthStore } from "@/stores/auth";
import { useCoursesStore } from "@/stores/courses";
import { useStoreSelector } from "@/hooks/useStoreSelector";

export default function BootstrapGate({ children }: { children: React.ReactNode }) {
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const loading = useAuthStore((s) => s.loading);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const fetchAllCourses = useStoreSelector(useCoursesStore, (s) => s.fetchAll);

  useEffect(() => {
    if (!bootstrapped) {
      void bootstrap();
    }
  }, [bootstrapped, bootstrap]);

  // Prefetch courses once after bootstrap to warm caches for Navbar/Admin, etc.
  useEffect(() => {
    if (bootstrapped) {
      void fetchAllCourses();
    }
  }, [bootstrapped, fetchAllCourses]);

  if (!bootstrapped || loading) {
    return <Loader />;
  }

  return <>{children}</>;
}
