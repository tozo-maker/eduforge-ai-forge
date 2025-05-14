
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { BarChart3, RefreshCw, PieChart, BarChart, Scale, Lightbulb } from 'lucide-react';
import { Outline, OutlineNode } from '@/types/outline';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WordCountOptimizerProps {
  outline: Outline;
  onUpdateOutline: (outline: Outline) => void;
}

interface NodeDistribution {
  id: string;
  title: string;
  path: string;
  wordCount: number;
  adjustedWordCount: number;
  percentage: number;
  depth: number;
  type: string;
  recommendedWordCount?: number;
}

export function WordCountOptimizer({ outline, onUpdateOutline }: WordCountOptimizerProps) {
  const [nodeDistribution, setNodeDistribution] = useState<NodeDistribution[]>([]);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [targetTotalWords, setTargetTotalWords] = useState(0);
  const [optimizationStrategy, setOptimizationStrategy] = useState<
    'balance' | 'relative-depth' | 'type-based' | 'custom'
  >('balance');
  const [chartView, setChartView] = useState<'list' | 'chart'>('list');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize distribution data
  useEffect(() => {
    const nodes: NodeDistribution[] = [];
    
    let totalWords = 0;
    
    // Traverse the outline and collect word count data
    const traverseNodes = (node: OutlineNode, path: string = '', depth: number = 0) => {
      const nodePath = path ? `${path} > ${node.title}` : node.title;
      
      totalWords += node.estimatedWordCount;
      
      nodes.push({
        id: node.id,
        title: node.title,
        path: nodePath,
        wordCount: node.estimatedWordCount,
        adjustedWordCount: node.estimatedWordCount,
        percentage: 0,
        depth,
        type: node.type
      });
      
      node.children.forEach(child => traverseNodes(child, nodePath, depth + 1));
    };
    
    outline.rootNodes.forEach(root => traverseNodes(root));
    
    // Calculate percentages
    nodes.forEach(node => {
      node.percentage = totalWords > 0 ? (node.wordCount / totalWords) * 100 : 0;
    });
    
    setTotalWordCount(totalWords);
    setTargetTotalWords(totalWords);
    setNodeDistribution(nodes);
  }, [outline]);
  
  // Update the chart visualization when distribution changes
  useEffect(() => {
    if (chartView === 'chart' && canvasRef.current) {
      renderChart();
    }
  }, [nodeDistribution, chartView]);
  
  // Simple chart rendering function
  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only visualize top-level nodes
    const rootNodes = nodeDistribution.filter(node => node.depth === 0);
    
    // Set up chart dimensions
    const chartHeight = canvas.height - 40;
    const barWidth = canvas.width / (rootNodes.length * 3);
    const gapWidth = barWidth / 2;
    
    // Draw bars for each root node
    rootNodes.forEach((node, index) => {
      const x = index * (barWidth * 3) + barWidth;
      
      // Original word count
      const originalHeight = (node.wordCount / Math.max(...rootNodes.map(n => n.wordCount))) * chartHeight;
      ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
      ctx.fillRect(x, canvas.height - originalHeight, barWidth, originalHeight);
      
      // Adjusted word count
      const adjustedHeight = (node.adjustedWordCount / Math.max(...rootNodes.map(n => Math.max(n.adjustedWordCount, n.wordCount)))) * chartHeight;
      ctx.fillStyle = node.adjustedWordCount > node.wordCount ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
      ctx.fillRect(x + barWidth + gapWidth, canvas.height - adjustedHeight, barWidth, adjustedHeight);
      
      // Draw node title
      ctx.fillStyle = 'black';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        node.title.substring(0, 15) + (node.title.length > 15 ? '...' : ''), 
        x + barWidth, 
        canvas.height - 5
      );
    });
    
    // Draw legend
    ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.fillRect(10, 10, 15, 15);
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText('Original', 30, 20);
    
    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.fillRect(100, 10, 15, 15);
    ctx.fillStyle = 'black';
    ctx.fillText('Adjusted', 120, 20);
  };
  
  // Handle slider change for a specific node
  const handleSliderChange = (index: number, value: number[]) => {
    const updatedDistribution = [...nodeDistribution];
    updatedDistribution[index].adjustedWordCount = value[0];
    
    // Recalculate total word count
    const newTotal = updatedDistribution.reduce((sum, node) => sum + node.adjustedWordCount, 0);
    setTargetTotalWords(newTotal);
    
    // Update all percentages
    updatedDistribution.forEach(node => {
      node.percentage = newTotal > 0 ? (node.adjustedWordCount / newTotal) * 100 : 0;
    });
    
    setNodeDistribution(updatedDistribution);
  };
  
  // Apply changes to the outline
  const handleApplyChanges = () => {
    // Create a copy of the outline for modification
    const updatedOutline = JSON.parse(JSON.stringify(outline)) as Outline;
    
    // Helper to update word count of a specific node
    const updateNodeWordCount = (nodes: OutlineNode[], nodeId: string, newWordCount: number): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          // Calculate duration adjustment proportional to word count change
          const wordCountRatio = newWordCount / nodes[i].estimatedWordCount;
          const newDuration = Math.max(1, Math.round(nodes[i].estimatedDuration * wordCountRatio));
          
          // Update node
          nodes[i].estimatedWordCount = newWordCount;
          nodes[i].estimatedDuration = newDuration;
          return true;
        }
        if (nodes[i].children.length > 0 && updateNodeWordCount(nodes[i].children, nodeId, newWordCount)) {
          return true;
        }
      }
      return false;
    };
    
    // Update each node that has changed
    let changedNodes = 0;
    nodeDistribution.forEach(node => {
      if (node.wordCount !== node.adjustedWordCount) {
        if (updateNodeWordCount(updatedOutline.rootNodes, node.id, node.adjustedWordCount)) {
          changedNodes++;
        }
      }
    });
    
    if (changedNodes > 0) {
      onUpdateOutline(updatedOutline);
      toast({
        title: "Word count optimized",
        description: `Updated ${changedNodes} nodes for better content distribution.`
      });
    } else {
      toast({
        description: "No changes to apply. Adjust word counts first."
      });
    }
  };
  
  // Reset adjustments to original values
  const handleResetChanges = () => {
    const resetDistribution = nodeDistribution.map(node => ({
      ...node,
      adjustedWordCount: node.wordCount,
      recommendedWordCount: undefined,
      percentage: totalWordCount > 0 ? (node.wordCount / totalWordCount) * 100 : 0
    }));
    
    setNodeDistribution(resetDistribution);
    setTargetTotalWords(totalWordCount);
  };
  
  // Calculate recommended word counts based on different optimization strategies
  const calculateRecommendedCounts = (strategy: 'balance' | 'relative-depth' | 'type-based' | 'custom') => {
    const updatedDistribution = [...nodeDistribution];
    let changedNodes = 0;
    
    switch(strategy) {
      case 'balance': {
        // Identify top-level nodes to balance
        const rootNodes = updatedDistribution.filter(node => node.depth === 0);
        
        if (rootNodes.length <= 1) {
          toast({
            description: "Need multiple root sections to balance content."
          });
          return;
        }
        
        // Calculate average word count for root nodes
        const avgWordCount = Math.round(rootNodes.reduce((sum, node) => sum + node.wordCount, 0) / rootNodes.length);
        
        // Adjust root nodes toward the average
        updatedDistribution.forEach(node => {
          if (node.depth === 0) {
            // Move 70% toward the average
            const diff = avgWordCount - node.wordCount;
            const adjustment = Math.round(diff * 0.7);
            node.recommendedWordCount = Math.max(50, node.wordCount + adjustment);
            node.adjustedWordCount = node.recommendedWordCount;
            changedNodes++;
          }
        });
        
        toast({
          description: "Word counts balanced across root sections."
        });
        break;
      }
      
      case 'relative-depth': {
        // Allocate more words to deeper nodes to create detailed subsections
        // and fewer words to higher-level nodes for more concise section summaries
        const maxDepth = Math.max(...updatedDistribution.map(node => node.depth));
        const baseWordCount = totalWordCount / updatedDistribution.length;
        
        updatedDistribution.forEach(node => {
          // More detailed as depth increases (reversed from what you might expect)
          const depthFactor = node.depth === 0 ? 0.7 : (1 + (node.depth / maxDepth) * 0.5);
          node.recommendedWordCount = Math.max(50, Math.round(node.wordCount * depthFactor));
          node.adjustedWordCount = node.recommendedWordCount;
          changedNodes++;
        });
        
        toast({
          description: "Word counts optimized based on node depth."
        });
        break;
      }
      
      case 'type-based': {
        // Different node types get different word count targets
        updatedDistribution.forEach(node => {
          let typeFactor = 1.0;
          
          switch(node.type) {
            case 'section':
              typeFactor = 0.8; // Sections are concise summaries
              break;
            case 'subsection':
              typeFactor = 1.0; // Subsections are normal length
              break;
            case 'topic':
              typeFactor = 1.2; // Topics get more detail
              break;
            case 'activity':
              typeFactor = 1.5; // Activities need detailed instructions
              break;
            case 'assessment':
              typeFactor = 1.3; // Assessments need detailed questions
              break;
            default:
              typeFactor = 1.0;
          }
          
          node.recommendedWordCount = Math.max(50, Math.round(node.wordCount * typeFactor));
          node.adjustedWordCount = node.recommendedWordCount;
          changedNodes++;
        });
        
        toast({
          description: "Word counts optimized based on content type."
        });
        break;
      }
      
      case 'custom':
        // This is handled through direct slider adjustments
        return;
    }
    
    // Recalculate total and percentages
    const newTotal = updatedDistribution.reduce((sum, node) => sum + node.adjustedWordCount, 0);
    setTargetTotalWords(newTotal);
    
    updatedDistribution.forEach(node => {
      node.percentage = newTotal > 0 ? (node.adjustedWordCount / newTotal) * 100 : 0;
    });
    
    setNodeDistribution(updatedDistribution);
    setOptimizationStrategy(strategy);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Word Count Distribution Optimizer</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleResetChanges}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button 
              variant={optimizationStrategy === 'balance' ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => calculateRecommendedCounts('balance')}
              title="Balance word counts across top-level sections"
            >
              <Scale className="h-3.5 w-3.5 mr-1" />
              Balance
            </Button>
            <Button 
              variant={optimizationStrategy === 'relative-depth' ? "secondary" : "outline"}
              size="sm" 
              onClick={() => calculateRecommendedCounts('relative-depth')}
              title="Allocate words based on node depth in the hierarchy"
            >
              <BarChart className="h-3.5 w-3.5 mr-1" />
              By Depth
            </Button>
            <Button 
              variant={optimizationStrategy === 'type-based' ? "secondary" : "outline"}
              size="sm" 
              onClick={() => calculateRecommendedCounts('type-based')}
              title="Optimize based on node type (section, topic, activity, etc)"
            >
              <Lightbulb className="h-3.5 w-3.5 mr-1" />
              By Type
            </Button>
            <Button size="sm" onClick={handleApplyChanges}>
              Apply Changes
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between mb-4 text-sm">
          <div>Original: <strong>{totalWordCount}</strong> words</div>
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2" 
              onClick={() => setChartView(chartView === 'list' ? 'chart' : 'list')}
            >
              {chartView === 'list' ? (
                <><BarChart3 className="h-3.5 w-3.5 mr-1" /> Show Chart</>
              ) : (
                <><BarChart3 className="h-3.5 w-3.5 mr-1" /> Show List</>
              )}
            </Button>
          </div>
          <div>Target: <strong>{targetTotalWords}</strong> words</div>
          <div>Difference: <strong className={cn(
            targetTotalWords > totalWordCount ? "text-green-500" : 
            targetTotalWords < totalWordCount ? "text-amber-500" : ""
          )}>
            {targetTotalWords > totalWordCount ? "+" : ""}
            {targetTotalWords - totalWordCount}
          </strong> words</div>
        </div>
        
        {chartView === 'chart' ? (
          <div className="flex justify-center mb-4">
            <canvas ref={canvasRef} width="600" height="300" className="border rounded" />
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {nodeDistribution.map((node, index) => (
              <div 
                key={node.id} 
                className="space-y-1.5"
                style={{ paddingLeft: `${node.depth * 16}px` }}
              >
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{node.type}</Badge>
                    <div className="font-medium truncate max-w-xs">{node.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{node.adjustedWordCount} words</span>
                    <span className={`${
                      Math.abs(node.adjustedWordCount - node.wordCount) > 0 ? 
                        node.adjustedWordCount > node.wordCount ? 'text-green-500' : 'text-amber-500' : 
                        'text-muted-foreground'
                    }`}>
                      {node.adjustedWordCount !== node.wordCount ? 
                        (node.adjustedWordCount > node.wordCount ? '+' : '') + 
                        (node.adjustedWordCount - node.wordCount) : 
                        ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Slider
                    defaultValue={[node.wordCount]}
                    value={[node.adjustedWordCount]}
                    max={Math.max(2000, node.wordCount * 2)}
                    min={Math.max(10, Math.floor(node.wordCount * 0.5))}
                    step={10}
                    className="flex-1"
                    onValueChange={(value) => handleSliderChange(index, value)}
                  />
                  <Progress value={node.percentage} className="w-20 h-1.5" />
                  <div className="text-xs w-12 text-right">{Math.round(node.percentage)}%</div>
                </div>
                {node.recommendedWordCount && node.recommendedWordCount !== node.wordCount && (
                  <div className="text-xs text-blue-600 flex items-center">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Recommendation: {node.recommendedWordCount} words
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WordCountOptimizer;
