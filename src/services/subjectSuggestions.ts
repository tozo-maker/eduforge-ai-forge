
import { Subject, GradeLevel } from '@/types/project';

interface SubjectSuggestion {
  subject: Subject;
  relevanceScore: number; // 0-100
  rationale: string;
}

// This simulates an AI service that would be replaced with Claude integration
export const getComplementarySubjects = (
  primarySubject: Subject,
  gradeLevel: GradeLevel,
  learningObjectives: string[] = []
): SubjectSuggestion[] => {
  // Map of subject combinations that work well together based on interdisciplinary connections
  const complementarySubjectMap: Record<Subject, Subject[]> = {
    mathematics: ['science', 'computer_science', 'arts'],
    science: ['mathematics', 'language_arts', 'social_studies'],
    language_arts: ['social_studies', 'arts', 'foreign_language'],
    social_studies: ['language_arts', 'arts', 'foreign_language'],
    foreign_language: ['language_arts', 'social_studies', 'arts'],
    arts: ['language_arts', 'social_studies', 'science'],
    physical_education: ['science', 'social_studies', 'mathematics'],
    computer_science: ['mathematics', 'science', 'arts'],
    other: ['language_arts', 'mathematics', 'science'],
  };
  
  // Smart rationales for complementary subjects
  const getSubjectRationale = (subject: Subject, primarySubject: Subject): string => {
    const rationales: Record<string, Record<string, string>> = {
      mathematics: {
        science: "Quantitative skills enhance scientific inquiry and data analysis",
        computer_science: "Abstract mathematical concepts underpin computational thinking",
        arts: "Geometric patterns and proportions are fundamental to visual arts"
      },
      science: {
        mathematics: "Scientific concepts often require mathematical modeling and analysis",
        language_arts: "Science communication and reporting require strong writing skills",
        social_studies: "Scientific developments have profound historical and societal impacts"
      },
      language_arts: {
        social_studies: "Historical contexts and cultural understanding enrich literary analysis",
        arts: "Creative expression connects across written and visual mediums",
        foreign_language: "Linguistic foundations transfer between primary and secondary languages"
      }
    };
    
    // Return specific rationale if available, otherwise a generic one
    return rationales[primarySubject]?.[subject] || 
      `${subject.replace('_', ' ')} complements ${primarySubject.replace('_', ' ')} through interdisciplinary connections`;
  };
  
  // Generate relevance scores using objectives and grade level
  const getRelevanceScore = (subject: Subject, primarySubject: Subject): number => {
    // Base score from 70-90
    let score = 70 + Math.floor(Math.random() * 20);
    
    // Boost score if learning objectives mention keywords related to this subject
    const keywords: Record<Subject, string[]> = {
      mathematics: ['calculate', 'equation', 'number', 'pattern', 'quantitative'],
      science: ['experiment', 'hypothesis', 'observation', 'evidence', 'analyze'],
      language_arts: ['write', 'read', 'communicate', 'expression', 'literature'],
      social_studies: ['history', 'society', 'culture', 'civic', 'geography'],
      foreign_language: ['language', 'communication', 'culture', 'translate'],
      arts: ['creative', 'design', 'visual', 'express', 'aesthetic'],
      physical_education: ['movement', 'health', 'activity', 'coordination'],
      computer_science: ['code', 'program', 'algorithm', 'data', 'system'],
      other: []
    };
    
    // Check objectives for keywords
    if (learningObjectives.length > 0) {
      const objectivesText = learningObjectives.join(' ').toLowerCase();
      const relevantKeywords = keywords[subject] || [];
      
      relevantKeywords.forEach(keyword => {
        if (objectivesText.includes(keyword.toLowerCase())) {
          score += 5; // Boost for each relevant keyword found
        }
      });
    }
    
    // Cap at 100
    return Math.min(score, 100);
  };
  
  // Get the complementary subjects for the primary subject
  const complementarySubjects = complementarySubjectMap[primarySubject] || [];
  
  // Create suggestions with relevance scores and rationales
  return complementarySubjects
    .map(subject => ({
      subject: subject as Subject,
      relevanceScore: getRelevanceScore(subject as Subject, primarySubject),
      rationale: getSubjectRationale(subject as Subject, primarySubject)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
};
