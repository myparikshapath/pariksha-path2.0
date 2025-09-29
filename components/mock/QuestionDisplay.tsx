import React from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/src/services/courseService';
import ImageDisplay from '@/components/ui/ImageDisplay';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
            a Question {questionNumber} of {totalQuestions}
          </span>
          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {question.difficulty_level}
          </span>
        </div>
        <button
          onClick={onToggleMarkForReview}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${isMarkedForReview
            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-yellow-50 hover:text-yellow-700'
            }`}
        >
          {isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {question.title}
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {question.question_text}
        </p>

        {/* Question Images */}
        <ImageDisplay
          imageUrls={question.question_image_urls || []}
          alt="Question image"
        />
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const optionNumber = index + 1; // Use 1, 2, 3, 4 instead of A, B, C, D
          const isSelected = selectedAnswer === optionNumber.toString();

          return (
            <motion.button
              key={index}
              onClick={() => onAnswerSelect(optionNumber.toString())}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start space-x-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {optionNumber}
                </span>
                <div className="flex-1">
                  <span className="text-gray-700">{option.text}</span>
                  {/* Option Images */}
                  <ImageDisplay
                    imageUrls={option.image_urls || []}
                    alt={`Option ${optionNumber} image`}
                    className="mt-2"
                    maxWidth={400}
                    maxHeight={200}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Question Metadata */}
      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
        <span>Subject: {question.subject}</span>
        <span>•</span>
        <span>Topic: {question.topic}</span>
        {question.tags && question.tags.length > 0 && (
          <>
            <span>•</span>
            <span>Tags: {question.tags.join(', ')}</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionDisplay;