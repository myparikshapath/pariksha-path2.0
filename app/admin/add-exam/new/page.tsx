"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, CreateCourseRequest } from "@/src/services/courseService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Plus, X, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EXAM_CATEGORIES = [
  { value: "medical", label: "Medical" },
  { value: "engineering", label: "Engineering" },
  { value: "teaching", label: "Teaching" },
  { value: "govt_exams", label: "Government Exams" },
  { value: "banking", label: "Banking" },
  { value: "defence", label: "Defence" },
  { value: "state_exams", label: "State Exams" },
];

export default function NewExamPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: "",
    code: "",
    category: "engineering",
    sub_category: "",
    description: "",
    price: 0,
    is_free: false,
    discount_percent: 0,
    material_ids: [],
    test_series_ids: [],
    thumbnail_url: "",
    icon_url: "",
    priority_order: 0,
    banner_url: "",
    tagline: "",
    sections: [],
  });

  const [sections, setSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateCourseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      const updatedSections = [...sections, newSection.trim()];
      setSections(updatedSections);
      setFormData(prev => ({ ...prev, sections: updatedSections }));
      setNewSection("");
    }
  };

  const removeSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
    setFormData(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.code.trim()) {
        throw new Error("Code is required");
      }
      if (!formData.sub_category.trim()) {
        throw new Error("Sub-category is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.thumbnail_url.trim()) {
        throw new Error("Thumbnail URL is required");
      }
      if (sections.length === 0) {
        throw new Error("At least one section is required");
      }

      // Create the course
      const result = await createCourse(formData);
      
      // Navigate back to courses list
      router.push("/admin/add-exam");
    } catch (err: any) {
      console.error("Error creating course:", err);
      setError(err?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Exam/Course</h1>
          <p className="text-gray-600 mt-2">
            Create a new exam or course with sections for question management.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., JEE Main Physics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="e.g., JEE-PHYS-2024"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_category">Sub-category *</Label>
                <Input
                  id="sub_category"
                  value={formData.sub_category}
                  onChange={(e) => handleInputChange("sub_category", e.target.value)}
                  placeholder="e.g., JEE Main, NEET, SSC CGL"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the course content and objectives..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => handleInputChange("is_free", checked)}
              />
              <Label htmlFor="is_free">Free Course</Label>
            </div>

            {!formData.is_free && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_percent">Discount (%)</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent || 0}
                    onChange={(e) => handleInputChange("discount_percent", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Sections *</CardTitle>
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
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {sections.length > 0 && (
              <div className="space-y-2">
                <Label>Added Sections:</Label>
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

        {/* Media URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL *</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange("thumbnail_url", e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url || ""}
                  onChange={(e) => handleInputChange("icon_url", e.target.value)}
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner URL</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url || ""}
                  onChange={(e) => handleInputChange("banner_url", e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline || ""}
                onChange={(e) => handleInputChange("tagline", e.target.value)}
                placeholder="e.g., Master Physics for JEE Main"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Course...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
