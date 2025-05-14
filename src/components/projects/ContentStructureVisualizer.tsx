
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ChevronDown, ChevronRight, GitBranch, GitFork, Grid2X2, Circle, LayoutGrid, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OutlineNode } from '@/types/outline';

type StructureType = 'sequential' | 'hierarchical' | 'modular' | 'spiral';

interface ContentStructureVisualizerProps {
  selectedStructure: StructureType;
  onStructureChange: (structure: StructureType) => void;
  outlineNodes?: OutlineNode[]; // Integration with outline data
  onVisualizeOutline?: (structure: StructureType) => OutlineNode[]; // Callback to generate outline preview
}

export function ContentStructureVisualizer({ 
  selectedStructure, 
  onStructureChange,
  outlineNodes,
  onVisualizeOutline
}: ContentStructureVisualizerProps) {
  const [previewNodes, setPreviewNodes] = useState<OutlineNode[]>([]);
  
  // Generate preview nodes when structure changes
  useEffect(() => {
    if (onVisualizeOutline) {
      setPreviewNodes(onVisualizeOutline(selectedStructure));
    }
  }, [selectedStructure, onVisualizeOutline]);

  // Function to determine optimal structure based on content
  const getStructureRecommendation = (): StructureType => {
    // In a real implementation, this would analyze the project config
    // and recommend the ideal structure
    return 'sequential';
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Structure Visualizer</CardTitle>
            <CardDescription>
              Choose how your content will be organized and presented to learners
            </CardDescription>
          </div>
          {onVisualizeOutline && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="flex items-center space-x-1 text-xs p-1.5 rounded bg-secondary/50 hover:bg-secondary/70"
                    onClick={() => onStructureChange(getStructureRecommendation())}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Recommend Structure</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Analyze content and suggest the optimal structure</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue={selectedStructure} 
          value={selectedStructure}
          onValueChange={(value) => onStructureChange(value as StructureType)}
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="sequential" className="flex flex-col items-center gap-2 py-3">
              <ArrowRight className="h-5 w-5" />
              <span>Sequential</span>
            </TabsTrigger>
            <TabsTrigger value="hierarchical" className="flex flex-col items-center gap-2 py-3">
              <GitFork className="h-5 w-5" />
              <span>Hierarchical</span>
            </TabsTrigger>
            <TabsTrigger value="modular" className="flex flex-col items-center gap-2 py-3">
              <Grid2X2 className="h-5 w-5" />
              <span>Modular</span>
            </TabsTrigger>
            <TabsTrigger value="spiral" className="flex flex-col items-center gap-2 py-3">
              <Circle className="h-5 w-5" />
              <span>Spiral</span>
            </TabsTrigger>
          </TabsList>

          <div className="border rounded-lg p-4 bg-muted/20">
            {/* Sequential Structure */}
            <TabsContent value="sequential" className="mt-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-medium">Sequential Learning Path</h3>
                <p className="text-muted-foreground">
                  Content is arranged in a linear progression, where each concept builds on the previous one.
                  Ideal for step-by-step instruction and progressive skill development.
                </p>
                <div className="flex items-center justify-center gap-3 py-6">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="font-semibold">Step {step}</span>
                      </div>
                      {step < 4 && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
                    </React.Fragment>
                  ))}
                </div>
                {outlineNodes && outlineNodes.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                    <div className="flex flex-col space-y-2 overflow-x-auto max-h-40">
                      {outlineNodes.map((node, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{index + 1}.</span>
                          <span className="text-sm truncate">{node.title}</span>
                          {index < outlineNodes.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Hierarchical Structure */}
            <TabsContent value="hierarchical" className="mt-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-medium">Hierarchical Structure</h3>
                <p className="text-muted-foreground">
                  Content is organized in a tree-like structure with main concepts branching into sub-concepts.
                  Perfect for complex topics with clear categorizations.
                </p>
                <div className="flex justify-center py-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-16 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                      <span className="font-semibold">Main Concept</span>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      {[1, 2, 3].map((branch) => (
                        <div key={branch} className="flex flex-col items-center">
                          <div className="h-8 w-[2px] bg-muted-foreground/40"></div>
                          <div className="w-20 h-14 rounded-lg bg-secondary/20 flex items-center justify-center border border-secondary/30 text-sm">
                            <span className="font-medium">Branch {branch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {outlineNodes && outlineNodes.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                    <div className="flex justify-center">
                      <HierarchicalPreview nodes={outlineNodes} />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Modular Structure */}
            <TabsContent value="modular" className="mt-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-medium">Modular Organization</h3>
                <p className="text-muted-foreground">
                  Self-contained units that can be arranged in flexible sequences.
                  Great for personalized learning paths and different learning styles.
                </p>
                <div className="grid grid-cols-3 gap-3 py-6">
                  {[1, 2, 3, 4, 5, 6].map((module) => (
                    <div key={module} className="aspect-square rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors">
                      <span className="font-medium">Module {module}</span>
                    </div>
                  ))}
                </div>
                {outlineNodes && outlineNodes.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {outlineNodes.slice(0, 6).map((node, index) => (
                        <div key={index} className="p-2 border rounded-md text-xs hover:bg-muted/50 cursor-pointer">
                          <div className="font-medium truncate">{node.title}</div>
                          <div className="text-muted-foreground truncate">{node.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Spiral Structure */}
            <TabsContent value="spiral" className="mt-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-medium">Spiral Curriculum</h3>
                <p className="text-muted-foreground">
                  Topics are revisited repeatedly with increasing complexity over time.
                  Ideal for reinforcing key concepts and deepening understanding.
                </p>
                <div className="flex justify-center py-6">
                  <div className="relative w-56 h-56">
                    {[0, 1, 2, 3].map((circle) => {
                      const size = 100 - circle * 20;
                      return (
                        <div 
                          key={circle}
                          className={`absolute rounded-full border border-primary/30 flex items-center justify-center`}
                          style={{
                            width: `${size}%`,
                            height: `${size}%`,
                            top: `${(100 - size) / 2}%`,
                            left: `${(100 - size) / 2}%`,
                            backgroundColor: `rgba(79, 70, 229, ${0.05 + circle * 0.05})`,
                            transform: `rotate(${circle * 45}deg)`
                          }}
                        >
                          {circle > 0 && 
                            <span className="font-medium text-center" style={{transform: `rotate(-${circle * 45}deg)`}}>
                              Level {4 - circle}
                            </span>
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
                {outlineNodes && outlineNodes.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                    <div className="flex flex-col space-y-4">
                      {Array.from({ length: Math.min(3, Math.ceil(outlineNodes.length / 2)) }).map((_, level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <span className="text-xs font-medium whitespace-nowrap">Level {level + 1}:</span>
                          <div className="flex items-center space-x-2 overflow-x-auto">
                            {outlineNodes.slice(level * 2, level * 2 + 2).map((node, idx) => (
                              <span key={idx} className="text-xs bg-muted/50 p-1 rounded whitespace-nowrap">
                                {node.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper component for hierarchical preview
function HierarchicalPreview({ nodes }: { nodes: OutlineNode[] }) {
  if (!nodes.length) return null;
  
  const rootNode = nodes[0];
  const childrenNodes = nodes.slice(1, 4); // Show up to 3 children for preview
  
  return (
    <div className="flex flex-col items-center">
      <div className="p-2 border rounded-md bg-primary/10 mb-4 text-xs font-medium">
        {rootNode.title}
      </div>
      {childrenNodes.length > 0 && (
        <>
          <div className="h-4 w-[2px] bg-muted-foreground/40"></div>
          <div className="flex space-x-6">
            {childrenNodes.map((child, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="h-4 w-[2px] bg-muted-foreground/40"></div>
                <div className="p-2 border rounded-md bg-secondary/10 text-xs max-w-24 truncate">
                  {child.title}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ContentStructureVisualizer;
