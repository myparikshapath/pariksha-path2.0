"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  updateCourse,
  getCourseDetails,
  Course,
  UpdateCourseRequest
} from "@/src/services/courseService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Save
} from "lucide-react";

const EditCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<UpdateCourseRequest>({});
  const [sections, setSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseData = await getCourseDetails(courseId);
      setCourse(courseData);

      // Initialize form data
      setFormData({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        is_free: courseData.is_free,
        discount_percent: courseData.discount_percent,
        thumbnail_url: courseData.thumbnail_url,
        icon_url: courseData.icon_url,
        banner_url: courseData.banner_url,
        tagline: courseData.tagline,
        priority_order: courseData.priority_order,
        is_active: courseData.is_active,
      });

      // Extract and filter section names, ensuring no null values
      const sectionNames = (courseData?.sections || [])
        .map(s => s?.name)
        .filter((name): name is string => Boolean(name && name.trim()));
      setSections(sectionNames);
    } catch (e: unknown) {
      console.error('Error loading course:', e);
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);


  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, loadCourse]);


  const handleInputChange = (field: keyof UpdateCourseRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      // Add the new section to the existing sections array
      setSections([...sections, newSection.trim()]);
      setNewSection("");
    }
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    try {
      // Filter out any null values before sending to API
      const filteredSections = sections.filter(s => s && s.trim());
      await updateCourse(courseId, {
        ...formData,
        sections: filteredSections,
      });
      router.push("/admin/add-exam");
    } catch (error) {
      console.error("Error updating course:", error);
      setError("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/admin/add-exam");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="p-4 rounded-full bg-emerald-100">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <span className="ml-3 text-slate-600 text-lg font-medium">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleBack}
             className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Course not found"}
          </h2>
          <p className="text-gray-600">
            The course you&apos;re trying to edit doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={handleBack}
           className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>

        <div className="mt-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Edit Course
                </h1>
                <p className="text-lg text-slate-600">
                  Update course details, pricing, and sections
                </p>
                {course && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {course.code}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${course.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {course.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${course.is_free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {course.is_free ? 'Free' : `₹${course.price?.toFixed(2) || '0'}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-200/50">
                  <span className="text-sm text-slate-600">Sections: </span>
                  <span className="font-semibold text-emerald-700">{sections.length}</span>
                </div>
                {course && !course.is_free && (course.discount_percent || 0) > 0 && (
                  <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                    Save ₹{((course.price || 0) * (course.discount_percent || 0) / 100).toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                  disabled={formData.is_free}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url || ""}
                  onChange={(e) => handleInputChange("thumbnail_url", e.target.value)}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url || ""}
                  onChange={(e) => handleInputChange("icon_url", e.target.value)}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner URL</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url || ""}
                  onChange={(e) => handleInputChange("banner_url", e.target.value)}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline || ""}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount %</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount_percent || 0}
                  onChange={(e) => handleInputChange("discount_percent", parseFloat(e.target.value))}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority_order">Priority Order</Label>
                <Input
                  id="priority_order"
                  type="number"
                  value={formData.priority_order || 0}
                  onChange={(e) => handleInputChange("priority_order", parseInt(e.target.value))}
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 min-h-[120px]"
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_free || false}
                    onChange={(e) => handleInputChange("is_free", e.target.checked)}
                  />
                  <div
                    className={`w-16 h-8 rounded-full transition-colors duration-300 ${
                      formData.is_free ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      formData.is_free ? "translate-x-8" : ""
                    }`}
                  ></div>
                </label>
                <Label htmlFor="is_free" className="font-medium">Free Course</Label>
              </div>

              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_active !== false}
                    onChange={(e) => handleInputChange("is_active", e.target.checked)}
                  />
                  <div
                    className={`w-16 h-8 rounded-full transition-colors duration-300 ${
                      formData.is_active !== false ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      formData.is_active !== false ? "translate-x-8" : ""
                    }`}
                  ></div>
                </label>
                <Label htmlFor="is_active" className="font-medium">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex gap-2">
              <Input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g., Physics, Chemistry, Mathematics"
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSection())}
              />
              <Button
                type="button"
                onClick={addSection}
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4"
              >
                Add
              </Button>
            </div>

            {sections.length > 0 && (
              <div className="space-y-2">
                <Label>Current Sections:</Label>
                <div className="flex flex-wrap gap-2">
                  {sections.map((section, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md text-sm border border-emerald-200"
                    >
                      {section}
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-emerald-600 hover:text-emerald-800 ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-6 py-3 shadow-sm transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
    