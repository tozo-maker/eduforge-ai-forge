
import { Json } from '@/integrations/supabase/types';
import { ProjectConfig, EducationalStandard } from '@/types/project';

// Type representing how projects are stored in Supabase
export interface DbProject {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  type: string;
  subject?: string;
  grade_level?: string;
  standards?: string[];
  learning_objectives?: string[];
  pedagogical_approach?: string;
  cultural_context?: string;
  accessibility?: string[];
  assessment_type?: string;
  duration?: string;
  created_at?: string;
  updated_at?: string;
  content?: Json;
  is_template?: boolean;
}

// Convert from database format to application format
export function dbProjectToAppProject(dbProject: DbProject): ProjectConfig {
  return {
    id: dbProject.id,
    name: dbProject.title,
    description: dbProject.description || undefined,
    type: dbProject.type as any, // Type assertion as we trust the DB values match our enum
    subject: dbProject.subject as any,
    gradeLevel: dbProject.grade_level as any,
    standards: dbProject.standards ? 
      dbProject.standards.map(std => ({ id: std, description: std })) : 
      [],
    learningObjectives: dbProject.learning_objectives || [],
    pedagogicalApproach: dbProject.pedagogical_approach as any,
    culturalContext: dbProject.cultural_context as any,
    accessibility: dbProject.accessibility as any[] || [],
    assessmentType: dbProject.assessment_type as any,
    duration: dbProject.duration as any,
    createdAt: dbProject.created_at ? new Date(dbProject.created_at) : undefined,
    updatedAt: dbProject.updated_at ? new Date(dbProject.updated_at) : undefined
  };
}

// Convert from application format to database format
export function appProjectToDbProject(appProject: Partial<ProjectConfig>): Partial<DbProject> {
  return {
    id: appProject.id,
    title: appProject.name,
    description: appProject.description,
    type: appProject.type,
    subject: appProject.subject,
    grade_level: appProject.gradeLevel,
    standards: appProject.standards?.map(std => std.id),
    learning_objectives: appProject.learningObjectives,
    pedagogical_approach: appProject.pedagogicalApproach,
    cultural_context: appProject.culturalContext,
    accessibility: appProject.accessibility,
    assessment_type: appProject.assessmentType,
    duration: appProject.duration
  };
}
