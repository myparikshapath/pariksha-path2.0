import React from "react";
import { Question } from "@/src/services/courseService";

interface PaletteSection {
  name: string;
  questions: Question[];
  markedForReview?: Set<string>;
  loading?: boolean;
}

interface QuestionPaletteProps {
  sections: PaletteSection[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string | null>;
  onSelectQuestion: (sectionIndex: number, questionIndex: number) => void;
  className?: string;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  selectedAnswers,
  onSelectQuestion,
  className = "",
}) => {
  const statusClasses: Record<
    "default" | "current" | "answered" | "review" | "unavailable",
    string
  > = {
    default:
      "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50",
    current: "border-blue-600 bg-blue-50 text-blue-700 shadow-sm",
    answered: "border-green-500 bg-green-50 text-green-700",
    review: "border-yellow-500 bg-yellow-50 text-yellow-700",
    unavailable: "border-gray-200 text-gray-400 cursor-not-allowed",
  };

  const getStatus = (
    section: PaletteSection,
    questionId: string | undefined,
    sectionIndex: number,
    questionIndex: number
  ): "default" | "current" | "answered" | "review" | "unavailable" => {
    if (!questionId) {
      return "unavailable";
    }

    if (
      sectionIndex === currentSectionIndex &&
      questionIndex === currentQuestionIndex
    ) {
      return "current";
    }

    if (section.markedForReview?.has(questionId)) {
      return "review";
    }

    if (
      selectedAnswers[questionId] !== undefined &&
      selectedAnswers[questionId] !== null
    ) {
      return "answered";
    }

    return "default";
  };

  const legendItems: Array<{
    label: string;
    className: string;
  }> = [
    { label: "Current", className: statusClasses.current },
    { label: "Answered", className: statusClasses.answered },
    { label: "Marked", className: statusClasses.review },
    { label: "Not answered", className: statusClasses.default },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Legend:</span>
          {legendItems.map((item) => (
            <span
              key={item.label}
              className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 ${item.className}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              {item.label}
            </span>
          ))}
        </div>

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const questions = section.questions || [];
            const isCurrentSection = sectionIndex === currentSectionIndex;

            if (questions.length === 0) {
              return null;
            }

            return (
              <div key={section.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {section.name}
                    {isCurrentSection && (
                      <span className="ml-2 text-xs font-normal text-blue-600">
                        (Current section)
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {questions.length} question{questions.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {questions.map((question, questionIndex) => {
                    const status = getStatus(
                      section,
                      question?.id,
                      sectionIndex,
                      questionIndex
                    );
                    const isDisabled = status === "unavailable";

                    return (
                      <button
                        key={question?.id ?? `${section.name}-${questionIndex}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onSelectQuestion(sectionIndex, questionIndex)}
                        className={`h-10 rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          statusClasses[status]
                        } ${isDisabled ? "opacity-60" : ""}`}
                        aria-pressed={
                          sectionIndex === currentSectionIndex &&
                          questionIndex === currentQuestionIndex
                        }
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
