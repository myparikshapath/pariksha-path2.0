export interface Exam {
  id: string;
  title: string;
  code: string;
  category: string;
  sub_category: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamCategory {
  MEDICAL: 'medical';
  ENGINEERING: 'engineering';
  TEACHING: 'teaching';
  GOVT_EXAMS: 'govt_exams';
  BANKING: 'banking';
  DEFENCE: 'defence';
  STATE_EXAMS: 'state_exams';
}
