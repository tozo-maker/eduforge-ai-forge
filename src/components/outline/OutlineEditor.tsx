
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronRight, 
  ChevronDown, 
  GripVertical, 
  Plus, 
  X, 
  Edit, 
  Clock, 
  BookOpen,
  AlertCircle 
} from 'lucide-react';
import { Outline, OutlineNode, OutlineNodeType, DifficultyLevel, TaxonomyLevel } from '@/types/outline';
import { EducationalStandard } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { calculateTotalWordCount, calculateTotalDuration } from '@/services/outlineGeneration';

interface OutlineEditorProps {
  outline: Outline;
  standards?: EducationalStandard[];
  onSave: (outline: Outline) => void;
}

export function OutlineEditor({ outline, standards = [], onSave }: OutlineEditorProps) {
  const [editableOutline, setEditableOutline] = useState<Outline>({...outline});
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const dragNode = useRef<string | null>(null);
  const dropTarget = useRef<string | null>(null);

  // Node type options
  const nodeTypeOptions: { value: OutlineNodeType; label: string }[] = [
    { value: 'section', label: 'Section' },
    { value: 'subsection', label: 'Subsection' },
    { value: 'topic', label: 'Topic' },
    { value: 'activity', label: 'Activity' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'resource', label: 'Resource' }
  ];

  // Difficulty level options
  const difficultyOptions: { value: DifficultyLevel; label: string }[] = [
    { value: 'introductory', label: 'Introductory' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  // Taxonomy level options
  const taxonomyOptions: { value: TaxonomyLevel; label: string }[] = [
    { value: 'remember', label: 'Remember' },
    { value: 'understand', label: 'Understand' },
    { value: 'apply', label: 'Apply' },
    { value: 'analyze', label: 'Analyze' },
    { value: 'evaluate', label: 'Evaluate' },
    { value: 'create', label: 'Create' }
  ];

  // Toggle expanded state of a node
  const toggleExpanded = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Start editing a node
  const startEditing = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(nodeId);
  };

  // Update a node's property
  const updateNode = (nodeId: string, key: keyof OutlineNode, value: any) => {
    const updateNodeRecursively = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, [key]: value };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNodeRecursively(node.children) };
        }
        return node;
      });
    };

    setEditableOutline(prev => ({
      ...prev,
      rootNodes: updateNodeRecursively(prev.rootNodes),
      updatedAt: new Date()
    }));
  };

  // Add a child node
  const addChildNode = (parentId: string) => {
    const addChildRecursively = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          const newNode: OutlineNode = {
            id: crypto.randomUUID(),
            title: 'New Item',
            type: 'topic',
            estimatedWordCount: 200,
            estimatedDuration: 15,
            children: [],
            standardIds: [...node.standardIds],
            taxonomyLevel: node.taxonomyLevel || 'understand',
            difficultyLevel: node.difficultyLevel || 'beginner'
          };
          
          return { 
            ...node, 
            children: [...node.children, newNode] 
          };
        }
        if (node.children.length > 0) {
          return { ...node, children: addChildRecursively(node.children) };
        }
        return node;
      });
    };

    setEditableOutline(prev => ({
      ...prev,
      rootNodes: addChildRecursively(prev.rootNodes),
      updatedAt: new Date()
    }));
    
    // Expand the parent
    setExpandedNodes(prev => new Set([...prev, parentId]));
  };

  // Add a root node
  const addRootNode = () => {
    const newNode: OutlineNode = {
      id: crypto.randomUUID(),
      title: 'New Section',
      type: 'section',
      estimatedWordCount: 500,
      estimatedDuration: 30,
      children: [],
      standardIds: []
    };

    setEditableOutline(prev => ({
      ...prev,
      rootNodes: [...prev.rootNodes, newNode],
      updatedAt: new Date()
    }));
  };

  // Remove a node
  const removeNode = (nodeId: string) => {
    const removeNodeRecursively = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.filter(node => {
        if (node.id === nodeId) {
          return false;
        }
        if (node.children.length > 0) {
          node.children = removeNodeRecursively(node.children);
        }
        return true;
      });
    };

    setEditableOutline(prev => ({
      ...prev,
      rootNodes: removeNodeRecursively(prev.rootNodes),
      updatedAt: new Date()
    }));
    
    // Clear editing state if needed
    if (editingNode === nodeId) {
      setEditingNode(null);
    }
  };

  // Handle drag start
  const handleDragStart = (nodeId: string, e: React.DragEvent) => {
    dragNode.current = nodeId;
    e.dataTransfer.setData('text/plain', nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (nodeId: string, e: React.DragEvent) => {
    e.preventDefault();
    dropTarget.current = nodeId;
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (targetNodeId: string, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragNode.current) return;
    
    const sourceNodeId = dragNode.current;
    
    // Don't drop on self
    if (sourceNodeId === targetNodeId) {
      dragNode.current = null;
      dropTarget.current = null;
      return;
    }
    
    // Find and remove the source node
    let sourceNode: OutlineNode | null = null;
    
    const removeSourceNode = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.filter(node => {
        if (node.id === sourceNodeId) {
          sourceNode = {...node};
          return false;
        }
        if (node.children.length > 0) {
          node.children = removeSourceNode(node.children);
        }
        return true;
      });
    };
    
    const outlineWithoutSource = {
      ...editableOutline,
      rootNodes: removeSourceNode([...editableOutline.rootNodes])
    };
    
    if (!sourceNode) {
      console.error('Source node not found');
      return;
    }
    
    // Add the source node to the target
    const addToTarget = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === targetNodeId) {
          return { 
            ...node, 
            children: [...node.children, sourceNode!] 
          };
        }
        if (node.children.length > 0) {
          return { ...node, children: addToTarget(node.children) };
        }
        return node;
      });
    };
    
    // Try to add to target's children
    let outlineWithTarget = {
      ...outlineWithoutSource,
      rootNodes: addToTarget(outlineWithoutSource.rootNodes)
    };
    
    // If the target node wasn't found as a child, add source as a root node
    if (JSON.stringify(outlineWithTarget) === JSON.stringify(outlineWithoutSource)) {
      outlineWithTarget = {
        ...outlineWithoutSource,
        rootNodes: [...outlineWithoutSource.rootNodes, sourceNode]
      };
    }
    
    setEditableOutline(outlineWithTarget);
    
    // Expand the target
    setExpandedNodes(prev => new Set([...prev, targetNodeId]));
    
    // Reset refs
    dragNode.current = null;
    dropTarget.current = null;
  };

  // Handle save
  const handleSave = () => {
    const newOutline = {
      ...editableOutline,
      version: editableOutline.version + 1,
      updatedAt: new Date()
    };
    
    onSave(newOutline);
    toast({
      title: "Outline Saved",
      description: "Your changes have been saved successfully."
    });
  };

  // Calculate totals
  const totalWordCount = calculateTotalWordCount(editableOutline.rootNodes);
  const totalDuration = calculateTotalDuration(editableOutline.rootNodes);

  // Render a node and its children
  const renderNode = (node: OutlineNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isEditing = editingNode === node.id;
    const hasChildren = node.children.length > 0;
    
    // Get standard names for this node
    const nodeStandards = standards
      .filter(std => node.standardIds.includes(std.id))
      .map(std => std.id);
    
    return (
      <div 
        key={node.id}
        className="outline-node"
        draggable
        onDragStart={(e) => handleDragStart(node.id, e)}
        onDragOver={(e) => handleDragOver(node.id, e)}
        onDrop={(e) => handleDrop(node.id, e)}
      >
        <div 
          className={`flex items-start p-2 rounded-md mb-1 ${
            depth === 0 ? 'bg-muted' : 'bg-card border'
          } ${isEditing ? 'ring-2 ring-primary' : ''}`}
          style={{ marginLeft: `${depth * 1.5}rem` }}
        >
          <div className="mr-2 cursor-move">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="p-0 h-5 w-5 mr-1"
              onClick={(e) => toggleExpanded(node.id, e)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Input
                    value={node.title}
                    onChange={(e) => updateNode(node.id, 'title', e.target.value)}
                    className="font-medium mb-2"
                    placeholder="Node title"
                  />
                  <Textarea
                    value={node.description || ''}
                    onChange={(e) => updateNode(node.id, 'description', e.target.value)}
                    className="text-sm"
                    placeholder="Description"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Type</label>
                    <Select
                      value={node.type}
                      onValueChange={(value) => updateNode(node.id, 'type', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodeTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Difficulty</label>
                    <Select
                      value={node.difficultyLevel}
                      onValueChange={(value) => updateNode(node.id, 'difficultyLevel', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Taxonomy Level</label>
                    <Select
                      value={node.taxonomyLevel}
                      onValueChange={(value) => updateNode(node.id, 'taxonomyLevel', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxonomyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Word Count</label>
                    <Input
                      type="number"
                      value={node.estimatedWordCount}
                      onChange={(e) => updateNode(node.id, 'estimatedWordCount', parseInt(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Duration (min)</label>
                    <Input
                      type="number"
                      value={node.estimatedDuration}
                      onChange={(e) => updateNode(node.id, 'estimatedDuration', parseInt(e.target.value))}
                      className="h-8"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingNode(null)}
                  >
                    Done
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => addChildNode(node.id)}
                  >
                    Add Child
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {node.title}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {node.type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {node.estimatedWordCount}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {node.estimatedDuration}m
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => startEditing(node.id, e)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeNode(node.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {node.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {node.description}
                  </p>
                )}
                
                {nodeStandards.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nodeStandards.map(std => (
                      <Badge key={std} variant="secondary" className="text-xs">
                        {std}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Outline Editor</CardTitle>
          <CardDescription>
            Drag and drop nodes to structure your content
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-sm flex items-center mr-4">
            <div className="flex items-center mr-4">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{totalWordCount} words</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{totalDuration} mins</span>
            </div>
          </div>
          <Button variant="outline" onClick={addRootNode}>
            <Plus className="h-4 w-4 mr-1" /> Add Section
          </Button>
          <Button onClick={handleSave}>Save Outline</Button>
        </div>
      </CardHeader>
      <CardContent>
        {editableOutline.rootNodes.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No outline nodes yet. Click "Add Section" to get started or generate an outline.
            </p>
          </div>
        ) : (
          <div className="outline-editor">
            {editableOutline.rootNodes.map(node => renderNode(node))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OutlineEditor;
