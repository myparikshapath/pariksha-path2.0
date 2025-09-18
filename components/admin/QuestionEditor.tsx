"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Save,
  X,
  Edit3,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { QuestionResponse, QuestionUpdateRequest, updateQuestion, deleteQuestion, ImageAttachment, QuestionOption } from '@/src/services/courseService';
import ImageDisplay from './ImageDisplay';
import AddImageButton from './AddImageButton';

interface QuestionEditorProps {
  question: QuestionResponse;
  onSave: (updatedQuestion: QuestionResponse) => void;
  onCancel: () => void;
  onDelete: (questionId: string) => void;
  isEditing: boolean;
  onEdit: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onSave,
  onCancel,
  onDelete,
  isEditing,
  onEdit
}) => {
  const [formData, setFormData] = useState<QuestionUpdateRequest>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: question.title,
        question_text: question.question_text,
        question_type: question.question_type,
        difficulty_level: question.difficulty_level,
        exam_year: question.exam_year,
        options: question.options || [],
        explanation: question.explanation || '',
        explanation_images: question.explanation_images || [],
        remarks: question.remarks || '',
        remarks_images: question.remarks_images || [],
        question_images: question.question_images || [],
        subject: question.subject,
        topic: question.topic,
        tags: question.tags || [],
      });
    }
  }, [isEditing, question]);

  // Debug logging for images
  useEffect(() => {
    console.log('QuestionEditor - Question data:', {
      id: question.id,
      title: question.title,
      question_images: question.question_images,
      explanation_images: question.explanation_images,
      remarks_images: question.remarks_images,
      options: question.options?.map((opt: QuestionOption) => ({
        text: opt.text,
        images: opt.images
      }))
    });
  }, [question]);

  // Simple debug display for testing
  const DebugInfo = () => (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
      <div className="text-sm text-yellow-700 space-y-1">
        <div>Question Images: {question.question_images?.length || 0}</div>
        <div>Explanation Images: {question.explanation_images?.length || 0}</div>
        <div>Remarks Images: {question.remarks_images?.length || 0}</div>
        <div>Options with Images: {question.options?.filter((opt: QuestionOption) => opt.images?.length > 0).length || 0}</div>
        {question.question_images?.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Question Image URLs:</div>
            {question.question_images.map((img: ImageAttachment, idx: number) => (
              <div key={idx} className="text-xs break-all">
                {idx + 1}. {img.url}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  const handleInputChange = <K extends keyof QuestionUpdateRequest>(
    field: K,
    value: QuestionUpdateRequest[K]
  ) => {
    setFormData((prev: QuestionUpdateRequest) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (
    index: number,
    field: keyof QuestionOption,
    value: QuestionOption[keyof QuestionOption]
  ) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleInputChange('options', newOptions);
  };

  const handleImagesAdd = (field: 'question_images' | 'explanation_images' | 'remarks_images', newImages: ImageAttachment[]) => {
    const currentImages = formData[field] || [];
    const updatedImages = [...currentImages, ...newImages];
    handleInputChange(field, updatedImages);
  };

  const handleOptionImagesAdd = (optionIndex: number, newImages: ImageAttachment[]) => {
    const currentOptions = question.options || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      images: [...(updatedOptions[optionIndex].images || []), ...newImages]
    };
    handleInputChange('options', updatedOptions);
  };

  const addOption = () => {
    const newOptions = [...(formData.options || []), {
      text: '',
      is_correct: false,
      images: [],
      order: (formData.options || []).length
    }];
    handleInputChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (formData.options || []).filter((_: QuestionOption, i: number) => i !== index);
    handleInputChange('options', newOptions);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.question_text?.trim()) {
        throw new Error('Question text is required');
      }

      if (!formData.options || formData.options.length < 2) {
        throw new Error('At least 2 options are required');
      }

      // Check if at least one option is correct
      const hasCorrectOption = formData.options.some((option: QuestionOption) => option.is_correct);
      if (!hasCorrectOption) {
        throw new Error('At least one option must be marked as correct');
      }

      await updateQuestion(question.id, formData);

      // Update the question with the form data
      const updatedQuestion: QuestionResponse = {
        ...question,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      onSave(updatedQuestion);
      setSuccess(true);
      setError(null);
      // Hide success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update question");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setError(null);
    setSuccess(false);
    onCancel();
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      await deleteQuestion(question.id);
      onDelete(question.id);
    } catch (error: unknown) {
      console.error("Error deleting question:", error);
      setError(error instanceof Error ? error.message : 'Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
        <DebugInfo />
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl font-semibold text-gray-900">{question.title}</CardTitle>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-medium ${question.difficulty_level === 'easy'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : question.difficulty_level === 'medium'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                >
                  {question.difficulty_level.toUpperCase()}
                </Badge>
              </div>
              {question.topic && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Topic:</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                    {question.topic}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this question? This action cannot be undone.
                      <br />
                      <strong>Question:</strong> {question.title}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Question'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            {/* Question Text Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Question
                  </h3>
                  <p className="text-gray-900 leading-relaxed text-base">
                    {question.question_text}
                  </p>
                </div>
                <AddImageButton
                  onImagesAdd={(images) => handleImagesAdd('question_images', images)}
                  maxImages={3}
                  currentImageCount={question.question_images?.length || 0}
                  className="shrink-0"
                />
              </div>
              {(question.question_images && question.question_images.length > 0) && (
                <div className="mt-4">
                  <ImageDisplay
                    images={question.question_images}
                    maxDisplay={3}
                    editable={false}
                    onRemove={undefined}
                  />
                </div>
              )}
            </div>

            {/* Options Section */}
            {question.options && question.options.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Answer Options
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-xl transition-all duration-200 ${option.is_correct
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${option.is_correct
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                          }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-gray-900 flex-1 leading-relaxed ${option.is_correct ? 'font-medium' : ''
                              }`}>
                              {option.text}
                            </p>
                            <div className="flex items-center gap-2">
                              <AddImageButton
                                onImagesAdd={(images) => handleOptionImagesAdd(index, images)}
                                maxImages={2}
                                currentImageCount={option.images?.length || 0}
                                className="shrink-0"
                              />
                              {option.is_correct && (
                                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Correct</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {option.images && option.images.length > 0 && (
                            <div className="mt-3">
                              <ImageDisplay
                                images={option.images}
                                maxDisplay={2}
                                editable={false}
                                onRemove={undefined}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation Section */}
            {question.explanation && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Explanation
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-gray-900 leading-relaxed flex-1">{question.explanation}</p>
                    <AddImageButton
                      onImagesAdd={(images) => handleImagesAdd('explanation_images', images)}
                      maxImages={3}
                      currentImageCount={question.explanation_images?.length || 0}
                      className="shrink-0"
                    />
                  </div>
                  {question.explanation_images && question.explanation_images.length > 0 && (
                    <div className="mt-4">
                      <ImageDisplay
                        images={question.explanation_images}
                        maxDisplay={3}
                        editable={false}
                        onRemove={undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remarks Section */}
            {question.remarks && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Additional Remarks
                </h3>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-gray-900 leading-relaxed flex-1">{question.remarks}</p>
                    <AddImageButton
                      onImagesAdd={(images) => handleImagesAdd('remarks_images', images)}
                      maxImages={3}
                      currentImageCount={question.remarks_images?.length || 0}
                      className="shrink-0"
                    />
                  </div>
                  {question.remarks_images && question.remarks_images.length > 0 && (
                    <div className="mt-4">
                      <ImageDisplay
                        images={question.remarks_images}
                        maxDisplay={3}
                        editable={false}
                        onRemove={undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags and Metadata Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                Question Details
              </h3>
              <div className="space-y-4">
                {question.tags && question.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Tags:</Label>
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Subject:</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                        {question.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Type:</span>
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                        {question.question_type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Created:</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(question.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Updated:</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(question.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-blue-900">Editing Question</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Question updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Question title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty_level || ''}
                onValueChange={(value) => handleInputChange('difficulty_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question_text">Question Text</Label>
            <Textarea
              id="question_text"
              value={formData.question_text || ''}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              placeholder="Enter the question text"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Options</Label>
            {(formData.options || []).map((option, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="font-medium w-6">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={option.is_correct}
                      onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Correct</span>
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeOption(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={loading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              value={formData.explanation || ''}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Enter explanation (optional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ''}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Enter remarks (optional)"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic || ''}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="Topic"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionEditor;


