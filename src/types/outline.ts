
import { EducationalStandard, ProjectConfig } from './project';

export type OutlineNodeType = 
  | 'section'
  | 'subsection'
  | 'topic'
  | 'activity'
  | 'assessment'
  | 'resource';

export type TaxonomyLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export type DifficultyLevel = 
  | 'introductory'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type StructureType = 
  | 'sequential'
  | 'hierarchical'
  | 'modular'
  | 'spiral';

export interface Prerequisite {
  id: string;
  title: string;
  description?: string;
}

export interface Relationship {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'prerequisite' | 'supports' | 'extends' | 'references';
  description?: string;
}

export interface AssessmentPoint {
  id: string;
  description: string;
  taxonomyLevel: TaxonomyLevel;
  standardIds: string[];
  type: 'formative' | 'summative' | 'diagnostic';
}

export interface OutlineNote {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

export interface OutlineNode {
  id: string;
  title: string;
  description?: string;
  type: OutlineNodeType;
  estimatedWordCount: number;
  estimatedDuration: number; // in minutes
  children: OutlineNode[];
  collapsed?: boolean;
  taxonomyLevel?: TaxonomyLevel;
  difficultyLevel?: DifficultyLevel;
  standardIds: string[];
  prerequisites?: Prerequisite[];
  assessmentPoints?: AssessmentPoint[];
  notes?: OutlineNote[];
  relationships?: Relationship[];
}

export interface Outline {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  rootNodes: OutlineNode[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
  parentVersionId?: string;
  structureType?: StructureType;
}

export type AIModelType = 
  | 'claude-instant'
  | 'claude-2'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku';

export interface OutlineGenerationParams {
  projectConfig: ProjectConfig;
  detailLevel: 'high-level' | 'medium' | 'detailed';
  model: AIModelType;
  includeAssessments: boolean;
  includeActivities: boolean;
  focusAreas?: string[];
  referenceUrls?: string[];
  structureType?: StructureType;
}

export interface OutlineVersion {
  id: string;
  outlineId: string;
  version: number;
  data: Outline;
  createdAt: Date;
  message?: string;
}

export interface ComparisonResult {
  added: number;
  removed: number;
  modified: number;
  details?: {
    addedNodes: OutlineNode[];
    removedNodes: OutlineNode[];
    modifiedNodes: {
      before: OutlineNode;
      after: OutlineNode;
    }[];
  }
}
