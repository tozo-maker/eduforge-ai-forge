
export type ProjectType = 
  | "lesson_plan" 
  | "course_module" 
  | "curriculum" 
  | "assessment" 
  | "study_guide";

export type GradeLevel =
  | "k" 
  | "1st" 
  | "2nd"
  | "3rd"
  | "4th"
  | "5th"
  | "6th"
  | "7th"
  | "8th"
  | "9th"
  | "10th"
  | "11th"
  | "12th"
  | "higher_education"
  | "professional";

export type Subject =
  | "mathematics"
  | "science"
  | "language_arts"
  | "social_studies"
  | "foreign_language"
  | "arts"
  | "physical_education"
  | "computer_science"
  | "other";

export type PedagogicalApproach =
  | "direct_instruction"
  | "inquiry_based"
  | "project_based"
  | "flipped_classroom"
  | "differentiated"
  | "universal_design"
  | "socratic_method"
  | "cooperative_learning";

export type CulturalContext =
  | "general"
  | "multicultural"
  | "indigenous"
  | "culturally_responsive"
  | "global";

export type AccessibilityFeature =
  | "screen_reader_friendly"
  | "simplified_language"
  | "high_contrast"
  | "alternative_text"
  | "closed_captioning"
  | "multi_sensory";

export type AssessmentType =
  | "formative"
  | "summative"
  | "diagnostic"
  | "performance_based"
  | "peer_assessment"
  | "self_assessment";

export type Duration =
  | "15_minutes"
  | "30_minutes" 
  | "45_minutes"
  | "60_minutes"
  | "90_minutes"
  | "multi_day";

export type StructureType =
  | "sequential"
  | "hierarchical"
  | "modular"
  | "spiral";

export type TerminologyType = 
  | "simple" 
  | "standard" 
  | "academic";

export interface LanguageConfig {
  readabilityLevel: number;
  culturalContext: CulturalContext;
  terminology: TerminologyType;
  accessibilityFeatures: AccessibilityFeature[];
}

export interface EducationalStandard {
  id: string;
  description: string;
  organization?: string;
  category?: string;
}

export interface ProjectConfig {
  id?: string;
  name: string;
  description?: string;
  type: ProjectType;
  subject: Subject;
  gradeLevel: GradeLevel;
  standards: EducationalStandard[];
  learningObjectives: string[];
  pedagogicalApproach: PedagogicalApproach;
  culturalContext: CulturalContext;
  accessibility: AccessibilityFeature[];
  assessmentType: AssessmentType;
  duration: Duration;
  createdAt?: Date;
  updatedAt?: Date;
  contentStructure?: StructureType;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  icon: string;
  previewImage?: string;
  defaultConfig: Partial<ProjectConfig>;
}

export interface UserProfile {
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  interactionStyle: 'guided' | 'collaborative' | 'autonomous';
  detailLevel: number;
  adaptOverTime: boolean;
}
