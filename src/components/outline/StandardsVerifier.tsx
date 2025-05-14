import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Link, Search } from 'lucide-react';
import { Outline, OutlineNode } from '@/types/outline';
import { EducationalStandard } from '@/types/project';
import { Input } from '@/components/ui/input';

interface StandardsVerifierProps {
  outline: Outline;
  standards: EducationalStandard[];
  onUpdateOutline: (outline: Outline) => void;
}

export function StandardsVerifier({ 
  outline, 
  standards, 
  onUpdateOutline 
}: StandardsVerifierProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [standardsMap, setStandardsMap] = useState<Record<string, {
    standard: EducationalStandard;
    covered: boolean;
    nodes: { id: string; title: string; }[];
  }>>({});
  
  // Build a map of standards with coverage information
  useEffect(() => {
    const map: Record<string, {
      standard: EducationalStandard;
      covered: boolean;
      nodes: { id: string; title: string; }[];
    }> = {};
    
    // Initialize all standards as uncovered
    standards.forEach(std => {
      map[std.id] = {
        standard: std,
        covered: false,
        nodes: []
      };
    });
    
    // Check which standards are covered in the outline
    const findStandards = (node: OutlineNode) => {
      if (node.standardIds) {
        node.standardIds.forEach(stdId => {
          if (map[stdId]) {
            map[stdId].covered = true;
            map[stdId].nodes.push({
              id: node.id,
              title: node.title
            });
          }
        });
      }
      
      node.children.forEach(findStandards);
    };
    
    outline.rootNodes.forEach(findStandards);
    setStandardsMap(map);
  }, [outline, standards]);
  
  // Filter standards based on search term
  const filteredStandards = Object.values(standardsMap).filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.standard.id.toLowerCase().includes(searchLower) ||
      (item.standard.description && item.standard.description.toLowerCase().includes(searchLower)) ||
      (item.standard.category && item.standard.category.toLowerCase().includes(searchLower))
    );
  });
  
  // Calculate coverage metrics
  const totalStandards = standards.length;
  const coveredStandards = Object.values(standardsMap).filter(s => s.covered).length;
  const coveragePercentage = totalStandards > 0 ? Math.round((coveredStandards / totalStandards) * 100) : 100;
  
  // Add standard to a specific node
  const addStandardToNode = (standardId: string, nodeId: string) => {
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    // Helper to find and update a node
    const updateNode = (nodes: OutlineNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          // Add standard to this node
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
    }
  };
  
  // Find suitable nodes for a standard
  const findSuitableNodes = (standardId: string): OutlineNode[] => {
    const suitable: OutlineNode[] = [];
    const standard = standards.find(s => s.id === standardId);
    if (!standard) return suitable;
    
    // Helper to collect suitable nodes recursively
    const checkNode = (node: OutlineNode) => {
      // Skip nodes that already have this standard
      if (node.standardIds.includes(standardId)) return;
      
      // Check if node description/title matches standard keywords
      let isRelevant = false;
      
      if (standard.keywords && standard.keywords.length > 0) {
        for (const keyword of standard.keywords) {
          if (node.title.toLowerCase().includes(keyword.toLowerCase()) || 
              (node.description && node.description.toLowerCase().includes(keyword.toLowerCase()))) {
            isRelevant = true;
            break;
          }
        }
      } else if (standard.description) {
        // If no keywords available, use words from the description as potential matches
        const descWords = standard.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        for (const word of descWords) {
          if (node.title.toLowerCase().includes(word) || 
              (node.description && node.description.toLowerCase().includes(word))) {
            isRelevant = true;
            break;
          }
        }
      }
      
      // Topics, subsections, and assessments are typically good candidates
      if (isRelevant || ['topic', 'subsection', 'assessment'].includes(node.type)) {
        suitable.push(node);
      }
      
      // Check children
      node.children.forEach(checkNode);
    };
    
    outline.rootNodes.forEach(checkNode);
    
    return suitable;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">{coveredStandards} of {totalStandards} standards covered</span>
            </div>
            <Progress value={coveragePercentage} className="w-32 h-2" />
            <span className="ml-2 text-sm">{coveragePercentage}%</span>
          </div>
          
          <Input
            type="search"
            placeholder="Search standards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2 text-xs font-medium">Standard</th>
                <th className="text-left p-2 text-xs font-medium">Description</th>
                <th className="text-center p-2 text-xs font-medium">Status</th>
                <th className="text-right p-2 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandards.map(({ standard, covered, nodes }) => (
                <tr key={standard.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">
                    <Badge variant={covered ? "secondary" : "outline"} className="font-mono">
                      {standard.id}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm">
                    {standard.description ? 
                      standard.description.substring(0, 60) + (standard.description.length > 60 ? "..." : "") :
                      <span className="text-muted-foreground italic">No description</span>
                    }
                    {standard.category && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {standard.category}
                      </Badge>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {covered ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-xs">{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
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
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Link className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7"
                          onClick={() => {
                            const suitableNodes = findSuitableNodes(standard.id);
                            if (suitableNodes.length > 0) {
                              addStandardToNode(standard.id, suitableNodes[0].id);
                            }
                          }}
                        >
                          <Search className="h-3.5 w-3.5 mr-1" /> Find Match
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStandards.length === 0 && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No standards match your search criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StandardsVerifier;
