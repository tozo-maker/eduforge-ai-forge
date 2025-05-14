
import { Outline, OutlineNode, TaxonomyLevel } from '@/types/outline';
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
  
  // Track taxonomy levels to ensure proper progression
  const taxonomyProgression: Record<string, TaxonomyLevel[]> = {};
  
  // Track circular references
  const parentChain: string[] = [];
  
  // Validate hierarchy (sections must be root nodes, subsections must be children of sections, etc.)
  const validateNodeHierarchy = (
    node: OutlineNode, 
    depth: number, 
    parentType?: string,
    parentTaxonomy?: TaxonomyLevel,
    parentPath: string = ''
  ): void => {
    const currentPath = parentPath ? `${parentPath} > ${node.title}` : node.title;
    
    // Check for circular references
    if (parentChain.includes(node.id)) {
      issues.push(`Circular reference detected: "${node.title}" creates a loop in the outline structure.`);
      return;
    }
    parentChain.push(node.id);
    
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
    
    // Track taxonomy levels for this branch
    if (node.taxonomyLevel) {
      if (!taxonomyProgression[currentPath]) {
        taxonomyProgression[currentPath] = [];
      }
      taxonomyProgression[currentPath].push(node.taxonomyLevel);
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
          issues.push(`"${node.title}" is a subsection but not inside a section. Current parent: ${parentType || 'none'}`);
        }
        break;
        
      case 'topic':
        if (depth === 0) {
          issues.push(`"${node.title}" is a topic at root level. Topics should be inside sections or subsections.`);
        } else if (!['section', 'subsection'].includes(parentType || '')) {
          issues.push(`"${node.title}" is a topic but not inside a section or subsection. Current parent: ${parentType || 'none'}`);
        }
        break;
        
      case 'activity':
        if (depth === 0) {
          issues.push(`"${node.title}" is an activity at root level. Activities should be nested inside topics or subsections.`);
        } else if (!['topic', 'subsection'].includes(parentType || '')) {
          issues.push(`"${node.title}" is an activity but not inside a topic or subsection. Current parent: ${parentType || 'none'}`);
        }
        break;
        
      case 'assessment':
        if (depth === 0) {
          issues.push(`"${node.title}" is an assessment at root level. Assessments should be nested inside topics or subsections.`);
        } else if (!['topic', 'subsection', 'section'].includes(parentType || '')) {
          issues.push(`"${node.title}" is an assessment but not in a valid parent node. Current parent: ${parentType || 'none'}`);
        }
        break;
        
      default:
        break;
    }
    
    // Validate taxonomy level progression
    if (node.taxonomyLevel && parentTaxonomy) {
      const taxonomyLevels: TaxonomyLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
      const currentLevel = taxonomyLevels.indexOf(node.taxonomyLevel);
      const parentLevel = taxonomyLevels.indexOf(parentTaxonomy);
      
      // Check if taxonomy level regresses significantly (more than one level down)
      if (currentLevel < parentLevel - 1 && node.children.length > 0) {
        issues.push(
          `Taxonomy regression: "${node.title}" (${node.taxonomyLevel}) is more than one level below its parent's level (${parentTaxonomy}).`
        );
      }
      
      // Check if lower taxonomy level nodes have higher-level children
      if (currentLevel < 2 && node.children.some(child => 
          child.taxonomyLevel && taxonomyLevels.indexOf(child.taxonomyLevel) > currentLevel + 2)) {
        issues.push(
          `Taxonomy inconsistency: "${node.title}" (${node.taxonomyLevel}) has children with much higher taxonomy levels.`
        );
      }
    }
    
    // Check standards coverage
    if (!node.standardIds || node.standardIds.length === 0) {
      if (['section', 'subsection', 'topic'].includes(node.type) && depth < 2) {
        issues.push(`"${node.title}" has no standards assigned. Consider adding relevant standards.`);
      }
    } else if (node.standardIds.length > 5) {
      issues.push(`"${node.title}" has too many standards (${node.standardIds.length}). Consider distributing them across child nodes.`);
    }
    
    // Check word count consistency with node type
    const isBriefDescriptive = node.estimatedWordCount < 200;
    const isDetailed = node.estimatedWordCount > 800;
    
    if (node.type === 'section' && isDetailed && node.children.length > 0) {
      issues.push(`"${node.title}" is a section with ${node.estimatedWordCount} words. Sections should be concise summaries with content in child nodes.`);
    }
    
    if (node.type === 'activity' && isBriefDescriptive) {
      issues.push(`"${node.title}" is an activity with only ${node.estimatedWordCount} words. Activities typically need detailed instructions.`);
    }
    
    // Check duration distribution
    if (node.estimatedDuration > 120 && node.children.length === 0) {
      issues.push(`"${node.title}" has a very long duration (${node.estimatedDuration} minutes) but no child nodes. Consider breaking it into smaller parts.`);
    }
    
    // Check that parent nodes with children have enough content in children
    if (node.children.length > 0) {
      const childrenWordCount = node.children.reduce((sum, child) => sum + child.estimatedWordCount, 0);
      if (childrenWordCount < node.estimatedWordCount * 0.7) {
        issues.push(`"${node.title}" has ${node.estimatedWordCount} words but its children only have ${childrenWordCount} words. Distribute content to children.`);
      }
    }
    
    // Check children recursively
    for (const child of node.children) {
      validateNodeHierarchy(
        child, 
        depth + 1, 
        node.type, 
        node.taxonomyLevel,
        currentPath
      );
    }
    
    // Remove from parent chain after processing
    parentChain.pop();
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
  
  // Validate taxonomy progression across branches
  Object.entries(taxonomyProgression).forEach(([path, levels]) => {
    if (levels.length >= 3) {
      const taxonomyRanks = {
        'remember': 1,
        'understand': 2,
        'apply': 3,
        'analyze': 4, 
        'evaluate': 5,
        'create': 6
      };
      
      // Check if progression is completely reversed
      const isReversed = levels.every((level, i) => 
        i === 0 || taxonomyRanks[level] < taxonomyRanks[levels[i-1]]
      );
      
      if (isReversed) {
        issues.push(`Reversed taxonomy progression in path: ${path}. Consider restructuring to build from lower to higher thinking skills.`);
      }
    }
  });
  
  // Validate relationships if they exist
  if (outline.relationships && outline.relationships.length > 0) {
    // Check for relationships pointing to non-existent nodes
    const allNodesMap = new Map<string, boolean>();
    
    // Build a map of all node IDs
    const collectNodeIds = (nodes: OutlineNode[]) => {
      nodes.forEach(node => {
        allNodesMap.set(node.id, true);
        if (node.children) {
          collectNodeIds(node.children);
        }
      });
    };
    
    collectNodeIds(outline.rootNodes);
    
    // Check each relationship
    outline.relationships.forEach(rel => {
      if (!allNodesMap.has(rel.fromNodeId)) {
        issues.push(`Relationship ${rel.id} references non-existent source node ${rel.fromNodeId}.`);
      }
      if (!allNodesMap.has(rel.toNodeId)) {
        issues.push(`Relationship ${rel.id} references non-existent target node ${rel.toNodeId}.`);
      }
      if (rel.fromNodeId === rel.toNodeId) {
        issues.push(`Relationship ${rel.id} connects a node to itself.`);
      }
    });
    
    // Check for duplicate relationships
    const relationshipMap = new Map<string, string>();
    outline.relationships.forEach(rel => {
      const key = `${rel.fromNodeId}-${rel.toNodeId}-${rel.type}`;
      if (relationshipMap.has(key)) {
        issues.push(`Duplicate relationship between ${rel.fromNodeId} and ${rel.toNodeId} of type ${rel.type}.`);
      } else {
        relationshipMap.set(key, rel.id);
      }
    });
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
  coverageByCategory?: Record<string, number>;
} => {
  // Track which standards are covered
  const coveredStandardIds = new Set<string>();
  const standardsById = new Map<string, EducationalStandard>();
  
  // First, create a map of all standards by ID
  standards.forEach(std => standardsById.set(std.id, std));
  
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
  
  // Track coverage by category
  const categoryStandardsCount: Record<string, { total: number, covered: number }> = {};
  standards.forEach(std => {
    const category = std.category || 'Uncategorized';
    if (!categoryStandardsCount[category]) {
      categoryStandardsCount[category] = { total: 0, covered: 0 };
    }
    categoryStandardsCount[category].total++;
    
    if (coveredStandardIds.has(std.id)) {
      categoryStandardsCount[category].covered++;
    }
  });
  
  // Calculate coverage percentage by category
  const coverageByCategory: Record<string, number> = {};
  Object.entries(categoryStandardsCount).forEach(([category, counts]) => {
    coverageByCategory[category] = Math.round((counts.covered / counts.total) * 100);
  });
  
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
    
    // Find categories with poor coverage
    Object.entries(coverageByCategory)
      .filter(([_, percentage]) => percentage < 50)
      .sort(([_, a], [__, b]) => a - b) // Sort by coverage percentage
      .forEach(([category, percentage]) => {
        recommendations.push(`Only ${percentage}% coverage of "${category}" standards. Add content to address this area.`);
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
        const topNodes = potentialNodes.slice(0, Math.min(3, potentialNodes.length));
        recommendations.push(
          `Suitable nodes for standards: ${topNodes.map(n => `"${n.title}"`).join(', ')}`
        );
      }
    }
  } else {
    recommendations.push("All standards are covered in the outline.");
    
    // Check for over-allocated nodes
    const nodeStandardCounts = new Map<string, { node: OutlineNode, count: number }>();
    
    const checkNodeStandardCount = (node: OutlineNode) => {
      if (node.standardIds && node.standardIds.length > 3) {
        nodeStandardCounts.set(node.id, { node, count: node.standardIds.length });
      }
      node.children.forEach(checkNodeStandardCount);
    };
    
    outline.rootNodes.forEach(checkNodeStandardCount);
    
    if (nodeStandardCounts.size > 0) {
      const overallocatedNodes = Array.from(nodeStandardCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
        
      if (overallocatedNodes.length > 0) {
        recommendations.push(
          `Some nodes have many standards: ${overallocatedNodes.map(item => 
            `"${item.node.title}" (${item.count})`
          ).join(', ')}. Consider redistributing.`
        );
      }
    }
    
    // Check for uneven category distribution
    const categoryPercentages = Object.entries(coverageByCategory);
    if (categoryPercentages.length > 1) {
      const min = Math.min(...categoryPercentages.map(([_, pct]) => pct));
      const max = Math.max(...categoryPercentages.map(([_, pct]) => pct));
      
      if (max - min > 30) {
        recommendations.push(
          "Standards coverage is uneven across categories. Some areas have much better coverage than others."
        );
      }
    }
  }
  
  // Calculate overall coverage percentage
  const coveragePercentage = standards.length > 0 
    ? ((standards.length - uncoveredStandards.length) / standards.length) * 100 
    : 100;
  
  return {
    uncoveredStandards,
    recommendations,
    coveragePercentage: Math.round(coveragePercentage),
    coverageByCategory
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
    childrenTotal: number;
    isLeaf: boolean;
  }[];
  recommendations: string[];
} => {
  const totalWords = calculateTotalWordCount(outline.rootNodes);
  if (totalWords === 0) return { isBalanced: true, distribution: [], recommendations: [] };
  
  // Get top-level distribution
  const distribution = outline.rootNodes.map(node => {
    const wordCount = node.estimatedWordCount;
    const childrenTotal = calculateChildrenWordCount(node);
    
    return {
      nodeId: node.id,
      title: node.title,
      wordCount,
      percentage: Math.round((wordCount / totalWords) * 100),
      childrenTotal,
      isLeaf: node.children.length === 0
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
    recommendations.push("Content distribution is relatively balanced across top-level sections.");
  }
  
  // Check leaf nodes (nodes with no children) for excessive word counts
  const leafNodes = findLeafNodes(outline.rootNodes);
  const leafWordCounts = leafNodes.map(node => node.estimatedWordCount);
  
  if (leafWordCounts.length > 0) {
    const avgLeafCount = leafWordCounts.reduce((sum, count) => sum + count, 0) / leafWordCounts.length;
    const outlierLeafs = leafNodes.filter(node => node.estimatedWordCount > avgLeafCount * 2);
    
    if (outlierLeafs.length > 0) {
      const topOutliers = outlierLeafs
        .sort((a, b) => b.estimatedWordCount - a.estimatedWordCount)
        .slice(0, 3);
      
      recommendations.push(
        `Some leaf nodes have excessive word counts: ${
          topOutliers.map(node => `"${node.title}" (${node.estimatedWordCount} words)`).join(', ')
        }. Consider breaking these into smaller components.`
      );
    }
  }
  
  // Check parent-child distribution
  const nodeWithChildrenDistribution = calculateParentChildDistribution(outline.rootNodes);
  const poorDistributionNodes = nodeWithChildrenDistribution.filter(
    item => item.selfPercentage > 50 && item.childrenCount > 1
  );
  
  if (poorDistributionNodes.length > 0) {
    const worstNode = poorDistributionNodes[0];
    recommendations.push(
      `"${worstNode.title}" has ${worstNode.selfPercentage}% of its content in itself rather than its ${
        worstNode.childrenCount} children. Consider moving content to appropriate child nodes.`
    );
  }
  
  return {
    isBalanced,
    distribution,
    recommendations
  };
};

/**
 * Calculate parent-child content distribution
 */
const calculateParentChildDistribution = (nodes: OutlineNode[]): {
  id: string;
  title: string;
  wordCount: number;
  childrenTotal: number;
  childrenCount: number;
  selfPercentage: number;
}[] => {
  const result: {
    id: string;
    title: string;
    wordCount: number;
    childrenTotal: number;
    childrenCount: number;
    selfPercentage: number;
  }[] = [];
  
  const processNode = (node: OutlineNode) => {
    if (node.children.length > 0) {
      const childrenTotal = calculateChildrenWordCount(node);
      const total = node.estimatedWordCount + childrenTotal;
      const selfPercentage = Math.round((node.estimatedWordCount / Math.max(1, total)) * 100);
      
      result.push({
        id: node.id,
        title: node.title,
        wordCount: node.estimatedWordCount,
        childrenTotal,
        childrenCount: node.children.length,
        selfPercentage
      });
      
      // Process children recursively
      node.children.forEach(processNode);
    }
  };
  
  nodes.forEach(processNode);
  
  // Sort by self percentage (highest first)
  return result.sort((a, b) => b.selfPercentage - a.selfPercentage);
};

/**
 * Find all leaf nodes (nodes with no children) in the outline
 */
const findLeafNodes = (nodes: OutlineNode[]): OutlineNode[] => {
  const leafs: OutlineNode[] = [];
  
  const traverse = (node: OutlineNode) => {
    if (node.children.length === 0) {
      leafs.push(node);
    } else {
      node.children.forEach(traverse);
    }
  };
  
  nodes.forEach(traverse);
  return leafs;
};

/**
 * Calculate total word count for a collection of nodes
 */
const calculateTotalWordCount = (nodes: OutlineNode[]): number => {
  return nodes.reduce((sum, node) => {
    return sum + node.estimatedWordCount + calculateTotalWordCount(node.children);
  }, 0);
};

/**
 * Calculate total word count for a node's children (not including the node itself)
 */
const calculateChildrenWordCount = (node: OutlineNode): number => {
  return node.children.reduce((sum, child) => {
    return sum + child.estimatedWordCount + calculateChildrenWordCount(child);
  }, 0);
};

/**
 * Analyze the complexity of an outline based on various factors
 * @param outline The outline to analyze
 * @returns Object with complexity scores and recommendations
 */
export const analyzeOutlineComplexity = (outline: Outline): {
  overallScore: number; // 0-100
  aspectScores: Record<string, number>;
  recommendations: string[];
} => {
  const aspectScores: Record<string, number> = {};
  const recommendations: string[] = [];
  
  // 1. Depth complexity
  const maxDepth = calculateMaxDepth(outline.rootNodes);
  aspectScores.depth = Math.min(100, maxDepth * 20); // 5+ levels = 100%
  
  if (maxDepth <= 1) {
    recommendations.push("Outline is very flat. Consider adding more hierarchical structure.");
  } else if (maxDepth > 5) {
    recommendations.push("Outline is very deep. Consider simplifying the hierarchy in some branches.");
  }
  
  // 2. Breadth complexity
  const avgBranchingFactor = calculateAvgBranchingFactor(outline.rootNodes);
  aspectScores.breadth = Math.min(100, avgBranchingFactor * 25); // 4+ children avg = 100%
  
  if (avgBranchingFactor > 5) {
    recommendations.push("Some nodes have many children. Consider grouping related items into subsections.");
  }
  
  // 3. Taxonomy complexity
  const taxonomyLevels = collectTaxonomyLevels(outline.rootNodes);
  const uniqueLevels = new Set(taxonomyLevels).size;
  aspectScores.taxonomy = Math.min(100, uniqueLevels * 20); // All 6 levels = 100%
  
  if (uniqueLevels <= 2) {
    recommendations.push("Limited range of taxonomy levels. Consider incorporating higher-order thinking activities.");
  }
  
  // 4. Content density
  const avgWordsPerNode = calculateAverageWordsPerNode(outline.rootNodes);
  aspectScores.density = Math.min(100, avgWordsPerNode / 5); // 500+ words avg = 100%
  
  if (avgWordsPerNode < 100) {
    recommendations.push("Content is very sparse. Consider adding more detailed descriptions.");
  } else if (avgWordsPerNode > 600) {
    recommendations.push("Content is very dense. Consider breaking into smaller chunks.");
  }
  
  // Calculate overall score as weighted average
  const weights = {
    depth: 0.25,
    breadth: 0.25,
    taxonomy: 0.3,
    density: 0.2
  };
  
  const overallScore = Math.round(
    Object.entries(aspectScores).reduce(
      (score, [aspect, value]) => score + value * weights[aspect as keyof typeof weights],
      0
    )
  );
  
  return {
    overallScore,
    aspectScores,
    recommendations
  };
};

/**
 * Calculate the maximum depth of an outline
 */
const calculateMaxDepth = (nodes: OutlineNode[], currentDepth: number = 1): number => {
  if (nodes.length === 0) return currentDepth - 1;
  
  return Math.max(
    ...nodes.map(node => 
      calculateMaxDepth(node.children, currentDepth + 1)
    )
  );
};

/**
 * Calculate the average branching factor (average number of children per node)
 */
const calculateAvgBranchingFactor = (nodes: OutlineNode[]): number => {
  let totalNodes = 0;
  let totalChildren = 0;
  
  const countNodes = (node: OutlineNode) => {
    totalNodes++;
    totalChildren += node.children.length;
    node.children.forEach(countNodes);
  };
  
  nodes.forEach(countNodes);
  
  return totalNodes > 0 ? totalChildren / totalNodes : 0;
};

/**
 * Collect all taxonomy levels used in the outline
 */
const collectTaxonomyLevels = (nodes: OutlineNode[]): TaxonomyLevel[] => {
  const levels: TaxonomyLevel[] = [];
  
  const traverseNodes = (node: OutlineNode) => {
    if (node.taxonomyLevel) {
      levels.push(node.taxonomyLevel);
    }
    node.children.forEach(traverseNodes);
  };
  
  nodes.forEach(traverseNodes);
  
  return levels;
};

/**
 * Calculate the average number of words per node
 */
const calculateAverageWordsPerNode = (nodes: OutlineNode[]): number => {
  let totalNodes = 0;
  let totalWords = 0;
  
  const countWords = (node: OutlineNode) => {
    totalNodes++;
    totalWords += node.estimatedWordCount;
    node.children.forEach(countWords);
  };
  
  nodes.forEach(countWords);
  
  return totalNodes > 0 ? totalWords / totalNodes : 0;
};
