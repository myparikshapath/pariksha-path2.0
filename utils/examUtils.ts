export interface ExamInfo {
  name: string;
  category: string;
  sub_category: string;
  state?: string;
  slug: string;
}

/**
 * Generate a URL-friendly slug from exam name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Flatten the hierarchical exam data into a flat array with slugs
 */
export function flattenExamsWithSlugs(data: any): ExamInfo[] {
  const result: ExamInfo[] = [];
  
  for (const category in data) {
    const subCats = data[category];
    for (const subCat in subCats) {
      const examsOrObj = subCats[subCat];
      
      if (Array.isArray(examsOrObj)) {
        // Direct array of exams
        examsOrObj.forEach((exam: string) =>
          result.push({ 
            name: exam, 
            category, 
            sub_category: subCat,
            slug: generateSlug(exam)
          })
        );
      } else if (typeof examsOrObj === "object") {
        // Object with states
        for (const state in examsOrObj) {
          const stateExams = examsOrObj[state];
          if (Array.isArray(stateExams)) {
            stateExams.forEach((exam: string) =>
              result.push({ 
                name: exam, 
                category, 
                sub_category: subCat, 
                state,
                slug: generateSlug(exam)
              })
            );
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Find exam by slug
 */
export function findExamBySlug(exams: ExamInfo[], slug: string): ExamInfo | undefined {
  return exams.find(exam => exam.slug === slug);
}
