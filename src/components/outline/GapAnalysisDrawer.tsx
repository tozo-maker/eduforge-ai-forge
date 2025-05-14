
import React, { useState, useEffect } from 'react';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  BarChart3, 
  CheckCircle2, 
  GitBranch, 
  Lightbulb,
  MoveHorizontal,
  Network,
  Scale,
  XCircle,
  Layers
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Outline, OutlineNode } from '@/types/outline';
import { EducationalStandard } from '@/types/project';
import { 
  analyzeStandardsGaps,
  analyzeWordCountDistribution,
  analyzeOutlineComplexity
} from '@/services/outlineValidation';
import { toast } from '@/hooks/use-toast';

interface GapAnalysisDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outline: Outline;
  standards: EducationalStandard[];
  onUpdateOutline: (outline: Outline) => void;
}

export function GapAnalysisDrawer({ 
  open, 
  onOpenChange, 
  outline, 
  standards,
  onUpdateOutline
}: GapAnalysisDrawerProps) {
  const [activeTab, setActiveTab] = useState('standards');
  const [standardsAnalysis, setStandardsAnalysis] = useState<ReturnType<typeof analyzeStandardsGaps> | null>(null);
  const [wordCountAnalysis, setWordCountAnalysis] = useState<ReturnType<typeof analyzeWordCountDistribution> | null>(null);
  const [complexityAnalysis, setComplexityAnalysis] = useState<ReturnType<typeof analyzeOutlineComplexity> | null>(null);
  const [structureIssues, setStructureIssues] = useState<string[]>([]);
  const [relationshipGaps, setRelationshipGaps] = useState<{
    orphanNodes: OutlineNode[];
    terminalNodes: OutlineNode[];
    isolatedBranches: OutlineNode[];
    recommendations: string[];
  } | null>(null);
  
  // Run analysis when drawer opens or outline changes
  useEffect(() => {
    if (open) {
      runAnalysis();
    }
  }, [open, outline, standards]);
  
  // Run all analysis types
  const runAnalysis = () => {
    // Standards coverage analysis
    const standardsGaps = analyzeStandardsGaps(outline, standards);
    setStandardsAnalysis(standardsGaps);
    
    // Word count distribution analysis
    const wordCountDist = analyzeWordCountDistribution(outline);
    setWordCountAnalysis(wordCountDist);
    
    // Complexity analysis
    const complexity = analyzeOutlineComplexity(outline);
    setComplexityAnalysis(complexity);
    
    // Find structure issues
    const issues = findStructuralIssues(outline.rootNodes);
    setStructureIssues(issues);
    
    // Analyze relationships
    const relationships = analyzeRelationships(outline);
    setRelationshipGaps(relationships);
  };
  
  // Handle applying a suggested fix
  const handleApplySuggestion = (suggestion: string) => {
    // In a real implementation, this would intelligently apply the suggestion
    // For now, we'll just show a toast
    toast({
      title: "Applying Suggestion",
      description: `The suggestion: "${suggestion}" would be automatically applied.`,
    });
  };
  
  // Find structural issues in the outline
  const findStructuralIssues = (nodes: OutlineNode[]): string[] => {
    const issues: string[] = [];
    
    // Track node counts by type
    const typeCounts: Record<string, number> = {};
    
    // Track nodes with certain issues
    const noDescriptionNodes: string[] = [];
    const shortContentNodes: string[] = [];
    const noChildrenIntermediateNodes: string[] = [];
    
    const traverseNodes = (node: OutlineNode, depth: number) => {
      // Count node types
      typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
      
      // Check for description
      if (!node.description && ['section', 'subsection', 'topic'].includes(node.type)) {
        noDescriptionNodes.push(node.title);
      }
      
      // Check for short content in leaf nodes
      if (node.children.length === 0 && node.estimatedWordCount < 100) {
        shortContentNodes.push(node.title);
      }
      
      // Check for intermediate nodes with no children
      if (depth > 0 && node.children.length === 0 && ['section', 'subsection'].includes(node.type)) {
        noChildrenIntermediateNodes.push(node.title);
      }
      
      // Process children
      node.children.forEach(child => traverseNodes(child, depth + 1));
    };
    
    nodes.forEach(node => traverseNodes(node, 0));
    
    // Generate issues based on findings
    
    // Check node type distribution
    if (!typeCounts['assessment'] || typeCounts['assessment'] === 0) {
      issues.push("No assessment nodes found. Consider adding assessments for learning evaluation.");
    }
    
    if (!typeCounts['activity'] || typeCounts['activity'] === 0) {
      issues.push("No activity nodes found. Consider adding interactive activities for engagement.");
    }
    
    // Report nodes without descriptions
    if (noDescriptionNodes.length > 0) {
      const nodesToShow = noDescriptionNodes.slice(0, 3);
      issues.push(
        `${noDescriptionNodes.length} nodes are missing descriptions, including: ${
          nodesToShow.join(', ')}${noDescriptionNodes.length > 3 ? '...' : ''}`
      );
    }
    
    // Report short content nodes
    if (shortContentNodes.length > 0) {
      issues.push(
        `${shortContentNodes.length} leaf nodes have minimal content (less than 100 words).`
      );
    }
    
    // Report intermediate nodes without children
    if (noChildrenIntermediateNodes.length > 0) {
      issues.push(
        `${noChildrenIntermediateNodes.length} section/subsection nodes have no children.`
      );
    }
    
    return issues;
  };
  
  // Analyze relationships between nodes
  const analyzeRelationships = (outline: Outline) => {
    const orphanNodes: OutlineNode[] = [];
    const terminalNodes: OutlineNode[] = [];
    const isolatedBranches: OutlineNode[] = [];
    const recommendations: string[] = [];
    
    // Create a map of all nodes
    const nodeMap = new Map<string, OutlineNode>();
    
    // Create a map of relationships
    const relationshipsFrom = new Map<string, string[]>();
    const relationshipsTo = new Map<string, string[]>();
    
    // Map all nodes by ID
    const mapNodes = (node: OutlineNode) => {
      nodeMap.set(node.id, node);
      node.children.forEach(mapNodes);
    };
    
    outline.rootNodes.forEach(mapNodes);
    
    // Check for relationships
    if (outline.relationships && outline.relationships.length > 0) {
      // Map relationships
      outline.relationships.forEach(rel => {
        if (!relationshipsFrom.has(rel.fromNodeId)) {
          relationshipsFrom.set(rel.fromNodeId, []);
        }
        relationshipsFrom.get(rel.fromNodeId)!.push(rel.toNodeId);
        
        if (!relationshipsTo.has(rel.toNodeId)) {
          relationshipsTo.set(rel.toNodeId, []);
        }
        relationshipsTo.get(rel.toNodeId)!.push(rel.fromNodeId);
      });
      
      // Find leaf nodes with no outgoing relationships
      for (const [nodeId, node] of nodeMap.entries()) {
        if (node.children.length === 0 && !relationshipsFrom.has(nodeId)) {
          terminalNodes.push(node);
        }
      }
      
      // Find nodes that aren't referenced by any other node
      const rootNodeIds = new Set(outline.rootNodes.map(node => node.id));
      
      for (const [nodeId, node] of nodeMap.entries()) {
        // Skip root nodes, they're expected to have no incoming references
        if (rootNodeIds.has(nodeId)) continue;
        
        // Check if node has parent-child relationships
        let hasParent = false;
        for (const potentialParent of nodeMap.values()) {
          if (potentialParent.children.some(child => child.id === nodeId)) {
            hasParent = true;
            break;
          }
        }
        
        // If it has a parent but no other relationships, it might be orphaned
        if (hasParent && !relationshipsTo.has(nodeId)) {
          orphanNodes.push(node);
        }
      }
      
      // Find isolated branches (subtrees with no relationships to other subtrees)
      const connectedSubtrees = new Map<string, Set<string>>();
      
      // Build connected subgraphs
      outline.relationships.forEach(rel => {
        const rootFromId = findRootForNode(rel.fromNodeId, outline.rootNodes);
        const rootToId = findRootForNode(rel.toNodeId, outline.rootNodes);
        
        if (rootFromId && rootToId && rootFromId !== rootToId) {
          // Connect the trees
          if (!connectedSubtrees.has(rootFromId)) {
            connectedSubtrees.set(rootFromId, new Set([rootFromId]));
          }
          if (!connectedSubtrees.has(rootToId)) {
            connectedSubtrees.set(rootToId, new Set([rootToId]));
          }
          
          const fromSet = connectedSubtrees.get(rootFromId)!;
          const toSet = connectedSubtrees.get(rootToId)!;
          
          // Merge the sets
          toSet.forEach(id => fromSet.add(id));
          
          // Update all nodes in the toSet to point to the fromSet
          toSet.forEach(id => {
            connectedSubtrees.set(id, fromSet);
          });
        }
      });
      
      // Find isolated roots (no connections to other root sections)
      const processedRoots = new Set<string>();
      
      for (const root of outline.rootNodes) {
        if (processedRoots.has(root.id)) continue;
        
        const connected = connectedSubtrees.get(root.id);
        if (!connected || connected.size === 1) {
          // This root node is isolated
          isolatedBranches.push(root);
        }
        
        // Mark as processed
        if (connected) {
          connected.forEach(id => processedRoots.add(id));
        } else {
          processedRoots.add(root.id);
        }
      }
      
      // Generate recommendations
      if (orphanNodes.length > 0) {
        recommendations.push(
          `${orphanNodes.length} nodes aren't referenced by other nodes. Consider adding relationships.`
        );
      }
      
      if (terminalNodes.length > 0) {
        recommendations.push(
          `${terminalNodes.length} leaf nodes have no outgoing relationships. Consider adding connections.`
        );
      }
      
      if (isolatedBranches.length > 0) {
        recommendations.push(
          `${isolatedBranches.length} root sections are isolated from others. Consider adding cross-section relationships.`
        );
      }
    } else {
      // No relationships defined
      recommendations.push(
        "No relationships defined between nodes. Consider adding prerequisite, supports, or reference relationships."
      );
    }
    
    return {
      orphanNodes,
      terminalNodes,
      isolatedBranches,
      recommendations
    };
  };
  
  // Helper to find the root node ID for a given node ID
  const findRootForNode = (nodeId: string, roots: OutlineNode[]): string | null => {
    // Check if the node is a root
    for (const root of roots) {
      if (root.id === nodeId) return nodeId;
    }
    
    // Check children recursively
    for (const root of roots) {
      const result = findRootRecursively(nodeId, root);
      if (result) return root.id;
    }
    
    return null;
  };
  
  const findRootRecursively = (nodeId: string, parent: OutlineNode): boolean => {
    if (parent.id === nodeId) return true;
    
    for (const child of parent.children) {
      if (findRootRecursively(nodeId, child)) return true;
    }
    
    return false;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Outline Gap Analysis</DrawerTitle>
          <DrawerDescription>
            Identify opportunities to improve your outline structure and content
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="standards" className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Standards Coverage</span>
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center gap-1.5">
                <Scale className="h-4 w-4" />
                <span>Word Count</span>
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>Structure</span>
              </TabsTrigger>
              <TabsTrigger value="relationships" className="flex items-center gap-1.5">
                <GitBranch className="h-4 w-4" />
                <span>Relationships</span>
              </TabsTrigger>
              <TabsTrigger value="complexity" className="flex items-center gap-1.5">
                <Network className="h-4 w-4" />
                <span>Complexity</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Standards Coverage Analysis */}
            <TabsContent value="standards" className="h-[60vh] overflow-y-auto">
              {standardsAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold">{standardsAnalysis.coveragePercentage}%</div>
                        <div className="text-sm text-muted-foreground">Coverage</div>
                      </div>
                      <Progress 
                        value={standardsAnalysis.coveragePercentage} 
                        className="w-40 h-2"
                        indicatorClassName={
                          standardsAnalysis.coveragePercentage > 80 ? "bg-green-500" :
                          standardsAnalysis.coveragePercentage > 50 ? "bg-amber-500" :
                          "bg-red-500"
                        }
                      />
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">{standards.length - standardsAnalysis.uncoveredStandards.length}</span>
                      <span className="text-muted-foreground"> of </span>
                      <span className="font-medium">{standards.length}</span>
                      <span className="text-muted-foreground"> standards covered</span>
                    </div>
                  </div>
                  
                  {/* Category coverage if available */}
                  {standardsAnalysis.coverageByCategory && Object.keys(standardsAnalysis.coverageByCategory).length > 0 && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Coverage by Category</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-3">
                          {Object.entries(standardsAnalysis.coverageByCategory).map(([category, percentage]) => (
                            <div key={category} className="flex items-center gap-2">
                              <div className="w-24 font-medium text-sm truncate">{category}</div>
                              <Progress 
                                value={percentage} 
                                className="flex-1 h-2"
                                indicatorClassName={
                                  percentage > 80 ? "bg-green-500" :
                                  percentage > 50 ? "bg-amber-500" :
                                  "bg-red-500"
                                }
                              />
                              <div className="w-8 text-right text-sm">{percentage}%</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Recommendations</CardTitle>
                      <CardDescription>
                        Apply these suggestions to improve standards coverage
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      {standardsAnalysis.recommendations.length === 0 ? (
                        <div className="text-muted-foreground text-center py-2">
                          No recommendations - standards coverage is excellent!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {standardsAnalysis.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                              <div className="flex-1">{recommendation}</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 flex-shrink-0"
                                onClick={() => handleApplySuggestion(recommendation)}
                              >
                                Apply
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Uncovered Standards */}
                  {standardsAnalysis.uncoveredStandards.length > 0 && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Uncovered Standards</CardTitle>
                        <CardDescription>
                          {standardsAnalysis.uncoveredStandards.length} standards not yet addressed in the outline
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {standardsAnalysis.uncoveredStandards.map((standard) => (
                            <div key={standard.id} className="flex items-start gap-2 text-sm border-b pb-2">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <div>
                                <div className="font-medium">{standard.id}</div>
                                <div className="text-muted-foreground">
                                  {standard.description?.substring(0, 100)}
                                  {standard.description && standard.description.length > 100 ? '...' : ''}
                                </div>
                                {standard.category && (
                                  <Badge variant="outline" className="mt-1">
                                    {standard.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Word Count Distribution */}
            <TabsContent value="distribution" className="h-[60vh] overflow-y-auto">
              {wordCountAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold">{wordCountAnalysis.isBalanced ? 'Balanced' : 'Unbalanced'}</div>
                        <div className="text-sm text-muted-foreground">Distribution</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Distribution Chart */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Root Section Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="space-y-3">
                        {wordCountAnalysis.distribution.map((item) => (
                          <div key={item.nodeId} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <div className="font-medium">{item.title}</div>
                              <div className="text-muted-foreground">{item.wordCount} words</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={item.percentage} className="flex-1 h-2" />
                              <div className="w-8 text-right text-sm">{item.percentage}%</div>
                            </div>
                            {item.childrenTotal > 0 && (
                              <div className="text-xs text-muted-foreground">
                                +{item.childrenTotal} words in children
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Word Count Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {wordCountAnalysis.recommendations.length === 0 ? (
                        <div className="text-muted-foreground text-center py-2">
                          No recommendations - word count distribution is good!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {wordCountAnalysis.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <MoveHorizontal className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                              <div className="flex-1">{recommendation}</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 flex-shrink-0"
                                onClick={() => handleApplySuggestion(recommendation)}
                              >
                                Balance
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            {/* Structure Issues */}
            <TabsContent value="structure" className="h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Structure Analysis</CardTitle>
                    <CardDescription>
                      Issues and opportunities in the outline structure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    {structureIssues.length === 0 ? (
                      <div className="text-center py-4">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <div className="font-medium">No structural issues detected</div>
                        <p className="text-sm text-muted-foreground">
                          Your outline has a solid hierarchical structure
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {structureIssues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                            <div className="flex-1">{issue}</div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 flex-shrink-0"
                              onClick={() => handleApplySuggestion(issue)}
                            >
                              Fix
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Node Statistics */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Node Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    {/* Calculate node stats */}
                    {(() => {
                      // Count nodes by type
                      const typeCounts: Record<string, number> = {};
                      let totalNodes = 0;
                      let maxDepth = 0;
                      let branchingFactors: number[] = [];
                      
                      const countNodes = (node: OutlineNode, depth: number) => {
                        totalNodes++;
                        typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
                        maxDepth = Math.max(maxDepth, depth);
                        
                        if (node.children.length > 0) {
                          branchingFactors.push(node.children.length);
                        }
                        
                        node.children.forEach(child => countNodes(child, depth + 1));
                      };
                      
                      outline.rootNodes.forEach(node => countNodes(node, 1));
                      
                      const avgBranchingFactor = branchingFactors.length > 0
                        ? branchingFactors.reduce((sum, bf) => sum + bf, 0) / branchingFactors.length
                        : 0;
                      
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium">Node Count</div>
                            <div className="text-2xl font-bold">{totalNodes}</div>
                            <div className="text-xs text-muted-foreground">Total nodes in outline</div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium">Max Depth</div>
                            <div className="text-2xl font-bold">{maxDepth}</div>
                            <div className="text-xs text-muted-foreground">Deepest node level</div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium">Avg Children</div>
                            <div className="text-2xl font-bold">{avgBranchingFactor.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Children per parent node</div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium">Root Sections</div>
                            <div className="text-2xl font-bold">{outline.rootNodes.length}</div>
                            <div className="text-xs text-muted-foreground">Top-level sections</div>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="text-sm font-medium mb-2">Node Types</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(typeCounts).map(([type, count]) => (
                                <Badge key={type} variant="outline" className="flex gap-2 py-1">
                                  <span className="capitalize">{type}</span>
                                  <span className="bg-primary/10 px-1 rounded text-xs">
                                    {count}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Relationship Analysis */}
            <TabsContent value="relationships" className="h-[60vh] overflow-y-auto">
              {relationshipGaps && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Relationship Analysis</CardTitle>
                      <CardDescription>
                        Evaluate the connections between outline components
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      {outline.relationships?.length ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm font-medium">Total Relationships</div>
                              <div className="text-2xl font-bold">{outline.relationships?.length || 0}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Orphan Nodes</div>
                              <div className="text-2xl font-bold">{relationshipGaps.orphanNodes.length}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Terminal Nodes</div>
                              <div className="text-2xl font-bold">{relationshipGaps.terminalNodes.length}</div>
                            </div>
                          </div>
                          
                          {relationshipGaps.recommendations.length > 0 && (
                            <div className="space-y-3 mt-4">
                              <div className="font-medium">Recommendations</div>
                              {relationshipGaps.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <Network className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                  <div>{rec}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Network className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <div className="font-medium">No relationships defined</div>
                          <p className="text-sm text-muted-foreground">
                            Add relationships to connect different parts of your outline
                          </p>
                          <Button 
                            className="mt-2" 
                            variant="outline"
                            onClick={() => {
                              onOpenChange(false);
                              // This would ideally take the user to relationship visualization
                              toast({
                                title: "Relationship Editor",
                                description: "Navigate to the Relationship Visualizer to add connections."
                              });
                            }}
                          >
                            Add Relationships
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Issues Display */}
                  {(relationshipGaps.orphanNodes.length > 0 ||
                    relationshipGaps.terminalNodes.length > 0 ||
                    relationshipGaps.isolatedBranches.length > 0) && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Relationship Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <Tabs defaultValue="orphans" className="w-full">
                          <TabsList className="w-full grid grid-cols-3 h-9">
                            <TabsTrigger value="orphans" disabled={relationshipGaps.orphanNodes.length === 0}>
                              Orphaned ({relationshipGaps.orphanNodes.length})
                            </TabsTrigger>
                            <TabsTrigger value="terminal" disabled={relationshipGaps.terminalNodes.length === 0}>
                              Terminal ({relationshipGaps.terminalNodes.length})
                            </TabsTrigger>
                            <TabsTrigger value="isolated" disabled={relationshipGaps.isolatedBranches.length === 0}>
                              Isolated ({relationshipGaps.isolatedBranches.length})
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="orphans" className="max-h-40 overflow-y-auto">
                            {relationshipGaps.orphanNodes.map(node => (
                              <div key={node.id} className="py-1 px-2 text-sm border-b last:border-0">
                                {node.title}
                              </div>
                            ))}
                          </TabsContent>
                          
                          <TabsContent value="terminal" className="max-h-40 overflow-y-auto">
                            {relationshipGaps.terminalNodes.map(node => (
                              <div key={node.id} className="py-1 px-2 text-sm border-b last:border-0">
                                {node.title}
                              </div>
                            ))}
                          </TabsContent>
                          
                          <TabsContent value="isolated" className="max-h-40 overflow-y-auto">
                            {relationshipGaps.isolatedBranches.map(node => (
                              <div key={node.id} className="py-1 px-2 text-sm border-b last:border-0">
                                {node.title}
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Complexity Analysis */}
            <TabsContent value="complexity" className="h-[60vh] overflow-y-auto">
              {complexityAnalysis && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Outline Complexity Score</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full">
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="60" 
                              fill="transparent" 
                              stroke="#e5e7eb" 
                              strokeWidth="8"
                            />
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="60" 
                              fill="transparent" 
                              stroke={
                                complexityAnalysis.overallScore > 80 ? "#22c55e" : 
                                complexityAnalysis.overallScore > 50 ? "#f59e0b" : 
                                "#ef4444"
                              }
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 60 * complexityAnalysis.overallScore / 100} ${2 * Math.PI * 60 * (100 - complexityAnalysis.overallScore) / 100}`}
                              strokeDashoffset={`${Math.PI * 60 / 2}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{complexityAnalysis.overallScore}</span>
                            <span className="text-xs text-muted-foreground">Complexity Score</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(complexityAnalysis.aspectScores).map(([aspect, score]) => (
                          <div key={aspect} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium capitalize">{aspect}</div>
                              <div className="text-sm">{score}/100</div>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Complexity Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {complexityAnalysis.recommendations.length === 0 ? (
                        <div className="text-center py-2">
                          <div className="text-sm text-muted-foreground">
                            No recommendations - complexity is appropriate for this content!
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {complexityAnalysis.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
                              <div className="flex-1">{rec}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* What These Scores Mean */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Understanding Complexity Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-sm space-y-2">
                        <p>
                          <span className="font-medium">Depth</span>: Measures how many levels deep your outline goes. 
                          More levels mean more detailed hierarchy.
                        </p>
                        <p>
                          <span className="font-medium">Breadth</span>: Evaluates how many child nodes parents have on average.
                          Higher scores mean more topics per section.
                        </p>
                        <p>
                          <span className="font-medium">Taxonomy</span>: Analyzes the variety of cognitive levels in your outline
                          based on Bloom's taxonomy.
                        </p>
                        <p>
                          <span className="font-medium">Density</span>: Measures how many words are allocated per node on average.
                          Higher scores indicate more detailed content per node.
                        </p>
                        <p className="italic text-xs text-muted-foreground mt-3">
                          Note: Optimal complexity depends on your audience and purpose.
                          Higher is not always better - aim for appropriate complexity.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DrawerFooter>
          <Button onClick={() => runAnalysis()}>Refresh Analysis</Button>
          <DrawerClose>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default GapAnalysisDrawer;
