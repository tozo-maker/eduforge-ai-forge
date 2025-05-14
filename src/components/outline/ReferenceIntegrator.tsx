
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Link, Plus, BookOpen, Lightbulb, FileText } from 'lucide-react';
import { Outline, OutlineNode, Reference } from '@/types/outline';
import { toast } from '@/hooks/use-toast';

export interface ReferenceIntegratorProps {
  outline: Outline;
  onUpdateOutline: (outline: Outline) => void;
  suggestedPlacements?: Record<string, string[]>;
  hasAnalyzedReferences?: boolean;
}

export function ReferenceIntegrator({ 
  outline, 
  onUpdateOutline, 
  suggestedPlacements = {}, 
  hasAnalyzedReferences = false 
}: ReferenceIntegratorProps) {
  // State for references list
  const [references, setReferences] = useState<Reference[]>(
    outline.references || []
  );
  
  // State for new reference form - now with required url property
  const [newReference, setNewReference] = useState<Omit<Reference, 'id'>>({
    title: '',
    url: '', // Required field based on the type definition
    notes: '',
    type: 'article'
  });
  
  // State for node-reference mapping
  const [nodeReferences, setNodeReferences] = useState<Record<string, string[]>>(
    suggestedPlacements && hasAnalyzedReferences ? 
    { ...outline.nodeReferences || {}, ...suggestedPlacements } : 
    outline.nodeReferences || {}
  );
  
  // Add a new reference
  const handleAddReference = () => {
    if (!newReference.title) {
      toast({
        description: "Reference title is required",
        variant: "destructive"
      });
      return;
    }
    
    // Now require URL as it's not optional in the Outline type
    if (!newReference.url) {
      toast({
        description: "Reference URL is required",
        variant: "destructive"
      });
      return;
    }
    
    const reference: Reference = {
      ...newReference,
      id: crypto.randomUUID()
    };
    
    setReferences([...references, reference]);
    setNewReference({
      title: '',
      url: '',
      notes: '',
      type: 'article'
    });
  };
  
  // Remove a reference
  const handleRemoveReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
    
    // Also remove from node mappings
    const updatedNodeReferences = { ...nodeReferences };
    Object.keys(updatedNodeReferences).forEach(nodeId => {
      updatedNodeReferences[nodeId] = updatedNodeReferences[nodeId].filter(refId => refId !== id);
    });
    setNodeReferences(updatedNodeReferences);
  };
  
  // Toggle association between node and reference
  const toggleNodeReference = (nodeId: string, referenceId: string) => {
    const updatedNodeReferences = { ...nodeReferences };
    
    if (!updatedNodeReferences[nodeId]) {
      updatedNodeReferences[nodeId] = [];
    }
    
    const index = updatedNodeReferences[nodeId].indexOf(referenceId);
    if (index === -1) {
      updatedNodeReferences[nodeId].push(referenceId);
    } else {
      updatedNodeReferences[nodeId].splice(index, 1);
    }
    
    setNodeReferences(updatedNodeReferences);
  };
  
  // Save all reference changes to the outline
  const handleSaveReferences = () => {
    const updatedOutline: Outline = { 
      ...outline,
      references,
      nodeReferences
    };
    
    onUpdateOutline(updatedOutline);
    toast({
      title: "References saved",
      description: `${references.length} references integrated with the outline.`
    });
  };
  
  // Auto-suggest reference mappings
  const handleAutoSuggest = () => {
    if (references.length === 0) {
      toast({
        description: "Add references first before auto-suggesting mappings."
      });
      return;
    }
    
    const updatedNodeReferences = { ...nodeReferences };
    let suggestionsCount = 0;
    
    const findRelevantNodes = (node: OutlineNode) => {
      // Check each reference for relevance to this node
      references.forEach(reference => {
        // Skip if already mapped
        if (updatedNodeReferences[node.id]?.includes(reference.id)) {
          return;
        }
        
        // Check for keyword matches in title or description
        const nodeText = (node.title + ' ' + (node.description || '')).toLowerCase();
        const referenceText = (reference.title + ' ' + (reference.notes || '')).toLowerCase();
        
        let isRelevant = false;
        
        // Simple relevance check: look for shared words of 4+ characters
        const nodeWords = nodeText.split(/\s+/).filter(word => word.length >= 4);
        const refWords = referenceText.split(/\s+/).filter(word => word.length >= 4);
        
        for (const nodeWord of nodeWords) {
          if (refWords.some(refWord => refWord.includes(nodeWord) || nodeWord.includes(refWord))) {
            isRelevant = true;
            break;
          }
        }
        
        // If relevant, add the mapping
        if (isRelevant) {
          if (!updatedNodeReferences[node.id]) {
            updatedNodeReferences[node.id] = [];
          }
          updatedNodeReferences[node.id].push(reference.id);
          suggestionsCount++;
        }
      });
      
      // Check child nodes
      node.children.forEach(findRelevantNodes);
    };
    
    outline.rootNodes.forEach(findRelevantNodes);
    
    setNodeReferences(updatedNodeReferences);
    
    toast({
      title: `${suggestionsCount} mappings suggested`,
      description: "References have been mapped to relevant outline nodes."
    });
  };
  
  // Get reference type icon
  const getReferenceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'book':
        return <BookOpen className="h-4 w-4" />;
      case 'research':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };
  
  // Render the outline tree for reference mapping
  const renderOutlineNode = (node: OutlineNode, depth: number = 0) => {
    const nodeRefs = nodeReferences[node.id] || [];
    
    return (
      <div key={node.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div className="flex items-start py-2">
          <div className="flex-1 font-medium">{node.title}</div>
          <div className="flex flex-wrap gap-1">
            {references.map(ref => (
              <Badge
                key={ref.id}
                variant={nodeRefs.includes(ref.id) ? "default" : "outline"}
                className={`cursor-pointer ${!nodeRefs.includes(ref.id) ? 'opacity-50' : ''}`}
                onClick={() => toggleNodeReference(node.id, ref.id)}
              >
                {getReferenceIcon(ref.type)}
                <span className="ml-1 max-w-[100px] truncate">{ref.title}</span>
              </Badge>
            ))}
          </div>
        </div>
        
        {node.children.length > 0 && (
          <div className="border-l ml-2 pl-2">
            {node.children.map(child => renderOutlineNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Reference Material Integration</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoSuggest}>
              Auto-Suggest Mappings
            </Button>
            <Button size="sm" onClick={handleSaveReferences}>
              Save References
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* References Management */}
          <div className="space-y-4">
            <div className="space-y-3 border p-3 rounded-md">
              <h4 className="font-medium text-sm">Add Reference</h4>
              <Input
                placeholder="Reference Title"
                value={newReference.title}
                onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
                className="mb-2"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="URL (Required)" // Updated to show it's required
                  value={newReference.url}
                  onChange={(e) => setNewReference({ ...newReference, url: e.target.value })}
                  required // Added required attribute
                />
                
                <select 
                  className="border rounded-md px-3 py-1"
                  value={newReference.type}
                  onChange={(e) => setNewReference({ 
                    ...newReference, 
                    type: e.target.value as any 
                  })}
                >
                  <option value="article">Article</option>
                  <option value="book">Book</option>
                  <option value="video">Video</option>
                  <option value="website">Website</option>
                  <option value="research">Research</option>
                </select>
              </div>
              
              <Textarea
                placeholder="Notes (Optional)"
                value={newReference.notes || ''}
                onChange={(e) => setNewReference({ ...newReference, notes: e.target.value })}
                rows={2}
              />
              
              <Button onClick={handleAddReference} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Reference
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted p-2 font-medium text-sm">
                References ({references.length})
              </div>
              <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                {references.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No references added yet
                  </div>
                ) : (
                  references.map(ref => (
                    <div key={ref.id} className="border rounded-md p-2 flex">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {getReferenceIcon(ref.type)}
                          <span className="font-medium ml-1">{ref.title}</span>
                        </div>
                        {ref.url && (
                          <div className="text-xs text-blue-500 truncate">
                            <a href={ref.url} target="_blank" rel="noopener noreferrer">
                              {ref.url}
                            </a>
                          </div>
                        )}
                        {ref.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {ref.notes.substring(0, 100)}{ref.notes.length > 100 ? '...' : ''}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveReference(ref.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Reference Mapping */}
          <div>
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted p-2 font-medium text-sm flex justify-between items-center">
                <span>Map References to Content</span>
                <div className="text-xs text-muted-foreground">
                  Click badges to toggle
                </div>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {outline.rootNodes.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No outline content to map references to
                  </div>
                ) : references.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Add references first to map them to the outline
                  </div>
                ) : (
                  outline.rootNodes.map(node => renderOutlineNode(node))
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReferenceIntegrator;
