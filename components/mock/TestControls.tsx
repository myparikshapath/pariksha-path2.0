import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Flag } from 'lucide-react';

interface TestControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
  className?: string;
}

const TestControls: React.FC<TestControlsProps> = ({
  onPrevious,
  onNext,
  onSubmit,
  isFirstQuestion,
  isLastQuestion,
  isMarkedForReview,
  onToggleMarkForReview,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t mt-8 ${className}`}>
      <div className="flex-1">
        <Button
          onClick={onToggleMarkForReview}
          variant={isMarkedForReview ? 'secondary' : 'outline'}
          size="lg"
          className="gap-2"
        >
          <Flag className={`h-4 w-4 ${isMarkedForReview ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          {isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
        </Button>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
          disabled={isFirstQuestion}
          className="gap-1 flex-1 sm:flex-initial"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        
        {isLastQuestion ? (
          <Button
            onClick={onSubmit}
            size="lg"
            className="bg-green-600 hover:bg-green-700 gap-1 flex-1 sm:flex-initial"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Submit Test</span>
          </Button>
        ) : (
          <Button
            onClick={onNext}
            size="lg"
            className="gap-1 flex-1 sm:flex-initial"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TestControls;
