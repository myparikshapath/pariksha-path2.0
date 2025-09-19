import React from 'react';
import { motion } from 'framer-motion';
import { Question, ImageAttachment } from '@/src/services/courseService';

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
  className?: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions,
  isMarkedForReview,
  onToggleMarkForReview,
  className = '',
}) => {
  const renderQuestionMedia = (media: ImageAttachment[], type: string) => {
    if (!media || media.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {media.map((item, idx) => (
          <div key={`${type}-${idx}`} className="relative">
            <img
              src={item.url}
              alt={item.alt_text || `${type} image ${idx + 1}`}
              className="max-w-full h-auto rounded-lg border border-gray-200"
              loading="lazy"
            />
            {item.caption && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                {item.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Question header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Question {questionNumber} of {totalQuestions}
          </h3>
          <p className="text-sm text-gray-500">
            {question.difficulty_level && `${question.difficulty_level} • `}
            {question.topic && `${question.topic} • `}
            {question.exam_year && `Year: ${question.exam_year}`}
          </p>
        </div>
        
        {/* Mark for review button */}
        <button
          onClick={onToggleMarkForReview}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border ${
            isMarkedForReview
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          } transition-colors`}
        >
          <svg
            className={`w-4 h-4 ${isMarkedForReview ? 'fill-yellow-500' : 'fill-gray-400'}`}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{isMarkedForReview ? 'Marked' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Question text */}
      <div className="prose max-w-none mb-6">
        <p className="text-lg font-medium">
          {question.question_text}
        </p>
        {renderQuestionMedia(question.question_images || [], 'question')}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D...
          const isSelected = selectedAnswer === option.text;
          
          return (
            <motion.div
              key={option.order}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswerSelect(option.text)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {optionLetter}. {option.text}
                  </div>
                  {renderQuestionMedia(option.images || [], `option-${optionLetter}`)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Explanation (to be shown after submission) */}
      {question.explanation && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
          <p className="text-blue-700">{question.explanation}</p>
          {renderQuestionMedia(question.explanation_images || [], 'explanation')}
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
