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
import { QuestionResponse, QuestionUpdateRequest, updateQuestion } from '@/src/services/courseService';

interface QuestionEditorProps {
  question: QuestionResponse;
  onSave: (updatedQuestion: QuestionResponse) => void;
  onCancel: () => void;
  isEditing: boolean;
  onEdit: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onSave,
  onCancel,
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
        subject: question.subject,
        topic: question.topic,
        tags: question.tags || [],
      });
    }
  }, [isEditing, question]);

  const handleInputChange = (field: keyof QuestionUpdateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'is_correct', value: any) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleInputChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(formData.options || []), { text: '', is_correct: false }];
    handleInputChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (formData.options || []).filter((_, i) => i !== index);
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
      const hasCorrectOption = formData.options.some(option => option.is_correct);
      if (!hasCorrectOption) {
        throw new Error('At least one option must be marked as correct');
      }

      const response = await updateQuestion(question.id, formData);
      
      // Update the question with the response data
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
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
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

  if (!isEditing) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{question.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{question.difficulty_level}</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                className="flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </div>
          {question.topic && (
            <p className="text-sm text-gray-600">Topic: {question.topic}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-900 leading-relaxed">
                {question.question_text}
              </p>
            </div>

            {question.options && question.options.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Options:</Label>
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg flex items-center gap-2 ${
                      option.is_correct 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="font-medium w-6">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {option.is_correct && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {question.explanation && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Explanation:</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-900">{question.explanation}</p>
                </div>
              </div>
            )}

            {question.tags && question.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags:</Label>
                <div className="flex flex-wrap gap-1">
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

          <div className="space-y-2">
            <Label>Options</Label>
            {(formData.options || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
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
