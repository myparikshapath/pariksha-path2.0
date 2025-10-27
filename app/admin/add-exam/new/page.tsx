"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCourse,
  CreateCourseRequest,
} from "@/src/services/courseService";
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
    validity_period_days: 365,
    mock_test_timer_seconds: 3600,
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

  const handleInputChange = <K extends keyof CreateCourseRequest>(
    field: K,
    value: CreateCourseRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      const updatedSections = [...sections, newSection.trim()];
      setSections(updatedSections);
      setFormData((prev) => ({ ...prev, sections: updatedSections }));
      setNewSection("");
    }
  };

  const removeSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
    setFormData((prev) => ({ ...prev, sections: updatedSections }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.code.trim()) throw new Error("Code is required");
      if (!formData.sub_category.trim())
        throw new Error("Sub-category is required");
      if (!formData.description.trim())
        throw new Error("Description is required");
      if (!formData.thumbnail_url.trim())
        throw new Error("Thumbnail URL is required");
      if (sections.length === 0)
        throw new Error("At least one section is required");

      await createCourse(formData);
      router.push("/admin/add-exam");
    } catch (err: unknown) {
      console.error("Error creating course:", err);
      const message =
        err instanceof Error ? err.message : "Failed to create course";
      setError(message);
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
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="mt-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Create New Exam/Course
                </h1>
                <p className="text-lg text-slate-600">
                  Set up a new exam or course with sections for comprehensive
                  question management
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-200/50">
                  <span className="text-sm text-slate-600">Sections: </span>
                  <span className="font-semibold text-emerald-700">
                    {sections.length}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    formData.is_free
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {formData.is_free ? "Free Course" : `₹${formData.price || 0}`}
                </div>
                {!formData.is_free && (formData.discount_percent || 0) > 0 && (
                  <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                    Save ₹
                    {(
                      ((formData.price || 0) *
                        (formData.discount_percent || 0)) /
                      100
                    ).toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
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
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., JEE Main Physics"
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
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
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange(
                      "category",
                      value as CreateCourseRequest["category"]
                    )
                  }
                >
                  <SelectTrigger className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border border-emerald-200 shadow-xl">
                    {EXAM_CATEGORIES.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="hover:bg-emerald-50 focus:bg-emerald-50"
                      >
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
                  onChange={(e) =>
                    handleInputChange("sub_category", e.target.value)
                  }
                  placeholder="e.g., JEE Main, NEET, SSC CGL"
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the course content and objectives..."
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 min-h-[120px]"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Labeled Toggle */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-700 font-medium">Paid Course</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.is_free}
                  onChange={(e) =>
                    handleInputChange("is_free", e.target.checked)
                  }
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
              <span
                className={`font-medium ${
                  formData.is_free ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {formData.is_free ? "Free Course" : "Paid Course"}
              </span>
            </div>

            {!formData.is_free && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="1"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange(
                        "price",
                        val === "" ? 0 : parseFloat(val)
                      );
                    }}
                    className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_percent">Discount (%)</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min={0}
                    max={100}
                    value={
                      formData.discount_percent === 0
                        ? ""
                        : formData.discount_percent
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange(
                        "discount_percent",
                        val === "" ? 0 : parseFloat(val)
                      );
                    }}
                    className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Validity Period */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="validity_period_days">
                Validity Period (Days)
              </Label>
              <Input
                id="validity_period_days"
                type="number"
                min={1}
                max={3650}
                required={true}
                value={
                  (formData.validity_period_days as unknown as string) === "" ||
                  formData.validity_period_days === undefined
                    ? ""
                    : formData.validity_period_days
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    // user cleared input, keep it blank
                    handleInputChange(
                      "validity_period_days",
                      "" as unknown as number
                    );
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      handleInputChange("validity_period_days", num);
                    }
                  }
                }}
                placeholder="365"
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
              />
            {/* Mock Test Timer */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="mock_test_timer_seconds">
                Mock Test Timer (Minutes)
              </Label>
              <Input
                id="mock_test_timer_seconds"
                type="number"
                min={1}
                max={240}
                value={
                  (formData.mock_test_timer_seconds as unknown as string) ===
                    "" || formData.mock_test_timer_seconds === undefined
                    ? ""
                    : Math.floor((formData.mock_test_timer_seconds || 3600) / 60)
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    handleInputChange(
                      "mock_test_timer_seconds",
                      "" as unknown as number
                    );
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      handleInputChange("mock_test_timer_seconds", num * 60); // Convert minutes to seconds
                    }
                  }
                }}
                placeholder="60"
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
              />
              <p className="text-sm text-slate-600">
                Duration for mock tests in minutes (1-240 minutes)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Sections *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex gap-2">
              <Input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g., Physics, Chemistry, Mathematics"
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSection())
                }
              />
              <Button
                type="button"
                onClick={addSection}
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4"
              >
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

        {/* Media URLs */}
        {/* <Card className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL *</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  handleInputChange("thumbnail_url", e.target.value)
                }
                placeholder="https://example.com/thumbnail.jpg"
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url || ""}
                  onChange={(e) =>
                    handleInputChange("icon_url", e.target.value)
                  }
                  placeholder="https://example.com/icon.png"
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner URL</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url || ""}
                  onChange={(e) =>
                    handleInputChange("banner_url", e.target.value)
                  }
                  placeholder="https://example.com/banner.jpg"
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
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
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card> */}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 flex-wrap pt-6 border-t border-slate-200">
          <Button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-6 py-3 shadow-sm transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Course
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
