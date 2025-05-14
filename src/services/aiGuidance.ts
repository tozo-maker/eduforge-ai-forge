
import { ProjectTemplate, ProjectType, Subject, GradeLevel } from '@/types/project';
import projectTemplates from '@/data/projectTemplates';

interface UserGoal {
  description: string;
  targetAudience?: string;
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  purpose?: string;
}

interface AiRecommendation {
  recommendedTemplates: ProjectTemplate[];
  recommendedSubjects: Subject[];
  recommendedGradeLevels: GradeLevel[];
  explanation: string;
  bestPractices: string[];
}

// This is a simplified AI recommendation engine that would be replaced 
// with a real AI integration (Claude) in production
export const analyzeUserGoals = (userGoal: UserGoal): AiRecommendation => {
  const lowerGoal = userGoal.description.toLowerCase();
  
  // Simple keyword matching to simulate AI
  const isLesson = lowerGoal.includes('lesson') || lowerGoal.includes('teach') || lowerGoal.includes('class');
  const isCourse = lowerGoal.includes('course') || lowerGoal.includes('module') || lowerGoal.includes('unit');
  const isAssessment = lowerGoal.includes('assess') || lowerGoal.includes('test') || lowerGoal.includes('quiz');
  const isStudyGuide = lowerGoal.includes('study') || lowerGoal.includes('guide') || lowerGoal.includes('review');
  
  // Subject matching
  const isMath = lowerGoal.includes('math') || lowerGoal.includes('algebra') || lowerGoal.includes('geometry');
  const isScience = lowerGoal.includes('science') || lowerGoal.includes('biology') || lowerGoal.includes('physics');
  const isLanguage = lowerGoal.includes('language') || lowerGoal.includes('writing') || lowerGoal.includes('reading');
  const isSocial = lowerGoal.includes('history') || lowerGoal.includes('social') || lowerGoal.includes('geography');
  
  // Grade level matching
  const isElementary = lowerGoal.includes('elementary') || lowerGoal.includes('primary') || 
                      userGoal.targetAudience?.toLowerCase().includes('young');
  const isMiddle = lowerGoal.includes('middle') || lowerGoal.includes('junior');
  const isHigh = lowerGoal.includes('high school') || lowerGoal.includes('secondary');
  const isHigherEd = lowerGoal.includes('college') || lowerGoal.includes('university');
  
  // Determine recommended project types
  const recommendedTypes: ProjectType[] = [];
  if (isLesson) recommendedTypes.push('lesson_plan');
  if (isCourse) recommendedTypes.push('course_module');
  if (isAssessment) recommendedTypes.push('assessment');
  if (isStudyGuide) recommendedTypes.push('study_guide');
  // Default if no matches
  if (recommendedTypes.length === 0) recommendedTypes.push('lesson_plan');
  
  // Determine recommended subjects
  const recommendedSubjects: Subject[] = [];
  if (isMath) recommendedSubjects.push('mathematics');
  if (isScience) recommendedSubjects.push('science');
  if (isLanguage) recommendedSubjects.push('language_arts');
  if (isSocial) recommendedSubjects.push('social_studies');
  // Default if no matches
  if (recommendedSubjects.length === 0) recommendedSubjects.push('mathematics');
  
  // Determine recommended grade levels
  const recommendedGradeLevels: GradeLevel[] = [];
  if (isElementary) {
    recommendedGradeLevels.push('3rd', '4th', '5th');
  } else if (isMiddle) {
    recommendedGradeLevels.push('6th', '7th', '8th');
  } else if (isHigh) {
    recommendedGradeLevels.push('9th', '10th', '11th', '12th');
  } else if (isHigherEd) {
    recommendedGradeLevels.push('higher_education');
  } else {
    recommendedGradeLevels.push('6th', '7th'); // Default
  }
  
  // Find matching templates
  const recommendedTemplates = projectTemplates.filter(template => 
    recommendedTypes.includes(template.type)
  );
  
  // Generate explanation
  let explanation = `Based on your goal "${userGoal.description}", I recommend ${recommendedTypes.map(t => t.replace('_', ' ')).join(' or ')} 
                    focused on ${recommendedSubjects.map(s => s.replace('_', ' ')).join(' or ')}
                    for ${recommendedGradeLevels.join(', ')} grade level(s).`;
  
  // Generate best practices
  const bestPractices = [
    "Include clear learning objectives at the start.",
    "Build in opportunities for active student engagement.",
    "Provide formative assessment throughout the learning experience.",
    "Include differentiated activities for various learning styles.",
    "Add accessibility features appropriate for your target audience."
  ];
  
  return {
    recommendedTemplates,
    recommendedSubjects,
    recommendedGradeLevels,
    explanation,
    bestPractices
  };
};
