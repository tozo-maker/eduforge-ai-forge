import React, { useState, useRef, useEffect } from 'react';
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
  AlertCircle, 
  Link,
  BarChart3,
  Save
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
import { validateOutlineCoherence } from '@/services/outlineValidation';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GapAnalysisDrawer } from '@/components/outline/GapAnalysisDrawer';
import { ReferenceIntegrator } from '@/components/outline/ReferenceIntegrator';
import { StandardsVerifier } from '@/components/outline/StandardsVerifier';
import { WordCountOptimizer } from '@/components/outline/WordCountOptimizer';
import { OutlineRelationshipVisualizer } from '@/components/outline/OutlineRelationshipVisualizer';
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label";

interface OutlineEditorProps {
  outline: Outline;
  standards?: EducationalStandard[];
  onSave: (outline: Outline) => void;
}

export function OutlineEditor({ outline, standards = [], onSave }: OutlineEditorProps) {
  const [editableOutline, setEditableOutline] = useState<Outline>({...outline});
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dragOverNodeType, setDragOverNodeType] = useState<'before' | 'inside' | 'after' | null>(null);
  const [showDragGuides, setShowDragGuides] = useState(true);
  const [showRelationships, setShowRelationships] = useState<boolean>(false);
  const [showGapAnalysis, setShowGapAnalysis] = useState<boolean>(false);
  const [showWordOptimizer, setShowWordOptimizer] = useState<boolean>(false);
  const [showStandardsVerifier, setShowStandardsVerifier] = useState<boolean>(false);
  const [showReferenceIntegrator, setShowReferenceIntegrator] = useState<boolean>(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const dragNodeRef = useRef<OutlineNode | null>(null);

  // Validate outline structural coherence whenever the outline changes
  useEffect(() => {
    const issues = validateOutlineCoherence(editableOutline);
    setValidationIssues(issues);
  }, [editableOutline]);

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

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, nodeId: string, node: OutlineNode) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", nodeId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingNodeId(nodeId);
    dragNodeRef.current = node;
    
    // Delay adding dragging class to avoid flickering
    setTimeout(() => {
      const element = document.getElementById(`node-${nodeId}`);
      if (element) element.classList.add("dragging");
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggingNodeId) {
      const element = document.getElementById(`node-${draggingNodeId}`);
      if (element) element.classList.remove("dragging");
      setDraggingNodeId(null);
    }
    
    setDropTargetId(null);
    setDragOverNodeType(null);
    dragNodeRef.current = null;
    
    // Remove all drop target indicators
    document.querySelectorAll('.drop-target, .drop-before, .drop-after, .drop-inside').forEach((el) => {
      el.classList.remove('drop-target', 'drop-before', 'drop-after', 'drop-inside');
    });
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, nodeId: string, node: OutlineNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showDragGuides) return;
    if (draggingNodeId === nodeId) return; // Can't drop onto self
    
    // Don't allow drop if node is a child of the dragged node (would create a circular reference)
    if (isChildOf(node, draggingNodeId)) return;
    
    e.dataTransfer.dropEffect = "move";
    setDropTargetId(nodeId);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    const element = document.getElementById(`node-${nodeId}`);
    if (!element) return;
    
    // Clean previous indicators
    document.querySelectorAll('.drop-target, .drop-before, .drop-after, .drop-inside').forEach((el) => {
      if (el.id !== `node-${nodeId}`) {
        el.classList.remove('drop-target', 'drop-before', 'drop-after', 'drop-inside');
      }
    });
    
    // Determine drop position
    if (y < height * 0.25) {
      // Drop before
      element.classList.add('drop-before');
      element.classList.remove('drop-after', 'drop-inside');
      setDragOverNodeType('before');
    } else if (y > height * 0.75) {
      // Drop after
      element.classList.add('drop-after');
      element.classList.remove('drop-before', 'drop-inside');
      setDragOverNodeType('after');
    } else {
      // Drop inside
      element.classList.add('drop-inside');
      element.classList.remove('drop-before', 'drop-after');
      setDragOverNodeType('inside');
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = document.getElementById(`node-${nodeId}`);
    if (element) {
      element.classList.remove('drop-before', 'drop-after', 'drop-inside');
    }
    
    if (dropTargetId === nodeId) {
      setDropTargetId(null);
      setDragOverNodeType(null);
    }
  };
  
  // Check if a node is a child of another node
  const isChildOf = (node: OutlineNode, potentialParentId: string): boolean => {
    if (node.id === potentialParentId) return true;
    return node.children.some(child => isChildOf(child, potentialParentId));
  };
  
  // Find a node by ID in the outline
  const findNodeById = (nodes: OutlineNode[], nodeId: string): OutlineNode | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
    return null;
  };
  
  // Find the parent node of a given node ID
  const findParentNode = (nodes: OutlineNode[], nodeId: string, parent: OutlineNode | null = null): OutlineNode | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return parent;
      
      const found = findParentNode(node.children, nodeId, node);
      if (found) return found;
    }
    return null;
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId || !dragOverNodeType) return;
    
    // Clean visual indicators
    document.querySelectorAll('.dragging, .drop-before, .drop-after, .drop-inside, .drop-target').forEach((el) => {
      el.classList.remove('dragging', 'drop-before', 'drop-after', 'drop-inside', 'drop-target');
    });
    
    // Clone the current outline structure
    const updatedOutline = JSON.parse(JSON.stringify(editableOutline)) as Outline;
    
    // Find the source node and target node
    const sourceNode = findNodeById(updatedOutline.rootNodes, sourceId);
    const targetNode = findNodeById(updatedOutline.rootNodes, targetId);
    
    if (!sourceNode || !targetNode) {
      console.error("Source or target node not found", sourceId, targetId);
      return;
    }
    
    // Find the parent of the source node
    const sourceParent = findParentNode(updatedOutline.rootNodes, sourceId);
    
    // Remove the source node from its current position
    if (sourceParent) {
      sourceParent.children = sourceParent.children.filter(child => child.id !== sourceId);
    } else {
      // It's a root node
      updatedOutline.rootNodes = updatedOutline.rootNodes.filter(node => node.id !== sourceId);
    }
    
    // Place the node in the new position based on dragOverNodeType
    switch (dragOverNodeType) {
      case 'inside':
        // Add as child of target node
        targetNode.children.push(sourceNode);
        setExpandedNodes(prev => new Set([...prev, targetId])); // Expand the target node
        break;
        
      case 'before':
      case 'after': {
        const targetParent = findParentNode(updatedOutline.rootNodes, targetId);
        
        if (targetParent) {
          // Find the index of the target in its parent's children
          const targetIndex = targetParent.children.findIndex(child => child.id === targetId);
          
          // Insert before or after
          const insertIndex = dragOverNodeType === 'before' ? targetIndex : targetIndex + 1;
          targetParent.children.splice(insertIndex, 0, sourceNode);
        } else {
          // Target is a root node
          const targetIndex = updatedOutline.rootNodes.findIndex(node => node.id === targetId);
          const insertIndex = dragOverNodeType === 'before' ? targetIndex : targetIndex + 1;
          updatedOutline.rootNodes.splice(insertIndex, 0, sourceNode);
        }
        break;
      }
    }
    
    // Validate the new structure before saving
    const issues = validateOutlineCoherence(updatedOutline);
    
    if (issues.filter(issue => issue.includes('circular')).length > 0) {
      toast({
        title: "Invalid Operation",
        description: "This move would create a circular reference in the outline structure.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the outline structure
    setEditableOutline({
      ...updatedOutline,
      updatedAt: new Date()
    });
    
    setDraggingNodeId(null);
    setDropTargetId(null);
    setDragOverNodeType(null);
    
    // Show success toast
    toast({
      title: "Node Moved",
      description: "Outline structure has been updated."
    });
  };

  // Handle save
  const handleSave = () => {
    const issues = validateOutlineCoherence(editableOutline);
    
    if (issues.length > 0) {
      toast({
        title: "Validation Issues",
        description: `Please fix ${issues.length} structural issues before saving.`,
        variant: "destructive"
      });
      return;
    }
    
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
  
  // Check if the outline covers all standards
  const standardsCoverage = standards.filter(std => {
    // Check if standard is used in any node
    let found = false;
    const checkNode = (node: OutlineNode) => {
      if (node.standardIds.includes(std.id)) {
        found = true;
        return true;
      }
      for (const child of node.children) {
        if (checkNode(child)) return true;
      }
      return false;
    };
    
    editableOutline.rootNodes.some(checkNode);
    return found;
  }).length;
  
  const standardsPercentage = standards.length > 0 ? 
    Math.round((standardsCoverage / standards.length) * 100) : 100;

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
        id={`node-${node.id}`}
        key={node.id}
        className={`outline-node relative mb-2 ${draggingNodeId === node.id ? 'opacity-50' : ''}`}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, node.id, node)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, node.id, node)}
        onDragLeave={(e) => handleDragLeave(e, node.id)}
        onDrop={(e) => handleDrop(e, node.id)}
      >
        <div 
          className={`flex items-start p-2 rounded-md mb-1 transition-all ${
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
                  
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium">Standards</label>
                    <Select
                      value={node.standardIds[0] || ""}
                      onValueChange={(value) => updateNode(node.id, 'standardIds', [value])}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        {standards.map(standard => (
                          <SelectItem key={standard.id} value={standard.id}>
                            {standard.id}: {standard.description?.substring(0, 30)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
    <div className="space-y-4">
      {validationIssues.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 mb-4">
          <h4 className="text-destructive font-medium mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Structure Validation Issues ({validationIssues.length})
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {validationIssues.map((issue, index) => (
              <li key={index} className="text-sm">{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
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
              <div className="flex items-center mr-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>{totalDuration} mins</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <span className="text-xs mr-1">Standards:</span>
                      <Progress value={standardsPercentage} className="w-20 h-2" />
                      <span className="text-xs ml-1">{standardsPercentage}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{standardsCoverage} of {standards.length} standards covered</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={addRootNode} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Button>
              
              <Button
                variant={showRelationships ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowRelationships(!showRelationships)}
              >
                <Link className="h-4 w-4 mr-1" /> Relationships
              </Button>
              
              <Button
                variant={showGapAnalysis ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowGapAnalysis(!showGapAnalysis)}
              >
                <BarChart3 className="h-4 w-4 mr-1" /> Gap Analysis
              </Button>
              
              <Button variant="default" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={showWordOptimizer ? "secondary" : "outline"}
                onClick={() => setShowWordOptimizer(!showWordOptimizer)}
              >
                Word Count Optimizer
              </Button>
              
              <Button 
                size="sm" 
                variant={showStandardsVerifier ? "secondary" : "outline"}
                onClick={() => setShowStandardsVerifier(!showStandardsVerifier)}
              >
                Standards Verification
              </Button>
              
              <Button 
                size="sm" 
                variant={showReferenceIntegrator ? "secondary" : "outline"}
                onClick={() => setShowReferenceIntegrator(!showReferenceIntegrator)}
              >
                Reference Integration
              </Button>
              
              <div className="ml-auto flex items-center space-x-2">
                <Label htmlFor="dragdrop-hint" className="text-xs text-muted-foreground">Show drag-drop hints</Label>
                <Switch 
                  id="dragdrop-hint" 
                  checked={showDragGuides}
                  onCheckedChange={setShowDragGuides}
                />
              </div>
            </div>
            
            {showWordOptimizer && (
              <WordCountOptimizer 
                outline={editableOutline}
                onUpdateOutline={setEditableOutline}
              />
            )}
            
            {showStandardsVerifier && (
              <StandardsVerifier 
                outline={editableOutline}
                standards={standards}
                onUpdateOutline={setEditableOutline}
              />
            )}
            
            {showReferenceIntegrator && (
              <ReferenceIntegrator 
                outline={editableOutline}
                onUpdateOutline={setEditableOutline}
              />
            )}
            
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
          </div>
        </CardContent>
      </Card>
      
      {showRelationships && (
        <OutlineRelationshipVisualizer 
          outline={editableOutline} 
          onUpdateOutline={setEditableOutline} 
        />
      )}
      
      <GapAnalysisDrawer 
        open={showGapAnalysis} 
        onOpenChange={setShowGapAnalysis}
        outline={editableOutline}
        standards={standards}
        onUpdateOutline={setEditableOutline}
      />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .outline-node.dragging {
          opacity: 0.5;
        }
        .outline-node .drop-target {
          background-color: rgba(59, 130, 246, 0.1);
          border: 2px dashed #3b82f6;
        }
        .outline-node.drop-before {
          border-top: 2px solid #3b82f6;
        }
        .outline-node.drop-after {
          border-bottom: 2px solid #3b82f6;
        }
        .outline-node.drop-inside {
          background-color: rgba(59, 130, 246, 0.1);
        }
      `}} />
    </div>
  );
}

export default OutlineEditor;
