// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import api from "@/utils/api";

// interface Exam {
//   id: string;
//   title: string;
//   code: string;
//   category: string;
//   sub_category: string;
//   description: string;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export default function AdminExamsPage() {
//   const router = useRouter();
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const examsPerPage = 15;

//   // Fetch exams
//   useEffect(() => {
//     setLoading(true);
//     api.get("/courses?limit=100")
//       .then((response) => {
//         if (response.data.courses) {
//           const courses = response.data.courses.map((c: any) => ({
//             ...c,
//             is_active: Boolean(c.is_active) // force boolean, default false if missing
//           }));
//           setExams(courses);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching courses:", error);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // Filter exams by search
//   const filteredExams = exams.filter((exam) =>
//     exam.title.toLowerCase().includes(search.toLowerCase())
//   );

//   // Toggle visibility
//   const toggleVisibility = async (examId: string) => {
//     try {
//       const response = await api.put(`/courses/${examId}/toggle-visibility`);
//       if (response.status === 200 && response.data.course) {
//         const updatedCourse = response.data.course;
//         setExams((prev) =>
//           prev.map((exam) =>
//             exam.id === examId
//               ? { ...exam, is_active: Boolean(updatedCourse.is_active) }
//               : exam
//           )
//         );
//       }
//     } catch (error) {
//       console.error("Error toggling visibility:", error);
//     }
//   };

//   // Pagination
//   const totalPages = Math.ceil(filteredExams.length / examsPerPage);
//   const paginatedExams = filteredExams.slice(
//     (currentPage - 1) * examsPerPage,
//     currentPage * examsPerPage
//   );

//   if (loading) {
//     return (
//       <div className="p-6 max-w-7xl mx-20 text-center text-gray-600">
//         Loading courses...
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-20">
//       <Button
//         onClick={() => router.push("/admin/dashboard")}
//         className="mb-6 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-4 py-2 shadow-sm"
//       >
//         <ArrowLeft size={18} /> Back
//       </Button>

//       <h1 className="text-3xl font-bold mb-6 text-green-900">
//         Manage Exam Content
//       </h1>

//       <input
//         type="text"
//         placeholder="Search exams..."
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setCurrentPage(1);
//         }}
//         className="w-full mb-6 border rounded-full px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {paginatedExams.map((exam) => (
//           <motion.div
//             key={exam.id}
//             whileHover={{ scale: 1.03, y: -5 }}
//             transition={{ type: "spring", stiffness: 250 }}
//             className="bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-black shadow-md rounded-2xl p-6 flex flex-col justify-between transition-all min-h-[180px]"
//           >
//             <div>
//               <h2 className="text-xl font-semibold">{exam.title}</h2>
//               <p className="text-gray-600 mt-2">{exam.sub_category}</p>
//             </div>

//             <div className="flex items-center justify-between mt-4">
//               <div className="flex items-center space-x-2">
//                 <label className="text-sm text-gray-600">Visible:</label>
//                 <input
//                   type="checkbox"
//                   checked={exam.is_active}
//                   onChange={() => toggleVisibility(exam.id)}
//                   className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
//                 />
//               </div>

//               <button
//                 className="bg-[#2E4A3C] text-white px-4 py-2 rounded-full hover:bg-[#22362c] transition cursor-pointer"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   router.push(
//                     `/admin/exam/${encodeURIComponent(
//                       exam.title.toLowerCase().replace(/\s+/g, "-")
//                     )}`
//                   );
//                 }}
//               >
//                 Manage Content
//               </button>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       <div className="flex justify-center mt-8 space-x-3 items-center">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//           disabled={currentPage === 1}
//           className="p-2 rounded-full border border-gray-300 hover:bg-green-50 disabled:opacity-50 transition"
//         >
//           <ChevronLeft size={20} className="text-green-700" />
//         </button>

//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//           <button
//             key={page}
//             onClick={() => setCurrentPage(page)}
//             className={`px-4 py-2 rounded-full border ${currentPage === page
//                 ? "bg-[#2E4A3C] text-white shadow-md"
//                 : "bg-gray-100 text-gray-700 hover:bg-green-100"
//               } transition`}
//           >
//             {page}
//           </button>
//         ))}

//         <button
//           onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//           disabled={currentPage === totalPages}
//           className="p-2 rounded-full border border-gray-300 hover:bg-green-50 disabled:opacity-50 transition"
//         >
//           <ChevronRight size={20} className="text-green-700" />
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";

interface Exam {
  id: string;
  title: string;
  code: string;
  category: string;
  sub_category: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 15;
  // Fetch exams
  useEffect(() => {
    setLoading(true);
    api
      .get("/courses", { params: { limit: 1000 } })
      .then((response) => {
        const allCourses: any[] = Array.isArray(response.data)
          ? response.data
          : response.data.courses || response.data.data || [];

        if (allCourses.length > 0) {
          console.log("Raw courses from API:", allCourses); // 🔍 check what is_active is
          const courses = allCourses.map((c: any) => {
            return {
              ...c,
              is_active: Boolean(c.is_active), // force boolean
            };
          });
          setExams(courses);
        } else {
          console.log("No courses found");
          setExams([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setError(
          "Failed to load courses. Please check your connection and try again."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter exams by search
  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle visibility
  const toggleVisibility = async (examId: string) => {
    try {
      const response = await api.put(`/courses/${examId}/toggle-visibility`);
      if (response.status === 200 && response.data.course) {
        const updatedCourse = response.data.course;
        setExams((prev) =>
          prev.map((exam) =>
            exam.id === examId
              ? { ...exam, is_active: Boolean(updatedCourse.is_active) }
              : exam
          )
        );
      }
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      // You could add a toast notification here
      alert("Failed to toggle course visibility. Please try again.");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * examsPerPage,
    currentPage * examsPerPage
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-20 text-center text-gray-600">
        Loading courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-20 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-20">
      <Button
        onClick={() => router.push("/admin/dashboard")}
        className="mb-6 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-4 py-2 shadow-sm"
      >
        <ArrowLeft size={18} /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-6 text-green-900">
        Manage Exam Content
      </h1>

      <input
        type="text"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full mb-6 border rounded-full px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedExams.map((exam) => (
          <motion.div
            key={exam.id}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 250 }}
            className="bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-black shadow-md rounded-2xl p-6 flex flex-col justify-between transition-all min-h-[180px]"
          >
            <div>
              <h2 className="text-xl font-semibold">{exam.title}</h2>
              <p className="text-gray-600 mt-2">{exam.sub_category}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Visible:</label>
                <input
                  type="checkbox"
                  checked={exam.is_active}
                  onChange={() => toggleVisibility(exam.id)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
              </div>

              <button
                className="bg-[#2E4A3C] text-white px-4 py-2 rounded-full hover:bg-[#22362c] transition cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/admin/exam/${encodeURIComponent(
                      exam.title.toLowerCase().replace(/\s+/g, "-")
                    )}`
                  );
                }}
              >
                Manage Content
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-8 space-x-3 items-center">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-full border border-gray-300 hover:bg-green-50 disabled:opacity-50 transition"
        >
          <ChevronLeft size={20} className="text-green-700" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-full border ${
              currentPage === page
                ? "bg-[#2E4A3C] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-green-100"
            } transition`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full border border-gray-300 hover:bg-green-50 disabled:opacity-50 transition"
        >
          <ChevronRight size={20} className="text-green-700" />
        </button>
      </div>
    </div>
  );
}
