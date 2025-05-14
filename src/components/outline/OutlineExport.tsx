
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Outline } from '@/types/outline';
import { toast } from '@/hooks/use-toast';
import { exportToMarkdown, exportToHTML, exportToPDF, exportToDocx } from '@/services/exportService';
import { FileText, FileDoc, FilePdf, FileHtml, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface OutlineExportProps {
  outline: Outline;
}

export function OutlineExport({ outline }: OutlineExportProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'html' | 'markdown'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Export options
  const [includeOptions, setIncludeOptions] = useState({
    standards: true,
    wordCounts: true,
    timeEstimates: true,
    relationships: true,
    notes: false,
    references: true,
    assessmentPoints: true
  });
  
  // Quality and formatting options
  const [exportQuality, setExportQuality] = useState<'draft' | 'standard' | 'high'>('standard');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('letter');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      // Create export options object
      const exportOptions = {
        includeStandards: includeOptions.standards,
        includeWordCounts: includeOptions.wordCounts,
        includeTimeEstimates: includeOptions.timeEstimates,
        includeRelationships: includeOptions.relationships,
        includeNotes: includeOptions.notes,
        includeReferences: includeOptions.references,
        includeAssessmentPoints: includeOptions.assessmentPoints,
        quality: exportQuality,
        paperSize: paperSize,
        includePageNumbers: includePageNumbers,
        includeTableOfContents: includeTableOfContents
      };
      
      setExportProgress(30);
      
      let result;
      
      // Call appropriate export function based on selected format
      switch (exportFormat) {
        case 'pdf':
          result = await exportToPDF(outline, exportOptions, (progress) => {
            setExportProgress(30 + progress * 0.6);
          });
          break;
        case 'docx':
          result = await exportToDocx(outline, exportOptions, (progress) => {
            setExportProgress(30 + progress * 0.6);
          });
          break;
        case 'html':
          result = await exportToHTML(outline, exportOptions, (progress) => {
            setExportProgress(30 + progress * 0.6);
          });
          break;
        case 'markdown':
          result = await exportToMarkdown(outline, exportOptions, (progress) => {
            setExportProgress(30 + progress * 0.6);
          });
          break;
      }
      
      setExportProgress(100);
      
      // Show success message
      toast({
        title: "Export Complete",
        description: `Your outline has been exported as ${exportFormat.toUpperCase()}`,
        variant: "success"
      });
      
      // Trigger download of the exported file
      if (result && result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename || `${outline.title}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your outline. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };
  
  const formatIcons = {
    pdf: <FilePdf className="h-8 w-8 text-red-500" />,
    docx: <FileDoc className="h-8 w-8 text-blue-500" />,
    html: <FileHtml className="h-8 w-8 text-orange-500" />,
    markdown: <FileText className="h-8 w-8 text-purple-500" />
  };
  
  const formatDescriptions = {
    pdf: "Portable Document Format for universal sharing and printing",
    docx: "Microsoft Word format for easy editing and collaboration",
    html: "Web format for online publishing and browser viewing",
    markdown: "Plain text format with formatting for maximum compatibility"
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Export Outline</CardTitle>
        <CardDescription>Export your outline to various formats</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format" className="space-y-4">
          <TabsList>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="options">Content Options</TabsTrigger>
            <TabsTrigger value="formatting">Formatting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="format" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['pdf', 'docx', 'html', 'markdown'] as const).map((format) => (
                <div 
                  key={format}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted ${
                    exportFormat === format ? 'border-primary bg-muted/50' : 'border-border'
                  }`}
                  onClick={() => setExportFormat(format)}
                >
                  <div className="flex flex-col items-center text-center">
                    {formatIcons[format]}
                    <h3 className="mt-2 font-medium">.{format.toUpperCase()}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{formatDescriptions[format]}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>Exporting... <Progress value={exportProgress} className="h-2 w-24 ml-2" /></>
                ) : (
                  <><Download className="h-4 w-4 mr-2" /> Export as {exportFormat.toUpperCase()}</>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-standards" 
                    checked={includeOptions.standards}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, standards: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-standards">Include Standards</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-wordcounts" 
                    checked={includeOptions.wordCounts}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, wordCounts: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-wordcounts">Include Word Counts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-time" 
                    checked={includeOptions.timeEstimates}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, timeEstimates: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-time">Include Time Estimates</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-relationships" 
                    checked={includeOptions.relationships}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, relationships: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-relationships">Include Relationships</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-notes" 
                    checked={includeOptions.notes}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, notes: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-notes">Include Notes</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-references" 
                    checked={includeOptions.references}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, references: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-references">Include References</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-assessment" 
                    checked={includeOptions.assessmentPoints}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({...includeOptions, assessmentPoints: checked as boolean})
                    }
                  />
                  <Label htmlFor="include-assessment">Include Assessment Points</Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="formatting" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-quality">Export Quality</Label>
                  <Select
                    value={exportQuality}
                    onValueChange={(value: 'draft' | 'standard' | 'high') => setExportQuality(value)}
                  >
                    <SelectTrigger id="export-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Faster)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High (Slower)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paper-size">Paper Size</Label>
                  <Select
                    value={paperSize}
                    onValueChange={(value: 'a4' | 'letter') => setPaperSize(value)}
                  >
                    <SelectTrigger id="paper-size">
                      <SelectValue placeholder="Select paper size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                      <SelectItem value="a4">A4 (210mm x 297mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="page-numbers" 
                    checked={includePageNumbers}
                    onCheckedChange={(checked) => setIncludePageNumbers(!!checked)}
                  />
                  <Label htmlFor="page-numbers">Include Page Numbers</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="table-of-contents" 
                    checked={includeTableOfContents}
                    onCheckedChange={(checked) => setIncludeTableOfContents(!!checked)}
                  />
                  <Label htmlFor="table-of-contents">Include Table of Contents</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default OutlineExport;
