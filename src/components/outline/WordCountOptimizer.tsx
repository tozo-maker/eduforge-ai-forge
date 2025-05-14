
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Outline, OutlineNode } from '@/types/outline';
import { toast } from '@/hooks/use-toast';

interface WordCountOptimizerProps {
  outline: Outline;
  onUpdateOutline: (outline: Outline) => void;
}

export function WordCountOptimizer({ outline, onUpdateOutline }: WordCountOptimizerProps) {
  const [nodeDistribution, setNodeDistribution] = useState<Array<{
    id: string;
    title: string;
    path: string;
    wordCount: number;
    adjustedWordCount: number;
    percentage: number;
    depth: number;
  }>>([]);
  
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [targetTotalWords, setTargetTotalWords] = useState(0);
  
  // Initialize distribution data
  useEffect(() => {
    const nodes: Array<{
      id: string;
      title: string;
      path: string;
      wordCount: number;
      adjustedWordCount: number;
      percentage: number;
      depth: number;
    }> = [];
    
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
        adjustedWordCount: node.estimatedWordCount, // Initially same as original
        percentage: 0, // Will calculate after traversal
        depth
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
      percentage: totalWordCount > 0 ? (node.wordCount / totalWordCount) * 100 : 0
    }));
    
    setNodeDistribution(resetDistribution);
    setTargetTotalWords(totalWordCount);
  };
  
  // Automatically balance word distribution
  const handleAutoBalance = () => {
    // Identify top-level nodes to balance
    const rootNodeIds = new Set(outline.rootNodes.map(node => node.id));
    
    // Find root nodes in the distribution
    const rootNodes = nodeDistribution.filter(node => rootNodeIds.has(node.id));
    
    if (rootNodes.length <= 1) {
      toast({
        description: "Need multiple root sections to balance content."
      });
      return;
    }
    
    // Calculate average word count for root nodes
    const avgWordCount = Math.round(rootNodes.reduce((sum, node) => sum + node.wordCount, 0) / rootNodes.length);
    
    // Create a balanced distribution
    const balancedDistribution = [...nodeDistribution];
    
    // Adjust root nodes toward the average
    balancedDistribution.forEach(node => {
      if (rootNodeIds.has(node.id)) {
        // Move 70% toward the average
        const diff = avgWordCount - node.wordCount;
        const adjustment = Math.round(diff * 0.7);
        node.adjustedWordCount = Math.max(50, node.wordCount + adjustment);
      }
    });
    
    // Recalculate total and percentages
    const newTotal = balancedDistribution.reduce((sum, node) => sum + node.adjustedWordCount, 0);
    setTargetTotalWords(newTotal);
    
    balancedDistribution.forEach(node => {
      node.percentage = newTotal > 0 ? (node.adjustedWordCount / newTotal) * 100 : 0;
    });
    
    setNodeDistribution(balancedDistribution);
    
    toast({
      description: "Word counts balanced across root sections."
    });
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
            <Button variant="outline" size="sm" onClick={handleAutoBalance}>
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              Auto Balance
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
          <div>Target: <strong>{targetTotalWords}</strong> words</div>
          <div>Difference: <strong>{targetTotalWords - totalWordCount}</strong> words</div>
        </div>
        
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {nodeDistribution.map((node, index) => (
            <div 
              key={node.id} 
              className="space-y-1.5"
              style={{ paddingLeft: `${node.depth * 16}px` }}
            >
              <div className="flex justify-between text-sm">
                <div className="font-medium truncate max-w-xs">{node.title}</div>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WordCountOptimizer;
