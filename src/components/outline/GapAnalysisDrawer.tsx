
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, AlertCircle, CheckCircle2, BookOpen, Clock } from 'lucide-react';
import { Outline, OutlineNode } from '@/types/outline';
import { EducationalStandard } from '@/types/project';
import { analyzeStandardsGaps, analyzeWordCountDistribution } from '@/services/outlineValidation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  
  // Standards analysis
  const standardsAnalysis = analyzeStandardsGaps(outline, standards);
  
  // Word count distribution analysis
  const wordDistribution = analyzeWordCountDistribution(outline);
  
  // Educational balance analysis (taxonomy levels, difficulty progression)
  const [taxonomyDistribution, setTaxonomyDistribution] = useState<Record<string, number>>({});
  const [difficultyDistribution, setDifficultyDistribution] = useState<Record<string, number>>({});
  
  // Calculate taxonomy and difficulty distributions
  useEffect(() => {
    const taxonomyCount: Record<string, number> = {};
    const difficultyCount: Record<string, number> = {};
    
    const analyzeNode = (node: OutlineNode) => {
      // Count taxonomy levels
      if (node.taxonomyLevel) {
        taxonomyCount[node.taxonomyLevel] = (taxonomyCount[node.taxonomyLevel] || 0) + 1;
      }
      
      // Count difficulty levels
      if (node.difficultyLevel) {
        difficultyCount[node.difficultyLevel] = (difficultyCount[node.difficultyLevel] || 0) + 1;
      }
      
      // Analyze children
      node.children.forEach(analyzeNode);
    };
    
    outline.rootNodes.forEach(analyzeNode);
    setTaxonomyDistribution(taxonomyCount);
    setDifficultyDistribution(difficultyCount);
  }, [outline]);
  
  // Get total counts for percentages
  const totalTaxonomyNodes = Object.values(taxonomyDistribution).reduce((a, b) => a + b, 0);
  const totalDifficultyNodes = Object.values(difficultyDistribution).reduce((a, b) => a + b, 0);
  
  // Fix missing standards
  const handleFixStandards = () => {
    if (standardsAnalysis.uncoveredStandards.length === 0) {
      toast({
        title: "All standards covered",
        description: "There are no uncovered standards to fix."
      });
      return;
    }
    
    // Find suitable nodes to add standards to
    const suitableNodes: OutlineNode[] = [];
    
    const findSuitableNodes = (node: OutlineNode) => {
      if (node.type === 'topic' || node.type === 'subsection' || node.type === 'section') {
        suitableNodes.push(node);
      }
      node.children.forEach(findSuitableNodes);
    };
    
    outline.rootNodes.forEach(findSuitableNodes);
    
    // Distribute uncovered standards among suitable nodes
    if (suitableNodes.length === 0) {
      toast({
        title: "No suitable nodes found",
        description: "Add sections or topics to the outline first."
      });
      return;
    }
    
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    // Helper to find and update a node in the outline
    const updateNodeStandards = (nodes: OutlineNode[], nodeId: string, standardId: string): boolean => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          // Add standard to this node
          node.standardIds = [...(node.standardIds || []), standardId];
          return true;
        }
        if (node.children.length > 0 && updateNodeStandards(node.children, nodeId, standardId)) {
          return true;
        }
      }
      return false;
    };
    
    // Distribute standards
    let standardsAdded = 0;
    standardsAnalysis.uncoveredStandards.forEach((standard, index) => {
      const targetNode = suitableNodes[index % suitableNodes.length];
      if (updateNodeStandards(updatedOutline.rootNodes, targetNode.id, standard.id)) {
        standardsAdded++;
      }
    });
    
    if (standardsAdded > 0) {
      onUpdateOutline(updatedOutline);
      toast({
        title: `Added ${standardsAdded} standards`,
        description: "Standards have been distributed across suitable content sections."
      });
    }
  };
  
  // Balance word count distribution
  const handleBalanceWordCount = () => {
    if (wordDistribution.isBalanced) {
      toast({
        title: "Content is already balanced",
        description: "The word count distribution is already reasonably balanced."
      });
      return;
    }
    
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    const totalWords = updatedOutline.rootNodes.reduce(
      (sum, node) => sum + node.estimatedWordCount, 0
    );
    
    // Calculate target word count for each root node
    const targetWordsPerNode = Math.round(totalWords / updatedOutline.rootNodes.length);
    
    // Adjust word counts to be more balanced
    updatedOutline.rootNodes.forEach(node => {
      const currentWords = node.estimatedWordCount;
      const adjustment = Math.round((targetWordsPerNode - currentWords) * 0.7); // 70% adjustment toward target
      node.estimatedWordCount = Math.max(100, currentWords + adjustment);
      
      // Also adjust duration proportionally
      const durationAdjustment = Math.round((adjustment / currentWords) * node.estimatedDuration);
      node.estimatedDuration = Math.max(5, node.estimatedDuration + durationAdjustment);
    });
    
    onUpdateOutline(updatedOutline);
    toast({
      title: "Word count balanced",
      description: "Content distribution has been adjusted for better balance."
    });
  };
  
  // Balance taxonomy distribution
  const handleBalanceTaxonomy = () => {
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    // Count current taxonomy levels
    const taxonomyLevels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
    const idealDistribution = {
      remember: 0.10,
      understand: 0.20,
      apply: 0.30,
      analyze: 0.20,
      evaluate: 0.10,
      create: 0.10
    };
    
    // Find nodes with taxonomy levels that should be adjusted
    const nodesToUpdate: {node: OutlineNode, newLevel: string}[] = [];
    
    const findNodesToUpdate = (nodes: OutlineNode[], depth: number) => {
      nodes.forEach(node => {
        if (!node.taxonomyLevel || depth >= 2) {
          // Assign taxonomy based on depth if missing or for deeper nodes
          const depthIndex = Math.min(depth, taxonomyLevels.length - 1);
          nodesToUpdate.push({
            node,
            newLevel: taxonomyLevels[depthIndex]
          });
        }
        
        // Check children
        findNodesToUpdate(node.children, depth + 1);
      });
    };
    
    findNodesToUpdate(updatedOutline.rootNodes, 0);
    
    // Update nodes in the outline
    const updateNodeTaxonomy = (nodes: OutlineNode[], nodeId: string, newLevel: string): boolean => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          node.taxonomyLevel = newLevel as any;
          return true;
        }
        if (node.children.length > 0 && updateNodeTaxonomy(node.children, nodeId, newLevel)) {
          return true;
        }
      }
      return false;
    };
    
    nodesToUpdate.forEach(({node, newLevel}) => {
      updateNodeTaxonomy(updatedOutline.rootNodes, node.id, newLevel);
    });
    
    if (nodesToUpdate.length > 0) {
      onUpdateOutline(updatedOutline);
      toast({
        title: `Updated ${nodesToUpdate.length} nodes`,
        description: "Taxonomy levels have been balanced across the outline."
      });
    } else {
      toast({
        title: "No changes needed",
        description: "Taxonomy distribution looks good already."
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" /> Gap Analysis Tool
          </DrawerTitle>
          <DrawerDescription>
            Identify and fix gaps in your educational outline
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="standards">Standards Coverage</TabsTrigger>
              <TabsTrigger value="distribution">Content Distribution</TabsTrigger>
              <TabsTrigger value="educational">Educational Balance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <div className="flex-1">Standards Coverage</div>
                    <Button variant="outline" size="sm" onClick={handleFixStandards}>
                      Auto-Fix Coverage
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {standards.length - standardsAnalysis.uncoveredStandards.length} of {standards.length} standards covered
                    </div>
                    <div className="flex items-center">
                      <Progress value={standardsAnalysis.coveragePercentage} className="w-40 h-2 mr-2" />
                      <span className="text-sm">{standardsAnalysis.coveragePercentage}%</span>
                    </div>
                  </div>
                  
                  {standardsAnalysis.uncoveredStandards.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Uncovered Standards:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {standardsAnalysis.uncoveredStandards.map(std => (
                          <div key={std.id} className="p-2 bg-muted rounded-md text-sm flex">
                            <Badge variant="outline" className="mr-2 shrink-0">{std.id}</Badge>
                            <div>{std.description?.substring(0, 100)}{std.description && std.description.length > 100 ? '...' : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-primary">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      All standards are covered in this outline
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {standardsAnalysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <div className="flex-1">Content Distribution</div>
                    <Button variant="outline" size="sm" onClick={handleBalanceWordCount}>
                      Balance Content
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {wordDistribution.isBalanced ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Balanced</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500">Imbalanced</Badge>
                    )}
                    <div className="text-sm">
                      {wordDistribution.isBalanced ? 
                        "Content is well-distributed across sections" : 
                        "Content distribution needs improvement"}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Section Distribution:</h4>
                    {wordDistribution.distribution.map(item => (
                      <div key={item.nodeId} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <div className="truncate max-w-[300px]">{item.title}</div>
                          <div className="text-muted-foreground">{item.wordCount} words ({item.percentage}%)</div>
                        </div>
                        <Progress value={item.percentage} className="h-1" />
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {wordDistribution.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="educational" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <div className="flex-1">Educational Balance</div>
                    <Button variant="outline" size="sm" onClick={handleBalanceTaxonomy}>
                      Balance Taxonomy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Bloom's Taxonomy Distribution:</h4>
                    <div className="space-y-2">
                      {Object.entries(taxonomyDistribution).map(([level, count]) => {
                        const percentage = totalTaxonomyNodes > 0 ? Math.round((count / totalTaxonomyNodes) * 100) : 0;
                        return (
                          <div key={level} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <div className="capitalize">{level}</div>
                              <div className="text-muted-foreground">{count} nodes ({percentage}%)</div>
                            </div>
                            <Progress value={percentage} className="h-1" />
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(taxonomyDistribution).length === 0 && (
                      <div className="text-sm text-muted-foreground">No taxonomy data available</div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Difficulty Level Distribution:</h4>
                    <div className="space-y-2">
                      {Object.entries(difficultyDistribution).map(([level, count]) => {
                        const percentage = totalDifficultyNodes > 0 ? Math.round((count / totalDifficultyNodes) * 100) : 0;
                        return (
                          <div key={level} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <div className="capitalize">{level}</div>
                              <div className="text-muted-foreground">{count} nodes ({percentage}%)</div>
                            </div>
                            <Progress value={percentage} className="h-1" />
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(difficultyDistribution).length === 0 && (
                      <div className="text-sm text-muted-foreground">No difficulty data available</div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {Object.keys(taxonomyDistribution).length <= 2 && (
                        <li>Add more variety in taxonomy levels (current: {Object.keys(taxonomyDistribution).join(", ")})</li>
                      )}
                      {Object.keys(difficultyDistribution).length <= 2 && (
                        <li>Add more variety in difficulty levels (current: {Object.keys(difficultyDistribution).join(", ")})</li>
                      )}
                      {!taxonomyDistribution.apply && !taxonomyDistribution.analyze && (
                        <li>Add content focused on application and analysis skills</li>
                      )}
                      {!taxonomyDistribution.create && (
                        <li>Add creative activities or assessments to higher-level thinking skills</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <DrawerClose asChild>
            <Button variant="outline" className="w-full mt-4">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default GapAnalysisDrawer;
