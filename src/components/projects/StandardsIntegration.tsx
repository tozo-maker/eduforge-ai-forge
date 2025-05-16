
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, X, Plus, Upload } from "lucide-react";
import { EducationalStandard } from '@/types/project';
import { standardsDatabase } from '@/data/standardsDatabase';
import { claudeService } from '@/services/claudeService';
import { toast } from '@/hooks/use-toast';

interface StandardsIntegrationProps {
  selectedStandards: EducationalStandard[];
  onStandardsChange: (standards: EducationalStandard[]) => void;
}

export function StandardsIntegration({ selectedStandards, onStandardsChange }: StandardsIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EducationalStandard[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showCustomStandardModal, setShowCustomStandardModal] = useState(false);
  const [customStandardId, setCustomStandardId] = useState('');
  const [customStandardDescription, setCustomStandardDescription] = useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = standardsDatabase.filter(standard => {
      if (
        activeFilter && 
        standard.organization !== activeFilter && 
        standard.category !== activeFilter
      ) {
        return false;
      }
      
      return (
        standard.id.toLowerCase().includes(query) || 
        standard.description.toLowerCase().includes(query)
      );
    }).slice(0, 10); // Limit results
    
    setSearchResults(results);
  };

  const handleAddStandard = (standard: EducationalStandard) => {
    // Check if the standard is already selected
    if (!selectedStandards.some(s => s.id === standard.id)) {
      onStandardsChange([...selectedStandards, standard]);
      
      // Show success notification
      toast({
        title: "Standard Added",
        description: `Added standard: ${standard.id}`,
      });
    }
    // Clear search results after adding
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveStandard = (standardId: string) => {
    onStandardsChange(selectedStandards.filter(s => s.id !== standardId));
    
    // Show notification
    toast({
      title: "Standard Removed",
      description: `Removed standard: ${standardId}`,
    });
  };

  const handleAddCustomStandard = () => {
    if (!customStandardId.trim()) {
      toast({
        title: "Error",
        description: "Standard ID is required",
        variant: "destructive",
      });
      return;
    }

    const newStandard: EducationalStandard = {
      id: customStandardId,
      description: customStandardDescription || `Custom standard: ${customStandardId}`,
      organization: 'Custom',
      category: 'Custom'
    };

    // Add to selected standards
    onStandardsChange([...selectedStandards, newStandard]);
    
    // Reset form and close modal
    setCustomStandardId('');
    setCustomStandardDescription('');
    setShowCustomStandardModal(false);
    
    // Show success notification
    toast({
      title: "Custom Standard Added",
      description: `Added custom standard: ${newStandard.id}`,
    });
  };

  const filterOptions = [
    { name: 'Common Core', type: 'organization' },
    { name: 'NGSS', type: 'organization' },
    { name: 'Math', type: 'category' },
    { name: 'ELA', type: 'category' },
    { name: 'Science', type: 'category' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Educational Standards</CardTitle>
        <CardDescription>
          Search and map your content to educational standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <Badge 
                key={filter.name}
                variant={activeFilter === filter.name ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setActiveFilter(activeFilter === filter.name ? null : filter.name);
                  setSearchResults([]);
                }}
              >
                {filter.name}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search standards by keyword or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={() => setShowCustomStandardModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Custom
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="text-sm font-medium p-2 bg-muted">Search Results</div>
              <div className="divide-y">
                {searchResults.map((standard) => (
                  <div key={standard.id} className="p-2 hover:bg-muted/50 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{standard.id}</div>
                      <div className="text-sm text-muted-foreground">{standard.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {standard.organization} • {standard.category}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAddStandard(standard)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-sm font-medium mb-2">Selected Standards ({selectedStandards.length})</div>
            {selectedStandards.length === 0 ? (
              <div className="text-muted-foreground text-sm p-4 border rounded-md text-center">
                No standards selected yet. Use the search box above to find and add standards or create custom ones.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedStandards.map((standard) => (
                  <div key={standard.id} className="flex justify-between items-center p-2 border rounded-md bg-muted/30">
                    <div>
                      <div className="font-medium">{standard.id}</div>
                      <div className="text-sm">{standard.description}</div>
                      {standard.organization && (
                        <div className="text-xs text-muted-foreground">
                          {standard.organization}
                          {standard.category && ` • ${standard.category}`}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveStandard(standard.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Standard Dialog */}
          <Dialog open={showCustomStandardModal} onOpenChange={setShowCustomStandardModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Standard</DialogTitle>
                <DialogDescription>
                  Create your own educational standard to include in your project
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="standard-id" className="text-sm font-medium">Standard ID *</label>
                  <Input
                    id="standard-id"
                    placeholder="e.g., CUSTOM.MATH.G6.1"
                    value={customStandardId}
                    onChange={(e) => setCustomStandardId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="standard-description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="standard-description"
                    placeholder="Describe what this standard covers..."
                    value={customStandardDescription}
                    onChange={(e) => setCustomStandardDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCustomStandardModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomStandard}>
                  Add Standard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default StandardsIntegration;
