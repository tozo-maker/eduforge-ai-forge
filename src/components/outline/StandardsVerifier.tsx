
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Link, Search, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Outline, OutlineNode } from '@/types/outline';
import { EducationalStandard } from '@/types/project';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface StandardsVerifierProps {
  outline: Outline;
  standards: EducationalStandard[];
  onUpdateOutline: (outline: Outline) => void;
}

interface StandardCoverage {
  standard: EducationalStandard;
  covered: boolean;
  nodes: { id: string; title: string; }[];
  matchScore?: number; // 0-100 score for how well the standard is covered
  suggestedNodes?: { id: string; title: string; score: number }[];
}

export function StandardsVerifier({ 
  outline, 
  standards, 
  onUpdateOutline 
}: StandardsVerifierProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'covered' | 'uncovered'>('all');
  const [standardsMap, setStandardsMap] = useState<Record<string, StandardCoverage>>({});
  const [autoDistributeMode, setAutoDistributeMode] = useState<'simple' | 'intelligent' | 'keyword'>('intelligent');
  
  // Build a map of standards with coverage information
  useEffect(() => {
    const map: Record<string, StandardCoverage> = {};
    
    // Initialize all standards as uncovered
    standards.forEach(std => {
      map[std.id] = {
        standard: std,
        covered: false,
        nodes: [],
        matchScore: 0
      };
    });
    
    // Check which standards are covered in the outline
    const findStandards = (node: OutlineNode) => {
      if (node.standardIds?.length) {
        node.standardIds.forEach(stdId => {
          if (map[stdId]) {
            map[stdId].covered = true;
            map[stdId].nodes.push({
              id: node.id,
              title: node.title
            });
            
            // Calculate match score based on number of nodes
            // This is a simple score that will be improved
            map[stdId].matchScore = Math.min(100, map[stdId].nodes.length * 25);
          }
        });
      }
      
      node.children.forEach(findStandards);
    };
    
    outline.rootNodes.forEach(findStandards);
    
    // For uncovered standards, find suggested nodes
    Object.keys(map).forEach(stdId => {
      if (!map[stdId].covered) {
        map[stdId].suggestedNodes = findSuggestedNodesForStandard(map[stdId].standard, outline.rootNodes);
      }
    });
    
    setStandardsMap(map);
  }, [outline, standards]);
  
  // Filter standards based on search term and filter type
  const filteredStandards = Object.values(standardsMap).filter(item => {
    // First apply search filter
    const matchesSearch = !searchTerm || 
      item.standard.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.standard.description && 
       item.standard.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.standard.category && 
       item.standard.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Then apply coverage filter
    const matchesFilter = filterType === 'all' || 
      (filterType === 'covered' && item.covered) || 
      (filterType === 'uncovered' && !item.covered);
    
    return matchesSearch && matchesFilter;
  });
  
  // Calculate coverage metrics
  const totalStandards = standards.length;
  const coveredStandards = Object.values(standardsMap).filter(s => s.covered).length;
  const coveragePercentage = totalStandards > 0 ? Math.round((coveredStandards / totalStandards) * 100) : 100;
  const avgMatchScore = Object.values(standardsMap)
    .filter(s => s.covered && s.matchScore)
    .reduce((sum, s) => sum + (s.matchScore || 0), 0) / 
    (coveredStandards || 1);
  
  // Find potential keyword matches between standards and nodes
  function findSuggestedNodesForStandard(standard: EducationalStandard, nodes: OutlineNode[]): { id: string; title: string; score: number }[] {
    const matches: { id: string; title: string; score: number }[] = [];
    
    // Extract keywords from standard
    const standardKeywords = extractKeywords(standard);
    
    // Check each node for potential matches
    const checkNode = (node: OutlineNode) => {
      // Skip nodes that already have too many standards
      if (node.standardIds?.length > 2) return;
      
      const nodeKeywords = extractKeywordsFromNode(node);
      
      // Calculate match score based on keyword overlap
      const matchCount = countMatchingKeywords(standardKeywords, nodeKeywords);
      const overlapScore = matchCount / Math.max(1, Math.min(standardKeywords.length, nodeKeywords.length));
      
      // Only include nodes with reasonable match potential
      if (overlapScore > 0.1) {
        matches.push({
          id: node.id,
          title: node.title,
          score: Math.round(overlapScore * 100)
        });
      }
      
      // Check children recursively
      node.children.forEach(checkNode);
    };
    
    nodes.forEach(checkNode);
    
    // Sort by match score (highest first) and limit results
    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  }
  
  // Extract keywords from a standard
  function extractKeywords(standard: EducationalStandard): string[] {
    const keywords: string[] = [];
    
    // Use explicit keywords if available
    if (standard.keywords && standard.keywords.length > 0) {
      return [...standard.keywords];
    }
    
    // Otherwise extract from description
    if (standard.description) {
      // Split description into words and keep important ones
      const words = standard.description.toLowerCase()
        .replace(/[.,;:!?()\[\]{}'"]/g, '')
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && 
          !['and', 'the', 'that', 'this', 'with', 'from'].includes(word)
        );
      
      return [...words];
    }
    
    return keywords;
  }
  
  // Extract keywords from a node based on title and description
  function extractKeywordsFromNode(node: OutlineNode): string[] {
    const keywords: string[] = [];
    
    // Extract from title
    if (node.title) {
      const titleWords = node.title.toLowerCase()
        .replace(/[.,;:!?()\[\]{}'"]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      keywords.push(...titleWords);
    }
    
    // Extract from description
    if (node.description) {
      const descriptionWords = node.description.toLowerCase()
        .replace(/[.,;:!?()\[\]{}'"]/g, '')
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && 
          !['and', 'the', 'that', 'this', 'with', 'from'].includes(word)
        );
      
      keywords.push(...descriptionWords);
    }
    
    return keywords;
  }
  
  // Count matching keywords between two sets
  function countMatchingKeywords(keywords1: string[], keywords2: string[]): number {
    let matches = 0;
    
    for (const kw1 of keywords1) {
      for (const kw2 of keywords2) {
        if (kw1.includes(kw2) || kw2.includes(kw1)) {
          matches++;
          break;
        }
      }
    }
    
    return matches;
  }
  
  // Add standard to a specific node
  const addStandardToNode = (standardId: string, nodeId: string) => {
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    // Helper to find and update a node
    const updateNode = (nodes: OutlineNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          // Add standard to this node
          if (!nodes[i].standardIds) {
            nodes[i].standardIds = [];
          }
          
          if (!nodes[i].standardIds.includes(standardId)) {
            nodes[i].standardIds = [...nodes[i].standardIds, standardId];
          }
          return true;
        }
        if (nodes[i].children.length > 0 && updateNode(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };
    
    // Update the outline
    if (updateNode(updatedOutline.rootNodes)) {
      onUpdateOutline(updatedOutline);
      
      toast({
        title: "Standard Added",
        description: `Added standard ${standardId} to node "${
          Object.values(standardsMap).find(s => s.standard.id === standardId)?.nodes.find(n => n.id === nodeId)?.title || 'selected node'
        }"`
      });
    }
  };
  
  // Auto-distribute standards to appropriate nodes
  const autoDistributeStandards = () => {
    // Get uncovered standards
    const uncoveredStandards = Object.values(standardsMap)
      .filter(item => !item.covered && item.suggestedNodes && item.suggestedNodes.length > 0);
    
    if (uncoveredStandards.length === 0) {
      toast({
        title: "No Standards to Distribute",
        description: "All standards are already covered or have no suitable nodes."
      });
      return;
    }
    
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    let assignedCount = 0;
    
    // Distribute based on selected mode
    if (autoDistributeMode === 'simple') {
      // Simple mode: just assign each standard to its best match
      uncoveredStandards.forEach(item => {
        if (item.suggestedNodes && item.suggestedNodes.length > 0) {
          const bestMatch = item.suggestedNodes[0];
          assignStandardToNodeInOutline(updatedOutline, item.standard.id, bestMatch.id);
          assignedCount++;
        }
      });
    } 
    else if (autoDistributeMode === 'keyword') {
      // Keyword mode: detailed analysis of content to find best matches
      uncoveredStandards.forEach(item => {
        if (item.suggestedNodes && item.suggestedNodes.length > 0) {
          // Only use high-confidence matches (score > 40)
          const goodMatches = item.suggestedNodes.filter(node => node.score > 40);
          if (goodMatches.length > 0) {
            assignStandardToNodeInOutline(updatedOutline, item.standard.id, goodMatches[0].id);
            assignedCount++;
          }
        }
      });
    }
    else { // intelligent mode
      // Intelligent mode: avoid overloading nodes with too many standards
      
      // Track how many standards we've assigned to each node
      const nodeAssignmentCount: Record<string, number> = {};
      
      // First pass: count existing standards per node
      const countExistingStandards = (node: OutlineNode) => {
        if (node.standardIds && node.standardIds.length > 0) {
          nodeAssignmentCount[node.id] = node.standardIds.length;
        }
        node.children.forEach(countExistingStandards);
      };
      
      updatedOutline.rootNodes.forEach(countExistingStandards);
      
      // Sort by standard priority (could be category, etc.)
      const sortedStandards = [...uncoveredStandards]
        .sort((a, b) => {
          // First by category importance (if available)
          if (a.standard.category && b.standard.category) {
            if (a.standard.category < b.standard.category) return -1;
            if (a.standard.category > b.standard.category) return 1;
          }
          
          // Then by match confidence
          if (a.suggestedNodes && b.suggestedNodes) {
            const aScore = a.suggestedNodes[0]?.score || 0;
            const bScore = b.suggestedNodes[0]?.score || 0;
            return bScore - aScore;
          }
          
          return 0;
        });
      
      // Assign standards intelligently
      sortedStandards.forEach(item => {
        if (!item.suggestedNodes || item.suggestedNodes.length === 0) return;
        
        // Find the best match that isn't overloaded
        for (const match of item.suggestedNodes) {
          const currentCount = nodeAssignmentCount[match.id] || 0;
          
          // Don't add more than 3 standards to a single node
          if (currentCount < 3) {
            assignStandardToNodeInOutline(updatedOutline, item.standard.id, match.id);
            nodeAssignmentCount[match.id] = currentCount + 1;
            assignedCount++;
            break;
          }
        }
      });
    }
    
    // Update the outline if we made changes
    if (assignedCount > 0) {
      onUpdateOutline(updatedOutline);
      
      toast({
        title: "Standards Distributed",
        description: `Added ${assignedCount} standards to appropriate nodes.`
      });
    } else {
      toast({
        title: "No Standards Assigned",
        description: "Couldn't find suitable matches for uncovered standards."
      });
    }
  };
  
  // Helper function to assign a standard to a node in the outline
  function assignStandardToNodeInOutline(outlineObj: Outline, standardId: string, nodeId: string): boolean {
    const updateNode = (nodes: OutlineNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          if (!nodes[i].standardIds) {
            nodes[i].standardIds = [];
          }
          
          if (!nodes[i].standardIds.includes(standardId)) {
            nodes[i].standardIds.push(standardId);
          }
          return true;
        }
        
        if (nodes[i].children.length > 0 && updateNode(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };
    
    return updateNode(outlineObj.rootNodes);
  }
  
  // Remove a standard from a node
  const removeStandardFromNode = (standardId: string, nodeId: string) => {
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    // Helper to find and update a node
    const updateNode = (nodes: OutlineNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId && nodes[i].standardIds) {
          // Remove standard from this node
          nodes[i].standardIds = nodes[i].standardIds.filter(id => id !== standardId);
          return true;
        }
        if (nodes[i].children.length > 0 && updateNode(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };
    
    // Update the outline
    if (updateNode(updatedOutline.rootNodes)) {
      onUpdateOutline(updatedOutline);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Standards Verification</span>
          <div className="flex gap-2">
            <Select
              value={autoDistributeMode}
              onValueChange={(value) => setAutoDistributeMode(value as any)}
            >
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder="Distribution Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Assignment</SelectItem>
                <SelectItem value="intelligent">Intelligent Balance</SelectItem>
                <SelectItem value="keyword">Keyword Match</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={autoDistributeStandards}>Auto-Distribute Standards</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className="mr-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">{coveredStandards} of {totalStandards} standards</span>
              </div>
              <Progress value={coveragePercentage} className="w-32 h-2" />
              <span className="ml-2 text-sm">{coveragePercentage}%</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={filterType}
              onValueChange={(value) => setFilterType(value as 'all' | 'covered' | 'uncovered')}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Standards</SelectItem>
                <SelectItem value="covered">Covered Only</SelectItem>
                <SelectItem value="uncovered">Uncovered Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="search"
              placeholder="Search standards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2 text-xs font-medium">Standard</th>
                <th className="text-left p-2 text-xs font-medium">Description</th>
                <th className="text-center p-2 text-xs font-medium">Coverage</th>
                <th className="text-right p-2 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted-foreground">
                    No standards found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredStandards.map(({ standard, covered, nodes, matchScore, suggestedNodes }) => (
                  <tr key={standard.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      <Badge variant={covered ? "secondary" : "outline"} className="font-mono">
                        {standard.id}
                      </Badge>
                      {standard.category && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {standard.category}
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-sm">
                      {standard.description ? 
                        standard.description.substring(0, 60) + (standard.description.length > 60 ? "..." : "") :
                        <span className="text-muted-foreground italic">No description</span>
                      }
                    </td>
                    <td className="p-2 text-center">
                      {covered ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs">{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
                          </div>
                          {matchScore !== undefined && (
                            <Progress 
                              value={matchScore} 
                              className="w-16 h-1.5 mt-1" 
                              indicatorClassName={matchScore > 50 ? "bg-green-500" : "bg-amber-500"}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-xs">Not covered</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {covered ? (
                        <div className="flex justify-end">
                          {nodes.map(node => (
                            <Button
                              key={node.id}
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs"
                              title={`Remove from "${node.title}"`}
                              onClick={() => removeStandardFromNode(standard.id, node.id)}
                            >
                              <span className="truncate max-w-24">{node.title}</span>
                              <X className="h-3 w-3 ml-1" />
                            </Button>
                          ))}
                        </div>
                      ) : suggestedNodes && suggestedNodes.length > 0 ? (
                        <div className="flex justify-end gap-1">
                          {suggestedNodes.map(node => (
                            <Button 
                              key={node.id}
                              variant="outline" 
                              size="sm" 
                              className="h-7"
                              onClick={() => addStandardToNode(standard.id, node.id)}
                            >
                              <span className="truncate max-w-24">{node.title}</span>
                              <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7"
                          onClick={() => {
                            // Find any node that doesn't have too many standards
                            const findSuitableNode = (nodes: OutlineNode[]): OutlineNode | null => {
                              for (const node of nodes) {
                                if (!node.standardIds || node.standardIds.length < 3) {
                                  return node;
                                }
                                
                                const childResult = findSuitableNode(node.children);
                                if (childResult) return childResult;
                              }
                              return null;
                            };
                            
                            const suitableNode = findSuitableNode(outline.rootNodes);
                            if (suitableNode) {
                              addStandardToNode(standard.id, suitableNode.id);
                            } else {
                              toast({
                                title: "No Suitable Node",
                                description: "Couldn't find a node that can accept more standards."
                              });
                            }
                          }}
                        >
                          <Search className="h-3.5 w-3.5 mr-1" /> Find Match
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default StandardsVerifier;
