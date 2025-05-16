
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, X, Plus, Upload, FileText } from "lucide-react";
import { EducationalStandard } from '@/types/project';
import { standardsDatabase } from '@/data/standardsDatabase';
import { claudeService } from '@/services/claudeService';
import { toast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [standardsFromFile, setStandardsFromFile] = useState<{text: string, processed: boolean}>({
    text: '', 
    processed: false
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    console.log("Searching for standards with query:", searchQuery);
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
    
    console.log("Search results:", results.length, "standards found");
    setSearchResults(results);
  };

  const handleAddStandard = (standard: EducationalStandard) => {
    console.log("Adding standard:", standard);
    
    // Check if the standard is already selected by ID
    if (!selectedStandards.some(s => s.id === standard.id)) {
      const updatedStandards = [...selectedStandards, standard];
      console.log("Updated standards:", updatedStandards);
      onStandardsChange(updatedStandards);
      
      // Show success notification
      toast({
        title: "Standard Added",
        description: `Added standard: ${standard.id}`,
      });
    } else {
      // Standard already exists
      toast({
        title: "Standard Already Added",
        description: `Standard ${standard.id} is already in your selection`,
        variant: "destructive",
      });
    }
    
    // Clear search results after adding
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveStandard = (standardId: string) => {
    console.log("Removing standard with ID:", standardId);
    const updatedStandards = selectedStandards.filter(s => s.id !== standardId);
    console.log("Updated standards after removal:", updatedStandards);
    onStandardsChange(updatedStandards);
    
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

    console.log("Adding custom standard:", newStandard);
    
    // Add to selected standards
    const updatedStandards = [...selectedStandards, newStandard];
    onStandardsChange(updatedStandards);
    
    // Reset form and close modal
    setCustomStandardId('');
    setCustomStandardDescription('');
    setUploadedFile(null);
    setStandardsFromFile({ text: '', processed: false });
    setShowCustomStandardModal(false);
    
    // Show success notification
    toast({
      title: "Custom Standard Added",
      description: `Added custom standard: ${newStandard.id}`,
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    console.log("File dropped:", file.name);
    setUploadedFile(file);
    setIsProcessingFile(true);
    
    // Read the file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) return;
      
      const fileContent = e.target.result as string;
      setStandardsFromFile({ text: fileContent.substring(0, 500) + '...', processed: true });
      
      // If Claude service is available, try to extract standards
      try {
        const prompt = `
        Extract educational standards from this document extract:
        
        ${fileContent.substring(0, 3000)}
        
        Return just the standard ID and description in this format:
        ID: [standard identifier]
        Description: [standard description]
        `;
        
        const { data, error } = await claudeService.generateContent({
          prompt,
          model: 'claude-3-opus',
          format: 'text',
          temperature: 0.2,
          maxTokens: 1000
        });
        
        if (error) {
          console.error("Error processing file with Claude:", error);
          toast({
            title: "Processing Error",
            description: "Could not extract standards from file automatically. Please add details manually.",
            variant: "destructive",
          });
        } else if (data && typeof data === 'string') {
          // Try to extract standard ID and description
          const lines = data.split("\n");
          let currentId = "";
          let currentDescription = "";
          
          for (const line of lines) {
            if (line.startsWith("ID:")) {
              currentId = line.replace("ID:", "").trim();
            } else if (line.startsWith("Description:") && currentId) {
              currentDescription = line.replace("Description:", "").trim();
              if (currentId && currentDescription) {
                setCustomStandardId(currentId);
                setCustomStandardDescription(currentDescription);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error processing file:", err);
      }
      
      setIsProcessingFile(false);
    };
    
    reader.readAsText(file);
  }, []);
  
  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  });

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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Custom Standard</DialogTitle>
                <DialogDescription>
                  Create your own educational standard or upload a document to extract standards
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div 
                  {...getRootProps()} 
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop a standards document, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOCX, DOC, and TXT files
                    </p>
                  </div>
                </div>

                {isProcessingFile && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Processing file...</p>
                  </div>
                )}
                
                {uploadedFile && !isProcessingFile && (
                  <div className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setStandardsFromFile({ text: '', processed: false });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {standardsFromFile.processed && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Extracted content:</p>
                        <p className="text-xs border p-2 mt-1 rounded-md max-h-20 overflow-auto whitespace-pre-wrap">
                          {standardsFromFile.text}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
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
                <Button variant="outline" onClick={() => {
                  setCustomStandardId('');
                  setCustomStandardDescription('');
                  setUploadedFile(null);
                  setStandardsFromFile({ text: '', processed: false });
                  setShowCustomStandardModal(false);
                }}>
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
