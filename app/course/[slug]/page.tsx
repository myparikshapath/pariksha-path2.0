// app/courses/[slug]/page.tsx
// import { notFound } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";

// ---------- Types ----------
type ExamStateGroup = {
  state: string;
  exams: string[];
};

// type Course = {
//   name: string;
//   exams: string[] | ExamStateGroup[];
// };

// ---------- Mock Data (replace with your API/DB) ----------
const courses = {
  name: "Science",
  exams: [
    { state: "California", exams: ["Physics", "Chemistry"] },
    { state: "Texas", exams: ["Biology", "Astronomy"] },
  ],
};


// ---------- Helper ----------
// async function getCourse(slug: string): Promise<Course | null> {
//   return courses.find((c) => slugify(c.name) === slug) || null;
// }

// ---------- Page Component (Server Component) ----------
// interface PageProps {
//   params: { slug: string };
// }

export default async function CoursePage() {
  // const { slug } = params; // ✅ no await needed
  // const course = await getCourse(slug);

  // if (!course) return notFound();

  const { exams } = courses;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#002856]">{courses.name}</h1>

      {/* Simple Exams */}
      {Array.isArray(exams) && typeof exams[0] === "string" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {(exams).map((ex) => (
            <Link
              key={ex.state}
              href={`/course/${slugify(ex.state)}`}
              className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              {ex.state}
            </Link>
          ))}
        </div>
      ) : (
        // State-level Exams
        <div className="space-y-6">
          {(exams as ExamStateGroup[]).map((subState) => (
            <div key={subState.state}>
              <div className="text-lg font-bold text-black mb-3">
                {subState.state}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {subState.exams.map((ex) => (
                  <Link
                    key={ex}
                    href={`/course/${slugify(ex)}`}
                    className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg"
                  >
                    {ex}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
