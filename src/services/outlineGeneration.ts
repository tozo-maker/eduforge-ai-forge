
import { OutlineGenerationParams, Outline, OutlineNode, TaxonomyLevel, OutlineNodeType } from '@/types/outline';
import { toast } from '@/hooks/use-toast';
import { ProjectConfig, EducationalStandard } from '@/types/project';

// Mock function to simulate AI-based outline generation
export const generateOutline = async (params: OutlineGenerationParams): Promise<Outline | null> => {
  try {
    // This would be replaced with actual API call to Anthropic Claude
    console.log('Generating outline with model:', params.model);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock outline based on project configuration
    const { projectConfig, detailLevel } = params;
    
    // Create outline structure based on project configuration
    const outline: Outline = {
      id: crypto.randomUUID(),
      projectId: projectConfig.id || crypto.randomUUID(),
      title: `${projectConfig.name} Outline`,
      description: `AI-generated outline for ${projectConfig.name}`,
      rootNodes: generateOutlineNodes(projectConfig, detailLevel, params.includeAssessments, params.includeActivities),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
    
    return outline;
  } catch (error) {
    console.error('Error generating outline:', error);
    toast({
      title: 'Error',
      description: 'Failed to generate outline. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

// Recursively generate outline nodes based on project configuration
const generateOutlineNodes = (
  config: ProjectConfig, 
  detailLevel: string,
  includeAssessments: boolean,
  includeActivities: boolean,
  depth: number = 0,
  parentStandards: string[] = []
): OutlineNode[] => {
  if (depth > (detailLevel === 'detailed' ? 3 : detailLevel === 'medium' ? 2 : 1)) {
    return [];
  }
  
  const nodeCount = detailLevel === 'detailed' ? 5 : detailLevel === 'medium' ? 3 : 2;
  const nodes: OutlineNode[] = [];
  
  // Distribute learning objectives across sections
  const objectives = [...(config.learningObjectives || [])];
  const standardIds = [...(parentStandards.length > 0 ? parentStandards : 
    config.standards?.map(std => std.id) || [])];
  
  for (let i = 0; i < nodeCount; i++) {
    const objective = objectives.length > i ? objectives[i] : `Topic ${i + 1}`;
    const taxonomyLevel = getTaxonomyLevel(depth);
    const isLastLevel = depth === (detailLevel === 'detailed' ? 3 : detailLevel === 'medium' ? 2 : 1);
    
    // Determine node type based on depth
    let nodeType: OutlineNodeType = 'section';
    if (depth === 1) nodeType = 'subsection';
    else if (depth === 2) nodeType = 'topic';
    else if (depth >= 3) nodeType = i % 2 === 0 ? 'activity' : 'assessment';
    
    // Create node
    const node: OutlineNode = {
      id: crypto.randomUUID(),
      title: objective,
      description: `Description for ${objective}`,
      type: nodeType,
      estimatedWordCount: getEstimatedWordCount(nodeType, config.gradeLevel),
      estimatedDuration: getEstimatedDuration(nodeType, config.gradeLevel),
      children: [],
      standardIds: distributedStandards(standardIds, nodeCount, i),
      taxonomyLevel,
      difficultyLevel: getDifficultyLevel(depth)
    };
    
    // Add children recursively if not at max depth
    if (!isLastLevel) {
      node.children = generateOutlineNodes(
        config, 
        detailLevel, 
        includeAssessments, 
        includeActivities,
        depth + 1,
        node.standardIds
      );
    }
    
    // Add assessment points for assessment nodes
    if (includeAssessments && (nodeType === 'assessment' || isLastLevel)) {
      node.assessmentPoints = [{
        id: crypto.randomUUID(),
        description: `Assessment for ${objective}`,
        taxonomyLevel,
        standardIds: node.standardIds,
        type: 'formative'
      }];
    }
    
    nodes.push(node);
  }
  
  return nodes;
};

// Helper to distribute standards across nodes
const distributedStandards = (standards: string[], count: number, index: number): string[] => {
  if (standards.length === 0) return [];
  
  const standardsPerNode = Math.max(1, Math.ceil(standards.length / count));
  const start = index * standardsPerNode;
  const end = Math.min(start + standardsPerNode, standards.length);
  
  return standards.slice(start, end);
};

// Get estimated word count based on node type and grade level
const getEstimatedWordCount = (nodeType: OutlineNodeType, gradeLevel: string): number => {
  const baseCount = {
    section: 800,
    subsection: 500,
    topic: 300,
    activity: 200,
    assessment: 150,
    resource: 100
  };
  
  // Adjust based on grade level
  const gradeMultiplier = 
    gradeLevel === 'k' || gradeLevel === '1st' || gradeLevel === '2nd' ? 0.5 :
    gradeLevel === '3rd' || gradeLevel === '4th' || gradeLevel === '5th' ? 0.75 :
    gradeLevel === '6th' || gradeLevel === '7th' || gradeLevel === '8th' ? 1.0 :
    gradeLevel === '9th' || gradeLevel === '10th' || gradeLevel === '11th' || gradeLevel === '12th' ? 1.25 :
    1.5; // higher_education and professional
  
  return Math.round(baseCount[nodeType] * gradeMultiplier);
};

// Get estimated duration in minutes
const getEstimatedDuration = (nodeType: OutlineNodeType, gradeLevel: string): number => {
  const baseDuration = {
    section: 30,
    subsection: 20,
    topic: 15,
    activity: 10,
    assessment: 8,
    resource: 5
  };
  
  // Adjust based on grade level
  const gradeMultiplier = 
    gradeLevel === 'k' || gradeLevel === '1st' || gradeLevel === '2nd' ? 0.7 :
    gradeLevel === '3rd' || gradeLevel === '4th' || gradeLevel === '5th' ? 0.85 :
    gradeLevel === '6th' || gradeLevel === '7th' || gradeLevel === '8th' ? 1.0 :
    gradeLevel === '9th' || gradeLevel === '10th' || gradeLevel === '11th' || gradeLevel === '12th' ? 1.15 :
    1.3; // higher_education and professional
  
  return Math.round(baseDuration[nodeType] * gradeMultiplier);
};

// Map depth to taxonomy level
const getTaxonomyLevel = (depth: number): TaxonomyLevel => {
  const levels: TaxonomyLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
  return levels[Math.min(depth, levels.length - 1)];
};

// Map depth to difficulty level
const getDifficultyLevel = (depth: number): DifficultyLevel => {
  const levels = ['introductory', 'beginner', 'intermediate', 'advanced', 'expert'];
  return levels[Math.min(depth, levels.length - 1)] as DifficultyLevel;
};

// Analyze standards coverage in an outline
export const analyzeStandardsCoverage = (outline: Outline, standards: EducationalStandard[]): number => {
  const standardsMap = new Map<string, boolean>();
  standards.forEach(standard => standardsMap.set(standard.id, false));
  
  // Recursively check all nodes
  const checkNode = (node: OutlineNode) => {
    node.standardIds.forEach(id => {
      if (standardsMap.has(id)) {
        standardsMap.set(id, true);
      }
    });
    
    node.children.forEach(checkNode);
  };
  
  outline.rootNodes.forEach(checkNode);
  
  // Calculate coverage percentage
  const covered = Array.from(standardsMap.values()).filter(v => v).length;
  return (covered / standardsMap.size) * 100;
};

// Calculate total word count
export const calculateTotalWordCount = (nodes: OutlineNode[]): number => {
  return nodes.reduce((sum, node) => {
    return sum + node.estimatedWordCount + calculateTotalWordCount(node.children);
  }, 0);
};

// Calculate total duration
export const calculateTotalDuration = (nodes: OutlineNode[]): number => {
  return nodes.reduce((sum, node) => {
    return sum + node.estimatedDuration + calculateTotalDuration(node.children);
  }, 0);
};
