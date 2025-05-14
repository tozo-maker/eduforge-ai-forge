
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ChevronDown, ChevronRight, GitBranch, GitFork, Grid2X2, Circle, LayoutGrid } from "lucide-react";

type StructureType = 'sequential' | 'hierarchical' | 'modular' | 'spiral';

interface ContentStructureVisualizerProps {
  selectedStructure: StructureType;
  onStructureChange: (structure: StructureType) => void;
}

export function ContentStructureVisualizer({ 
  selectedStructure, 
  onStructureChange 
}: ContentStructureVisualizerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Structure Visualizer</CardTitle>
        <CardDescription>
          Choose how your content will be organized and presented to learners
        </CardDescription>
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
              </div>
            </TabsContent>

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
              </div>
            </TabsContent>

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
              </div>
            </TabsContent>

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
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ContentStructureVisualizer;
