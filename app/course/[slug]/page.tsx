// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { fetchCourseBySlug, getCourseSections } from "@/src/services/courseService";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Course, SectionDetails } from "@/src/services/courseService";
// import { 
//   BookOpen, 
//   Clock, 
//   DollarSign, 
//   ArrowLeft, 
//   Loader2, 
//   AlertCircle,
//   Eye,
//   Users
// } from "lucide-react";

// const CoursePage = () => {
//   const params = useParams();
//   const router = useRouter();
//   const [course, setCourse] = useState<Course | null>(null);
//   const [sections, setSections] = useState<SectionDetails[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadCourseData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Load course details
//       const courseData = await fetchCourseBySlug(params.slug as string);
//       if (!courseData) {
//         throw new Error("Course not found");
//       }
//       setCourse(courseData);

//       // Load sections with question counts
//       const sectionsData = await getCourseSections(courseData.id);
//       setSections(sectionsData.sections);
//     } catch (e: unknown) {
//       console.error("Error loading course data:", e);
//       setError(e instanceof Error ? e.message : "Failed to load course data");
//     } finally {
//       setLoading(false);
//     }
//   }, [params.slug]);

//   useEffect(() => {
//     loadCourseData();
//   }, [loadCourseData]);

//   const handleSectionClick = (sectionName: string) => {
//     router.push(`/course/${params.slug}/${encodeURIComponent(sectionName)}`);
//   };

//   const handleBackClick = () => {
//     router.back();
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-center items-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//           <span className="ml-2 text-gray-600">Loading course...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error || !course) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center gap-4 mb-6">
//           <Button
//             onClick={handleBackClick}
//             variant="outline"
//             className="flex items-center gap-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Go Back
//           </Button>
//         </div>

//         <div className="text-center py-12">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">
//             {error || "Course not found"}
//           </h2>
//           <p className="text-gray-600">
//             The course you&apos;re looking for doesn&apos;t exist or has been removed.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <Button
//           onClick={handleBackClick}
//           variant="outline"
//           className="flex items-center gap-2"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Go Back
//         </Button>
//       </div>

//       {/* Course Info */}
//       <div className="mb-8">
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <div className="flex items-start justify-between mb-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 {course.title}
//               </h1>
//               {course.sub_category && (
//                 <p className="text-lg text-gray-600 mb-2">
//                   {course.sub_category}
//                 </p>
//               )}
//               {course.code && (
//                 <p className="text-sm text-gray-500">
//                   Course Code: {course.code}
//                 </p>
//               )}
//             </div>
//             <div className="text-right">
//               <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-2">
//                 <DollarSign className="h-6 w-6" />
//                 {course.is_free ? "Free" : `$${course.price.toFixed(2)}`}
//               </div>
//               <div className="text-sm text-gray-500">
//                 {course.is_free ? "No payment required" : "One-time payment"}
//               </div>
//             </div>
//           </div>

//           {course.description && (
//             <p className="text-gray-700 mb-4">{course.description}</p>
//           )}

//           <div className="flex items-center gap-6 text-sm text-gray-600">
//             <div className="flex items-center gap-2">
//               <BookOpen className="h-4 w-4" />
//               <span>
//                 {sections.length} Sections
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Clock className="h-4 w-4" />
//               <span>Self-paced</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Users className="h-4 w-4" />
//               {/* <span>Enrolled Students: {course.enrolled_students_count || 0}</span> */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Sections Grid */}
//       <div>
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">
//           Course Sections
//         </h2>

//         {sections.length === 0 ? (
//           <div className="text-center py-12 border-2 border-dashed rounded-lg">
//             <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">
//               No sections available for this course yet.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {sections.map((section, index) => (
//               <Card
//                 key={index}
//                 className="hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-blue-500"
//                 onClick={() => handleSectionClick(section.name)}
//               >
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                         <span className="text-sm font-semibold text-blue-600">
//                           {index + 1}
//                         </span>
//                       </div>
//                       <CardTitle className="text-lg">{section.name}</CardTitle>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="text-sm text-gray-600">
//                       Section {index + 1} of {sections.length}
//                     </div>
                    
//                     {section.description && (
//                       <p className="text-sm text-gray-700 line-clamp-2">
//                         {section.description}
//                       </p>
//                     )}

//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <Badge variant="outline" className="text-xs">
//                           {section.question_count} questions
//                         </Badge>
//                       </div>
//                       <Button
//                         size="sm"
//                         className="flex items-center gap-2"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleSectionClick(section.name);
//                         }}
//                       >
//                         <Eye className="h-4 w-4" />
//                         View Questions
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CoursePage;