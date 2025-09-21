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
  AlertCircle,
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuestionResponse, QuestionUpdateRequest, updateQuestion, deleteQuestion, QuestionOption } from '@/src/services/courseService';

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
        remarks: question.remarks || '',
        subject: question.subject,
        topic: question.topic,
        tags: question.tags || [],
        is_active: question.is_active
      });
    }
  }, [isEditing, question]);

  const handleInputChange = (field: keyof QuestionUpdateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleInputChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(formData.options || []), { text: '', is_correct: false, order: (formData.options || []).length }];
    handleInputChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (formData.options || []).filter((_, i) => i !== index);
    handleInputChange('options', newOptions);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateQuestion(question.id, formData);
      setSuccess(true);

      // Create updated question object from form data
      const updatedQuestion: QuestionResponse = {
        ...question,
        ...formData,
        options: formData.options || question.options,
        tags: formData.tags || question.tags,
      };

      onSave(updatedQuestion);

      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteQuestion(question.id);
      onDelete(question.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !(formData.tags || []).includes(tag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tag.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', (formData.tags || []).filter(tag => tag !== tagToRemove));
  };

  if (!isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{question.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{question.question_type}</Badge>
                <Badge variant="outline">{question.difficulty_level}</Badge>
                <Badge variant="outline">{question.subject}</Badge>
              </div>
            </div>
            <div>

              <Button onClick={onEdit} size="sm" variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Trash2 className="text-red-600 h-4 w-4 mr-2" />
                    <span className="text-red-600">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the question.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(question.id)} 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Question</Label>
              <p className="mt-1 text-sm text-gray-700">{question.question_text}</p>
            </div>

            {question.options && question.options.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Options</Label>
                <div className="mt-2 space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={`flex-1 ${option.is_correct ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                        {option.text}
                      </span>
                      {option.is_correct && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.explanation && (
              <div>
                <Label className="text-sm font-medium">Explanation</Label>
                <p className="mt-1 text-sm text-gray-700">{question.explanation}</p>
              </div>
            )}

            {question.remarks && (
              <div>
                <Label className="text-sm font-medium">Remarks</Label>
                <p className="mt-1 text-sm text-gray-700">{question.remarks}</p>
              </div>
            )}

            {question.tags && question.tags.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card >
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Edit Question</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Question updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Question title"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Subject"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="question_text">Question Text</Label>
            <Textarea
              id="question_text"
              value={formData.question_text || ''}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              placeholder="Enter the question text"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="question_type">Question Type</Label>
              <Select
                value={formData.question_type || 'mcq'}
                onValueChange={(value) => handleInputChange('question_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="numerical">Numerical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty_level">Difficulty</Label>
              <Select
                value={formData.difficulty_level || 'medium'}
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

            <div>
              <Label htmlFor="exam_year">Exam Year</Label>
              <Input
                id="exam_year"
                type="number"
                value={formData.exam_year || ''}
                onChange={(e) => handleInputChange('exam_year', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Year"
              />
            </div>
          </div>

          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {(formData.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant={option.is_correct ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleOptionChange(index, 'is_correct', !option.is_correct)}
                  >
                    {option.is_correct ? 'Correct' : 'Mark Correct'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              value={formData.explanation || ''}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Enter explanation"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ''}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Enter remarks"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={formData.topic || ''}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="Topic"
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {(formData.tags || []).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add tag"]') as HTMLInputElement;
                    if (input) {
                      handleTagAdd(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the question.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionEditor;