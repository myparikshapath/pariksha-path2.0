"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ExamContent,
  getExamContentByCode,
} from "@/src/services/examContentService";
import {
  Course,
  // getCourseDetails,
  fetchAvailableCourses,
} from "@/src/services/courseService";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Define Razorpay types
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayWindow extends Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
  };
}

declare const window: RazorpayWindow;

const CoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { user } = useAuth();
  // console.log("this is a new user", user);

  const [examContent, setExamContent] = useState<ExamContent | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // normalize incoming slug once
        const rawSlug = String(slug ?? "")
          .toLowerCase()
          .trim();

        // robust slugifier — removes non-alphanumerics and collapses to hyphens
        const slugify = (s?: string) =>
          String(s ?? "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");


        // console.log("route slug:", rawSlug);

        const content = await getExamContentByCode(rawSlug);
        if (!content) throw new Error("Exam content not found");
        setExamContent(content);

        const courses = await fetchAvailableCourses();
        // console.log(
        //   "courses sample:",
        //   courses.slice(0, 5).map((c: Course) => ({
        //     id: c.id,
        //     code: c.code,
        //     slug: rawSlug,
        //     title: c.title,
        //   }))
        // );

        // const foundCourse = courses.find((c: Course) => {
        //   // try several possible fields
        //   const candidates = [c.code, slug, c.title, c.id];
        //   return candidates.some((field) => {
        //     const fieldStr = Array.isArray(field) ? field[0] : field;
        //     return fieldStr ? slugify(fieldStr) === rawSlug : false;
        //   });
        // });
        const foundCourse = courses.find((c: Course) => {
          const slugified = slugify(c.code || c.title || "");
          return (
            slugified === rawSlug ||
            slugified.replace(/_/g, "-") === rawSlug ||
            rawSlug.replace(/_/g, "-") === slugified
          );
        });
        // console.log("Matched course:", foundCourse);

        setCourse(foundCourse || null);
      } catch (e) {
        console.error("Error loading exam content:", e);
        setError(
          e instanceof Error ? e.message : "Failed to load exam content"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // Helper to dynamically load external scripts
  const loadScript = (src: string) =>
    new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        // If Razorpay was already loaded, resolve immediately
        if ((window as Window & { Razorpay?: unknown }).Razorpay)
          return resolve(true);
        // otherwise wait for the existing script to finish loading
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleBuyNow = async () => {
    try {
      // console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
      if (!course) {
        alert("Course not found!");
        return;
      }

      const price = Number(course.price);
      if (!Number.isFinite(price) || price <= 0) {
        alert("Invalid course price. Please contact support.");
        return;
      }

      setIsProcessing(true);

      // 0️⃣ Ensure Razorpay SDK is loaded
      const sdkLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!sdkLoaded || !(window as Window & { Razorpay?: unknown }).Razorpay) {
        throw new Error("Razorpay SDK failed to load.");
      }

      // 1️⃣ Create Razorpay order on server (amount in paise)
      const amountInPaise = Math.round(price) * 100;
      // console.log("Creating order for amount (paise):", amountInPaise);

      const courseId = String((course as Course).id || course.id || "");
      if (!courseId) {
        throw new Error("Course ID not found for payment.");
      }
      const token = localStorage.getItem("access_token");
      // console.log(token);
      if (!token)
        throw new Error("User not authenticated. Please login again.");

      // with (send token as query param)
      const createRes = await api.post(`/payments/create-order`, {
        amount: amountInPaise,
        currency: "INR",
        course_id: (course as Course).id,
      });

      // console.log("Create order response:", createRes);

      // backend might return different shapes — be flexible
      const createData = (createRes && (createRes.data ?? createRes)) || null;
      // Try common locations for the order id/amount
      const orderFromBody = createData?.order || createData;
      const orderId =
        orderFromBody?.id ||
        orderFromBody?.order_id ||
        createData?.id ||
        createData?.order_id;
      const orderAmount =
        orderFromBody?.amount || createData?.amount || amountInPaise;
      const orderCurrency =
        orderFromBody?.currency || createData?.currency || "INR";

      if (!orderId) {
        // console.error("Create order response:", createData);
        throw new Error(
          "Invalid order response from server. Missing order id."
        );
      }

      // 2️⃣ Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "",
        amount: orderAmount,
        currency: orderCurrency,
        name: "My Parisksha Path",
        description: `Payment for ${course.title}`,
        order_id: orderId,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            // console.log("Razorpay response:", response);

            // 3️⃣ Verify payment on server
            // const verifyRes = await api.post("/payments/verify", {
            //   razorpay_order_id: response.razorpay_order_id,
            //   razorpay_payment_id: response.razorpay_payment_id,
            //   razorpay_signature: response.razorpay_signature,
            //   course_id: course.id,
            // });
            // new (include token in querystring):
            const verifyRes = await api.post(
              `/payments/verify?token=${encodeURIComponent(token)}`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                course_id: course.id,
              }
            );

            const verifyData =
              (verifyRes && (verifyRes.data ?? verifyRes)) || {};
            console.log("verify response:", verifyData);

            const success =
              verifyData?.success ?? verifyData?.verified ?? false;
            if (success) {
              alert(`✅ Successfully enrolled in ${course.title}`);
              router.push("/student/dashboard");
            } else {
              console.error("Payment verification failed:", verifyData);
              alert("❌ Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("❌ Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#2d8a5b" },
        modal: {
          ondismiss: () => {
            console.log("Razorpay modal closed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      console.error("Failed to initiate payment:", err);
      if (err instanceof Error) {
        alert("❌ Failed to initiate payment. " + err.message);
      } else {
        alert("❌ Failed to initiate payment. " + String(err));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <span className="ml-3 text-gray-600 text-lg">
          Loading exam information...
        </span>
      </div>
    );
  }

  if (error || !examContent) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <h3 className="text-lg font-medium text-red-600 mb-2">
          This exam does not exist.
        </h3>
        <p className="text-gray-600 mb-4">
          Please check the URL or go back to <Link href=
            "/" className="text-[#2E4A3C] underline">Home</Link>.
        </p>
      </div>
    );
  }


  const renderSectionContent = (section: {
    header: string;
    content: string;
  }) => {
    if (section.header.toLowerCase().includes("syllabus")) {
      const lines = section.content
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length >= 2) {
        const subjects = lines[0].split(",").map((s) => s.trim());
        const details = lines[1].split(",").map((d) => d.trim());

        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-gray-700">
              <thead className="bg-[#2E4A3C] text-white">
                <tr>
                  <th className="px-4 py-2 border border-gray-300">Subject</th>
                  <th className="px-4 py-2 border border-gray-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 font-medium">
                      {subject}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {details[idx] || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    return (
      <div
        className="prose max-w-none text-black leading-relaxed"
        dangerouslySetInnerHTML={{ __html: section.content }}
      />
    );
  };

  return (
    <div className="container mx-auto px-8 py-12">
      {/* Exam Title + Description Card */}
      <div className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 inline-block border-b-4 border-yellow-400 pb-2">
          {examContent.title}
        </h1>
        {examContent.description && (
          <p className="text-lg text-left leading-relaxed text-gray-900 border-l-4 border-[#2E4A3C] pl-4">
            {examContent.description}
          </p>
        )}
      </div>

      {/* Price + Buy Now */}
      <div className="text-center my-12">
        {course && (
          <div className="text-center my-6">
            <p className="text-2xl font-semibold text-gray-800">
              Price: ₹{course.price}
            </p>
          </div>
        )}
        <button
          onClick={handleBuyNow}
          disabled={isProcessing}
          className={`cursor-pointer px-10 py-3 text-xl font-bold rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${isProcessing
            ? "opacity-60 cursor-not-allowed"
            : "bg-[#2d8a5b] hover:scale-105 hover:shadow-green-400/50 text-white"
            }`}
        >
          {isProcessing ? "Processing…" : "🚀 Buy Now"}
        </button>
      </div>

      {/* Dynamic Sections */}
      <div className="space-y-12">
        {examContent.exam_info_sections
          .filter((section) => section.is_active)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-lg p-8 border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-[#2E4A3C] mb-4 border-b-4 border-yellow-400 inline-block pb-1">
                {section.header}
              </h2>
              {renderSectionContent(section)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CoursePage;
