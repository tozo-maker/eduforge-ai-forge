
import { OutlineGenerationParams, Outline, OutlineNode, TaxonomyLevel, OutlineNodeType, DifficultyLevel, StructureType, Prerequisite, AssessmentPoint } from '@/types/outline';
import { toast } from '@/hooks/use-toast';
import { ProjectConfig, EducationalStandard } from '@/types/project';

// Mock function to simulate AI-based outline generation
export const generateOutline = async (params: OutlineGenerationParams): Promise<Outline | null> => {
  try {
    // This would be replaced with actual API call to Anthropic Claude
    console.log('Generating outline with model:', params.model);
    console.log('Using structure type:', params.structureType || 'sequential');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock outline based on project configuration
    const { projectConfig, detailLevel, structureType = 'sequential' } = params;
    
    // Create outline structure based on project configuration
    const outline: Outline = {
      id: crypto.randomUUID(),
      projectId: projectConfig.id || crypto.randomUUID(),
      title: `${projectConfig.name} Outline`,
      description: `AI-generated outline for ${projectConfig.name}`,
      rootNodes: generateOutlineNodes(
        projectConfig, 
        detailLevel, 
        params.includeAssessments, 
        params.includeActivities,
        0,
        [],
        structureType
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      structureType: structureType
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
export const generateOutlineNodes = (
  config: ProjectConfig, 
  detailLevel: string,
  includeAssessments: boolean,
  includeActivities: boolean,
  depth: number = 0,
  parentStandards: string[] = [],
  structureType: 'sequential' | 'hierarchical' | 'modular' | 'spiral' = 'sequential'
): OutlineNode[] => {
  // Determine how deep to go based on detail level
  const maxDepth = detailLevel === 'detailed' ? 3 : detailLevel === 'medium' ? 2 : 1;
  if (depth > maxDepth) {
    return [];
  }
  
  // Adjust node count based on structure type and detail level
  let nodeCount = 0;
  
  switch (structureType) {
    case 'sequential':
      nodeCount = detailLevel === 'detailed' ? 5 : detailLevel === 'medium' ? 3 : 2;
      break;
    case 'hierarchical':
      // Hierarchical has more nodes at the top levels, fewer at deeper levels
      nodeCount = depth === 0 ? 
        (detailLevel === 'detailed' ? 4 : 3) : 
        (detailLevel === 'detailed' ? 3 : 2);
      break;
    case 'modular':
      // Modular has a more consistent number of nodes
      nodeCount = detailLevel === 'detailed' ? 6 : detailLevel === 'medium' ? 4 : 2;
      break;
    case 'spiral':
      // Spiral revisits topics, so it's more dependent on depth
      nodeCount = depth === 0 ? 
        (detailLevel === 'detailed' ? 4 : 3) : 
        (depth === 1 ? (detailLevel === 'detailed' ? 3 : 2) : 2);
      break;
    default:
      nodeCount = detailLevel === 'detailed' ? 5 : detailLevel === 'medium' ? 3 : 2;
  }
  
  const nodes: OutlineNode[] = [];
  
  // Distribute learning objectives across sections
  const objectives = [...(config.learningObjectives || [])];
  const standardIds = [...(parentStandards.length > 0 ? parentStandards : 
    config.standards?.map(std => typeof std === 'object' ? std.id : std) || [])];
  
  for (let i = 0; i < nodeCount; i++) {
    const objective = objectives.length > i ? objectives[i] : `Topic ${i + 1}`;
    const taxonomyLevel = getTaxonomyLevel(depth, structureType);
    const isLastLevel = depth === maxDepth;
    
    // Determine node type based on depth and structure
    let nodeType: OutlineNodeType = 'section';
    
    switch (structureType) {
      case 'sequential':
        // Sequential is straightforward progression
        if (depth === 1) nodeType = 'subsection';
        else if (depth === 2) nodeType = 'topic';
        else if (depth >= 3) nodeType = i % 2 === 0 ? 'activity' : 'assessment';
        break;
        
      case 'hierarchical':
        // Hierarchical has clear levels
        if (depth === 0) nodeType = 'section';
        else if (depth === 1) nodeType = 'subsection';
        else if (depth === 2) nodeType = 'topic';
        else nodeType = i % 2 === 0 ? 'activity' : 'assessment';
        break;
        
      case 'modular':
        // Modular has more independent units
        nodeType = depth === 0 ? 'section' : 'topic';
        if (depth >= 2) nodeType = i % 2 === 0 ? 'activity' : 'resource';
        break;
        
      case 'spiral':
        // Spiral revisits with increasing complexity
        nodeType = depth === 0 ? 'section' : 'topic';
        if (depth >= 2) nodeType = (i + depth) % 2 === 0 ? 'activity' : 'assessment';
        break;
        
      default:
        if (depth === 1) nodeType = 'subsection';
        else if (depth === 2) nodeType = 'topic';
        else if (depth >= 3) nodeType = i % 2 === 0 ? 'activity' : 'assessment';
    }
    
    // Create relationships and prerequisites based on structure
    const prerequisites: Prerequisite[] = [];
    
    if (depth > 0 && (structureType === 'sequential' || structureType === 'spiral')) {
      // Add prerequisites for sequential and spiral structures
      prerequisites.push({
        id: crypto.randomUUID(),
        title: `Prerequisite ${i + 1}`,
        description: `Required prior knowledge for ${objective}`
      });
    }
    
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
      difficultyLevel: getDifficultyLevel(depth, structureType),
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      notes: depth === 0 ? [
        {
          id: crypto.randomUUID(),
          text: `Planning note for ${objective}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          color: '#e2e8f0'
        }
      ] : undefined
    };
    
    // Add children recursively based on structure
    if (!isLastLevel) {
      switch (structureType) {
        case 'hierarchical':
          // Hierarchical has fewer children deeper down
          node.children = generateOutlineNodes(
            config, 
            detailLevel, 
            includeAssessments, 
            includeActivities,
            depth + 1,
            node.standardIds,
            structureType
          );
          break;
          
        case 'spiral':
          // Spiral revisits topics with increasing complexity
          if (depth < 1) { // Only add children at top level for spiral
            node.children = generateOutlineNodes(
              config, 
              detailLevel, 
              includeAssessments, 
              includeActivities,
              depth + 1,
              node.standardIds,
              structureType
            );
          }
          break;
          
        case 'modular':
          // Modular has self-contained units with fewer levels
          if (depth < 1) { // Limit depth for modular structure
            node.children = generateOutlineNodes(
              config, 
              detailLevel, 
              includeAssessments, 
              includeActivities,
              depth + 1,
              node.standardIds,
              structureType
            );
          }
          break;
          
        default:
          // Sequential and others
          node.children = generateOutlineNodes(
            config, 
            detailLevel, 
            includeAssessments, 
            includeActivities,
            depth + 1,
            node.standardIds,
            structureType
          );
      }
    }
    
    // Add assessment points for assessment nodes
    if ((includeAssessments && (nodeType === 'assessment' || isLastLevel)) || structureType === 'spiral') {
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

// Map depth to taxonomy level - adjusted for structure type
const getTaxonomyLevel = (depth: number, structureType?: string): TaxonomyLevel => {
  const levels: TaxonomyLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
  
  if (structureType === 'spiral') {
    // Spiral revisits with increasing complexity
    return levels[Math.min(depth + 1, levels.length - 1)];
  }
  
  if (structureType === 'hierarchical') {
    // Hierarchical has more analytical focus
    const hierarchicalLevels: TaxonomyLevel[] = ['understand', 'analyze', 'apply', 'evaluate', 'create'];
    return hierarchicalLevels[Math.min(depth, hierarchicalLevels.length - 1)];
  }
  
  return levels[Math.min(depth, levels.length - 1)];
};

// Map depth to difficulty level - adjusted for structure type
const getDifficultyLevel = (depth: number, structureType?: string): DifficultyLevel => {
  const levels = ['introductory', 'beginner', 'intermediate', 'advanced', 'expert'];
  
  if (structureType === 'spiral') {
    // Spiral has increasing difficulty
    return levels[Math.min(depth + 1, levels.length - 1)] as DifficultyLevel;
  }
  
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
