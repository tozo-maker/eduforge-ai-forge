
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Outline, OutlineNode, OutlineNodeType } from '@/types/outline';
import { EducationalStandard } from '@/types/project';
import { analyzeStandardsCoverage } from '@/services/outlineGeneration';

interface OutlineAnalyticsProps {
  outline: Outline;
  standards: EducationalStandard[];
}

export function OutlineAnalytics({ outline, standards }: OutlineAnalyticsProps) {
  // Calculate standards coverage
  const standardsCoverage = analyzeStandardsCoverage(outline, standards);
  
  // Analyze taxonomy distribution
  const taxonomyDistribution = calculateTaxonomyDistribution(outline.rootNodes);
  
  // Analyze difficulty progression
  const difficultyProgression = analyzeDifficultyProgression(outline.rootNodes);
  
  // Calculate time allocation
  const timeAllocation = calculateTimeAllocation(outline.rootNodes);
  
  // Determine balanced time distribution
  const isTimeBalanced = Math.max(...Object.values(timeAllocation)) / 
    Math.min(...Object.values(timeAllocation).filter(v => v > 0)) < 3;
  
  // Calculate warning count
  const warnings = getOutlineWarnings(outline, standards);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Outline Analytics</CardTitle>
        <CardDescription>
          Analysis and insights for your educational outline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="standards" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Standards</span>
            </TabsTrigger>
            <TabsTrigger value="progression" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span>Progression</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-base font-medium">Standards Coverage</h3>
                <div className="flex items-center gap-2">
                  <Progress value={standardsCoverage} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(standardsCoverage)}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-medium">Balance Score</h3>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={isTimeBalanced ? 80 : 40} 
                    className={`flex-1 ${isTimeBalanced ? 'bg-green-100' : 'bg-amber-100'}`}
                  />
                  <span className="text-sm font-medium">
                    {isTimeBalanced ? 'Good' : 'Needs Adjustment'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-2">Warnings & Suggestions</h3>
              {warnings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No issues found. Your outline looks good!
                </p>
              ) : (
                <ul className="space-y-2">
                  {warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500">⚠️</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Sections</div>
                <div className="text-2xl font-bold">
                  {countNodesByType(outline.rootNodes, 'section')}
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Topics</div>
                <div className="text-2xl font-bold">
                  {countNodesByType(outline.rootNodes, 'topic')}
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Activities</div>
                <div className="text-2xl font-bold">
                  {countNodesByType(outline.rootNodes, 'activity')}
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Assessments</div>
                <div className="text-2xl font-bold">
                  {countNodesByType(outline.rootNodes, 'assessment')}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="standards" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-base font-medium mb-2">Standards Coverage</h3>
                <div className="space-y-3">
                  {standards.map(standard => {
                    const isCovered = isStandardCovered(outline.rootNodes, standard.id);
                    return (
                      <div key={standard.id} className="flex items-start gap-2">
                        <div className={`w-2 h-2 mt-1 rounded-full ${isCovered ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <div className="text-sm font-medium">{standard.id}</div>
                          <div className="text-xs text-muted-foreground">{standard.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="progression" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-base font-medium mb-3">Taxonomy Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(taxonomyDistribution).map(([level, count]) => (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{level}</span>
                        <span>{count}</span>
                      </div>
                      <Progress 
                        value={count / Object.values(taxonomyDistribution).reduce((a, b) => a + b, 0) * 100} 
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-base font-medium mb-3">Time Allocation (minutes)</h3>
                <div className="space-y-2">
                  {Object.entries(timeAllocation).map(([type, minutes]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <span>{minutes} mins</span>
                      </div>
                      <Progress 
                        value={minutes / Object.values(timeAllocation).reduce((a, b) => a + b, 0) * 100} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-base font-medium mb-3">Difficulty Progression</h3>
              <div className="flex items-center justify-between h-20">
                {difficultyProgression.map((level, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center"
                    style={{ flex: 1 }}
                  >
                    <div 
                      className="bg-primary/80 rounded-md w-full mx-1"
                      style={{ 
                        height: `${level * 15}px`,
                        opacity: 0.6 + (level * 0.1)
                      }}
                    ></div>
                    <div className="text-xs mt-2">Section {index + 1}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <div>Introductory</div>
                <div>Beginner</div>
                <div>Intermediate</div>
                <div>Advanced</div>
                <div>Expert</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline">
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for analytics
const countNodesByType = (nodes: OutlineNode[], type: OutlineNodeType): number => {
  return nodes.reduce((count, node) => {
    const countInChildren = countNodesByType(node.children, type);
    return count + (node.type === type ? 1 : 0) + countInChildren;
  }, 0);
};

const isStandardCovered = (nodes: OutlineNode[], standardId: string): boolean => {
  for (const node of nodes) {
    if (node.standardIds.includes(standardId)) {
      return true;
    }
    if (node.children.length > 0 && isStandardCovered(node.children, standardId)) {
      return true;
    }
  }
  return false;
};

const calculateTaxonomyDistribution = (
  nodes: OutlineNode[]
): Record<string, number> => {
  const distribution: Record<string, number> = {
    remember: 0,
    understand: 0,
    apply: 0,
    analyze: 0, 
    evaluate: 0,
    create: 0
  };
  
  const processNode = (node: OutlineNode) => {
    if (node.taxonomyLevel) {
      distribution[node.taxonomyLevel]++;
    }
    node.children.forEach(processNode);
  };
  
  nodes.forEach(processNode);
  return distribution;
};

const analyzeDifficultyProgression = (nodes: OutlineNode[]): number[] => {
  // Map difficulty levels to numeric values
  const difficultyMap: Record<string, number> = {
    introductory: 1,
    beginner: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5
  };
  
  // Get top-level progression
  return nodes.map(node => {
    const allNodes = [node, ...getAllChildren(node)];
    const avgDifficulty = allNodes
      .filter(n => n.difficultyLevel)
      .reduce((sum, n) => sum + difficultyMap[n.difficultyLevel!], 0) / 
      allNodes.filter(n => n.difficultyLevel).length;
    
    return avgDifficulty || 1;
  });
};

const getAllChildren = (node: OutlineNode): OutlineNode[] => {
  let children: OutlineNode[] = [];
  for (const child of node.children) {
    children.push(child, ...getAllChildren(child));
  }
  return children;
};

const calculateTimeAllocation = (
  nodes: OutlineNode[]
): Record<string, number> => {
  const allocation: Record<string, number> = {
    section: 0,
    subsection: 0,
    topic: 0,
    activity: 0,
    assessment: 0,
    resource: 0
  };
  
  const processNode = (node: OutlineNode) => {
    allocation[node.type] += node.estimatedDuration;
    node.children.forEach(processNode);
  };
  
  nodes.forEach(processNode);
  return allocation;
};

const getOutlineWarnings = (outline: Outline, standards: EducationalStandard[]): string[] => {
  const warnings: string[] = [];
  
  // Check standards coverage
  const coverage = analyzeStandardsCoverage(outline, standards);
  if (coverage < 80) {
    warnings.push(`Only ${Math.round(coverage)}% of standards are covered in your outline.`);
  }
  
  // Check taxonomy distribution
  const taxonomy = calculateTaxonomyDistribution(outline.rootNodes);
  const totalTaxonomy = Object.values(taxonomy).reduce((a, b) => a + b, 0);
  
  if ((taxonomy.remember / totalTaxonomy) > 0.4) {
    warnings.push('Too much focus on basic recall (Remember level). Consider adding higher-order thinking activities.');
  }
  
  if ((taxonomy.create / totalTaxonomy) < 0.1) {
    warnings.push('Limited creative activities. Consider adding more opportunities for creation and innovation.');
  }
  
  // Check assessment balance
  const assessmentCount = countNodesByType(outline.rootNodes, 'assessment');
  const topicCount = countNodesByType(outline.rootNodes, 'topic');
  
  if (assessmentCount < topicCount / 3) {
    warnings.push('Limited assessment opportunities. Consider adding more assessment points.');
  }
  
  // Check section balance
  if (outline.rootNodes.length > 0) {
    const avgChildrenCount = outline.rootNodes.reduce(
      (sum, node) => sum + node.children.length, 
      0
    ) / outline.rootNodes.length;
    
    const imbalanced = outline.rootNodes.some(
      node => node.children.length > avgChildrenCount * 2 || 
              (avgChildrenCount > 2 && node.children.length === 0)
    );
    
    if (imbalanced) {
      warnings.push('Sections have an imbalanced number of subsections. Consider redistributing content more evenly.');
    }
  }
  
  return warnings;
};

export default OutlineAnalytics;
