
import { Outline, OutlineNode } from '@/types/outline';
import { EducationalStandard } from '@/types/project';

/**
 * Validates outline structure for coherence and consistency
 * @param outline The outline to validate
 * @returns Array of validation issues (empty if no issues)
 */
export const validateOutlineCoherence = (outline: Outline): string[] => {
  const issues: string[] = [];
  
  // Check if outline has root nodes
  if (!outline.rootNodes || outline.rootNodes.length === 0) {
    issues.push("Outline has no content. Add at least one section.");
    return issues;
  }
  
  // Track all node IDs to check for duplicates
  const nodeIds = new Set<string>();
  
  // Validate hierarchy (sections must be root nodes, subsections must be children of sections, etc.)
  const validateNodeHierarchy = (node: OutlineNode, depth: number, parentType?: string): void => {
    // Check for duplicate IDs
    if (nodeIds.has(node.id)) {
      issues.push(`Duplicate node ID found: ${node.id}. This may cause unexpected behavior.`);
    } else {
      nodeIds.add(node.id);
    }
    
    // Validate title
    if (!node.title || node.title.trim() === '') {
      issues.push(`Node ${node.id} has no title.`);
    }
    
    // Validate estimated word count
    if (!node.estimatedWordCount || node.estimatedWordCount <= 0) {
      issues.push(`"${node.title}" has invalid word count (must be greater than 0).`);
    }
    
    // Validate estimated duration
    if (!node.estimatedDuration || node.estimatedDuration <= 0) {
      issues.push(`"${node.title}" has invalid duration (must be greater than 0).`);
    }
    
    // Validate hierarchy based on node type
    switch (node.type) {
      case 'section':
        if (depth > 0) {
          issues.push(`"${node.title}" is a section but not at root level. Sections should be top-level nodes.`);
        }
        break;
        
      case 'subsection':
        if (depth === 0) {
          issues.push(`"${node.title}" is a subsection at root level. Subsections should be inside sections.`);
        } else if (parentType !== 'section') {
          issues.push(`"${node.title}" is a subsection but not inside a section.`);
        }
        break;
        
      case 'topic':
        if (depth === 0) {
          issues.push(`"${node.title}" is a topic at root level. Topics should be inside sections or subsections.`);
        }
        break;
        
      case 'activity':
        if (depth === 0) {
          issues.push(`"${node.title}" is an activity at root level. Activities should be nested inside topics or subsections.`);
        }
        break;
        
      case 'assessment':
        if (depth === 0) {
          issues.push(`"${node.title}" is an assessment at root level. Assessments should be nested inside topics or subsections.`);
        }
        break;
        
      default:
        break;
    }
    
    // Validate taxonomy level progression
    if (node.taxonomyLevel && parentType && node.taxonomyLevel === 'remember' && 
        depth > 1 && node.children.length > 0) {
      issues.push(`"${node.title}" has basic taxonomy level 'remember' but has nested content. Consider raising the taxonomy level.`);
    }
    
    // Check children recursively
    for (const child of node.children) {
      validateNodeHierarchy(child, depth + 1, node.type);
    }
  };
  
  // Check for empty root nodes
  if (outline.rootNodes.some(node => !node.title || node.title.trim() === '')) {
    issues.push("One or more root sections have no title.");
  }
  
  // Validate each root node and its children
  outline.rootNodes.forEach(node => validateNodeHierarchy(node, 0));
  
  // Check for overall structure balance
  if (outline.rootNodes.length > 0) {
    const wordCounts = outline.rootNodes.map(node => node.estimatedWordCount);
    const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    const imbalancedSections = wordCounts.filter(count => 
      count < avgWordCount * 0.5 || count > avgWordCount * 1.5
    );
    
    if (imbalancedSections.length > 0 && outline.rootNodes.length > 1) {
      issues.push(`Content distribution is uneven. Some sections are significantly ${
        imbalancedSections[0] < avgWordCount * 0.5 ? 'smaller' : 'larger'
      } than others.`);
    }
  }
  
  return issues;
};

/**
 * Analyzes gaps in standards coverage across an outline
 * @param outline The outline to analyze
 * @param standards List of all standards that should be covered
 * @returns Object containing uncovered standards and recommendations
 */
export const analyzeStandardsGaps = (
  outline: Outline, 
  standards: EducationalStandard[]
): { 
  uncoveredStandards: EducationalStandard[]; 
  recommendations: string[];
  coveragePercentage: number;
} => {
  // Track which standards are covered
  const coveredStandardIds = new Set<string>();
  
  // Find all standards covered in the outline
  const findCoveredStandards = (node: OutlineNode) => {
    if (node.standardIds) {
      node.standardIds.forEach(id => coveredStandardIds.add(id));
    }
    node.children.forEach(findCoveredStandards);
  };
  
  outline.rootNodes.forEach(findCoveredStandards);
  
  // Find uncovered standards
  const uncoveredStandards = standards.filter(std => !coveredStandardIds.has(std.id));
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (uncoveredStandards.length > 0) {
    recommendations.push(`${uncoveredStandards.length} standards are not covered in this outline.`);
    
    // Group uncovered standards by category for better organization
    const categoryGroups: Record<string, EducationalStandard[]> = {};
    
    uncoveredStandards.forEach(std => {
      const category = std.category || 'Uncategorized';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(std);
    });
    
    // Add recommendations for each category
    Object.entries(categoryGroups).forEach(([category, stds]) => {
      if (stds.length > 3) {
        recommendations.push(`Add content to address ${stds.length} uncovered standards in "${category}".`);
      } else {
        stds.forEach(std => {
          recommendations.push(`Add content for standard ${std.id}: "${std.description?.substring(0, 60)}..."`);
        });
      }
    });
    
    // Suggest where to add the standards
    if (outline.rootNodes.length > 0) {
      // Find nodes that could accommodate new standards
      const potentialNodes = findPotentialNodesForStandards(outline.rootNodes);
      if (potentialNodes.length > 0) {
        recommendations.push(`Consider adding standards to "${potentialNodes[0].title}" which has related content.`);
      }
    }
  } else {
    recommendations.push("All standards are covered in the outline.");
  }
  
  // Calculate coverage percentage
  const coveragePercentage = standards.length > 0 
    ? ((standards.length - uncoveredStandards.length) / standards.length) * 100 
    : 100;
  
  return {
    uncoveredStandards,
    recommendations,
    coveragePercentage: Math.round(coveragePercentage)
  };
};

/**
 * Find nodes that might be good candidates for adding new standards
 * This is a heuristic function that looks for nodes with fewer standards
 * and appropriate taxonomy levels
 */
const findPotentialNodesForStandards = (nodes: OutlineNode[]): OutlineNode[] => {
  const candidates: OutlineNode[] = [];
  
  const examineNode = (node: OutlineNode) => {
    // Topics and subsections with few or no standards are good candidates
    if ((node.type === 'topic' || node.type === 'subsection') && 
        (!node.standardIds || node.standardIds.length < 2)) {
      candidates.push(node);
    }
    
    // Recursively check children
    node.children.forEach(examineNode);
  };
  
  nodes.forEach(examineNode);
  
  // Sort candidates by preference (fewer existing standards first)
  return candidates.sort((a, b) => 
    (a.standardIds?.length || 0) - (b.standardIds?.length || 0)
  );
};

/**
 * Analyze word count distribution for balance
 * @param outline The outline to analyze
 * @returns Object with analysis results and recommendations
 */
export const analyzeWordCountDistribution = (outline: Outline): {
  isBalanced: boolean;
  distribution: {
    nodeId: string;
    title: string;
    wordCount: number;
    percentage: number;
  }[];
  recommendations: string[];
} => {
  const totalWords = calculateTotalWordCount(outline.rootNodes);
  if (totalWords === 0) return { isBalanced: true, distribution: [], recommendations: [] };
  
  // Get top-level distribution
  const distribution = outline.rootNodes.map(node => {
    const wordCount = node.estimatedWordCount;
    return {
      nodeId: node.id,
      title: node.title,
      wordCount,
      percentage: Math.round((wordCount / totalWords) * 100)
    };
  });
  
  // Check balance (no section should be more than 3x larger than the smallest)
  const minPercentage = Math.min(...distribution.map(d => d.percentage));
  const maxPercentage = Math.max(...distribution.map(d => d.percentage));
  const isBalanced = distribution.length <= 1 || maxPercentage <= minPercentage * 3;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (!isBalanced) {
    const largestNode = distribution.find(d => d.percentage === maxPercentage);
    const smallestNode = distribution.find(d => d.percentage === minPercentage);
    
    if (largestNode && smallestNode) {
      recommendations.push(
        `"${largestNode.title}" takes up ${largestNode.percentage}% of content while "${
          smallestNode.title}" only takes up ${smallestNode.percentage}%. Consider redistributing content.`
      );
    }
    
    // Find nodes taking up too much space
    distribution.forEach(d => {
      if (d.percentage > 40 && distribution.length > 2) {
        recommendations.push(`"${d.title}" takes up ${d.percentage}% of content. Consider splitting into multiple sections.`);
      }
    });
  } else if (distribution.length > 1) {
    recommendations.push("Content distribution is relatively balanced.");
  }
  
  return {
    isBalanced,
    distribution,
    recommendations
  };
};

/**
 * Calculate total word count for a collection of nodes
 */
const calculateTotalWordCount = (nodes: OutlineNode[]): number => {
  return nodes.reduce((sum, node) => {
    return sum + node.estimatedWordCount + calculateTotalWordCount(node.children);
  }, 0);
};
