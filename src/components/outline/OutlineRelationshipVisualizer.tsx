
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Link, ArrowRight, LinkSlash, Save } from 'lucide-react';
import { Outline, OutlineNode, Relationship } from '@/types/outline';

interface OutlineRelationshipVisualizerProps {
  outline: Outline;
  onUpdateOutline: (outline: Outline) => void;
}

export function OutlineRelationshipVisualizer({ 
  outline, 
  onUpdateOutline 
}: OutlineRelationshipVisualizerProps) {
  const [relationships, setRelationships] = useState<Relationship[]>(
    outline.relationships || []
  );
  
  const [nodes, setNodes] = useState<{id: string; title: string; path: string}[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'prerequisite' | 'supports' | 'extends' | 'references'>('supports');
  
  // Flatten the outline node structure for easier selection
  useEffect(() => {
    const flatNodes: {id: string; title: string; path: string}[] = [];
    
    const traverseNodes = (node: OutlineNode, path: string = '') => {
      const nodePath = path ? `${path} > ${node.title}` : node.title;
      
      flatNodes.push({
        id: node.id,
        title: node.title,
        path: nodePath
      });
      
      node.children.forEach(child => traverseNodes(child, nodePath));
    };
    
    outline.rootNodes.forEach(root => traverseNodes(root));
    setNodes(flatNodes);
  }, [outline]);
  
  // Add a new relationship
  const handleAddRelationship = () => {
    if (!selectedSourceId || !selectedTargetId) {
      toast({
        description: "Please select both source and target nodes",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedSourceId === selectedTargetId) {
      toast({
        description: "Source and target nodes must be different",
        variant: "destructive"
      });
      return;
    }
    
    // Check if relationship already exists
    const exists = relationships.some(rel => 
      rel.fromNodeId === selectedSourceId && 
      rel.toNodeId === selectedTargetId && 
      rel.type === selectedType
    );
    
    if (exists) {
      toast({
        description: "This relationship already exists",
        variant: "destructive"
      });
      return;
    }
    
    const newRelationship: Relationship = {
      id: crypto.randomUUID(),
      fromNodeId: selectedSourceId,
      toNodeId: selectedTargetId,
      type: selectedType,
      description: `${selectedType} relationship`
    };
    
    setRelationships([...relationships, newRelationship]);
    
    toast({
      description: "Relationship added"
    });
  };
  
  // Remove a relationship
  const handleRemoveRelationship = (relationshipId: string) => {
    setRelationships(relationships.filter(rel => rel.id !== relationshipId));
  };
  
  // Save relationships to the outline
  const handleSaveRelationships = () => {
    const updatedOutline = {
      ...outline,
      relationships
    };
    
    onUpdateOutline(updatedOutline);
    
    toast({
      title: "Relationships saved",
      description: `${relationships.length} relationships saved to the outline`
    });
  };
  
  // Get node title by ID
  const getNodeTitle = (nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.title : 'Unknown Node';
  };
  
  // Get node path by ID
  const getNodePath = (nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.path : 'Unknown Path';
  };
  
  // Auto-detect potential relationships
  const handleAutoDetectRelationships = () => {
    if (nodes.length < 2) {
      toast({
        description: "Not enough nodes to detect relationships"
      });
      return;
    }
    
    const newRelationships: Relationship[] = [...relationships];
    let addedCount = 0;
    
    // Check for prerequisite relationships based on order in the outline
    outline.rootNodes.forEach(section => {
      // Create prerequisites from sequential topics
      if (section.children.length > 1) {
        for (let i = 1; i < section.children.length; i++) {
          const prev = section.children[i-1];
          const curr = section.children[i];
          
          // Check if relationship already exists
          const exists = newRelationships.some(rel => 
            rel.fromNodeId === prev.id && 
            rel.toNodeId === curr.id && 
            rel.type === 'prerequisite'
          );
          
          if (!exists) {
            newRelationships.push({
              id: crypto.randomUUID(),
              fromNodeId: prev.id,
              toNodeId: curr.id,
              type: 'prerequisite',
              description: `${prev.title} is a prerequisite for ${curr.title}`
            });
            addedCount++;
          }
        }
      }
    });
    
    // Check for supports relationships between nodes with same standards
    const standardMap: Record<string, string[]> = {}; // Maps standard IDs to node IDs
    
    const mapStandardToNodes = (node: OutlineNode) => {
      if (node.standardIds && node.standardIds.length > 0) {
        node.standardIds.forEach(stdId => {
          if (!standardMap[stdId]) {
            standardMap[stdId] = [];
          }
          standardMap[stdId].push(node.id);
        });
      }
      node.children.forEach(mapStandardToNodes);
    };
    
    outline.rootNodes.forEach(mapStandardToNodes);
    
    // Find nodes that share standards
    Object.values(standardMap).forEach(nodeIds => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length; i++) {
          for (let j = i + 1; j < nodeIds.length; j++) {
            // Skip if already has any kind of relationship
            const existingRel = newRelationships.some(rel => 
              (rel.fromNodeId === nodeIds[i] && rel.toNodeId === nodeIds[j]) ||
              (rel.fromNodeId === nodeIds[j] && rel.toNodeId === nodeIds[i])
            );
            
            if (!existingRel) {
              newRelationships.push({
                id: crypto.randomUUID(),
                fromNodeId: nodeIds[i],
                toNodeId: nodeIds[j],
                type: 'supports',
                description: 'These topics support each other (same standard)'
              });
              addedCount++;
            }
          }
        }
      }
    });
    
    if (addedCount > 0) {
      setRelationships(newRelationships);
      toast({
        title: `${addedCount} relationships detected`,
        description: "Auto-detected relationships based on outline structure"
      });
    } else {
      toast({
        description: "No new relationships detected"
      });
    }
  };
  
  // Render relationship type badge
  const renderRelationshipBadge = (type: string) => {
    switch (type) {
      case 'prerequisite':
        return <Badge variant="destructive">Prerequisite</Badge>;
      case 'supports':
        return <Badge variant="secondary">Supports</Badge>;
      case 'extends':
        return <Badge variant="default">Extends</Badge>;
      case 'references':
        return <Badge variant="outline">References</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Content Relationships Visualizer</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoDetectRelationships}>
              Auto-Detect Relationships
            </Button>
            <Button size="sm" onClick={handleSaveRelationships}>
              <Save className="h-4 w-4 mr-1" /> Save Relationships
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="space-y-3 border p-3 rounded-md">
              <h4 className="font-medium text-sm">Add New Relationship</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium block mb-1">Source Node</label>
                  <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select source node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map(node => (
                        <SelectItem key={`source-${node.id}`} value={node.id} className="text-xs">
                          {node.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium block mb-1">Relationship Type</label>
                  <Select value={selectedType} onValueChange={(val: any) => setSelectedType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prerequisite">Prerequisite</SelectItem>
                      <SelectItem value="supports">Supports</SelectItem>
                      <SelectItem value="extends">Extends</SelectItem>
                      <SelectItem value="references">References</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium block mb-1">Target Node</label>
                  <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select target node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map(node => (
                        <SelectItem key={`target-${node.id}`} value={node.id} className="text-xs">
                          {node.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleAddRelationship} className="w-full">
                <Link className="h-4 w-4 mr-1" /> Add Relationship
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted p-2 font-medium text-sm">
                Defined Relationships ({relationships.length})
              </div>
              <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                {relationships.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No relationships defined yet
                  </div>
                ) : (
                  relationships.map(rel => (
                    <div key={rel.id} className="border rounded-md p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-sm truncate">
                          {getNodeTitle(rel.fromNodeId)}
                        </div>
                        <div className="flex items-center">
                          <ArrowRight className="h-4 w-4 mx-1" />
                        </div>
                        <div className="flex-1 text-sm truncate">
                          {getNodeTitle(rel.toNodeId)}
                        </div>
                        <div>
                          {renderRelationshipBadge(rel.type)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRemoveRelationship(rel.id)}
                        >
                          <LinkSlash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <div>From: {getNodePath(rel.fromNodeId)}</div>
                        <div>To: {getNodePath(rel.toNodeId)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OutlineRelationshipVisualizer;
