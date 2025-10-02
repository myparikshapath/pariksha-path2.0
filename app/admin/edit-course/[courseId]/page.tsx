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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading course...</span>
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
            variant="outline"
            className="flex items-center gap-2"
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
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600">Update course details and sections</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url || ""}
                  onChange={(e) => handleInputChange("thumbnail_url", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url || ""}
                  onChange={(e) => handleInputChange("icon_url", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner URL</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url || ""}
                  onChange={(e) => handleInputChange("banner_url", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline || ""}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority_order">Priority Order</Label>
                <Input
                  id="priority_order"
                  type="number"
                  value={formData.priority_order || 0}
                  onChange={(e) => handleInputChange("priority_order", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free || false}
                  onCheckedChange={(checked) => handleInputChange("is_free", checked)}
                />
                <Label htmlFor="is_free">Free Course</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g., Physics, Chemistry, Mathematics"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSection())}
              />
              <Button type="button" onClick={addSection} size="sm">
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
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm"
                    >
                      {section}
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
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
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
