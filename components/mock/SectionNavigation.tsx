import React from 'react';
import { motion } from 'framer-motion';

interface Section {
  name: string;
  order: number;
  question_count: number;
}

interface SectionNavigationProps {
  sections: Section[];
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
  answeredCounts: { [key: string]: number };
  className?: string;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  currentSectionIndex,
  onSectionChange,
  answeredCounts,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto pb-2 ${className}`}>
      <div className="flex space-x-1 min-w-max">
        {sections.map((section, index) => {
          const isActive = index === currentSectionIndex;
          const answeredCount = answeredCounts[section.name] || 0;
          const progressPercentage = section.question_count > 0 
            ? Math.min(100, Math.round((answeredCount / section.question_count) * 100)) 
            : 0;
          
          return (
            <button
              key={section.name}
              onClick={() => onSectionChange(index)}
              className={`relative px-4 py-2 rounded-t-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-white text-blue-700 border-t-2 border-l-2 border-r-2 border-gray-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-2">
                <span>{section.name}</span>
                <span className="text-xs text-gray-500">
                  ({answeredCount}/{section.question_count})
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
                <motion.div
                  className={`h-full ${
                    progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionNavigation;
