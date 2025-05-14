
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  History, 
  GitBranch, 
  RotateCcw, 
  Diff, 
  Save,
  Plus,
  Check,
  X
} from 'lucide-react';
import { 
  Outline, 
  OutlineVersion 
} from '@/types/outline';
import { toast } from '@/hooks/use-toast';
import { 
  saveOutlineVersion, 
  getOutlineVersions, 
  restoreOutlineVersion,
  createOutlineBranch,
  compareOutlineVersions
} from '@/services/outlineVersioning';

interface OutlineVersioningProps {
  outline: Outline;
  onVersionRestore: (restoredOutline: Outline) => void;
  onBranchCreate: (branchedOutline: Outline) => void;
}

export function OutlineVersioning({ 
  outline, 
  onVersionRestore, 
  onBranchCreate 
}: OutlineVersioningProps) {
  const [versions, setVersions] = useState<OutlineVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparison, setComparison] = useState<{ added: number; removed: number; modified: number } | null>(null);
  const [branchName, setBranchName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load versions on mount and when outline changes
  useEffect(() => {
    if (outline?.id) {
      const outlineVersions = getOutlineVersions(outline.id);
      setVersions(outlineVersions);
    }
  }, [outline?.id, outline?.version]);

  // Save a new version
  const handleSaveVersion = () => {
    try {
      setIsSaving(true);
      const newVersion = saveOutlineVersion(outline, saveMessage || undefined);
      setVersions(prev => [newVersion, ...prev]);
      setSaveMessage('');
      toast({
        title: "Version Saved",
        description: "Your outline version has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving version:', error);
      toast({
        title: "Error",
        description: "Failed to save outline version.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Restore a version
  const handleRestoreVersion = (versionId: string) => {
    try {
      const restoredOutline = restoreOutlineVersion(outline, versionId);
      if (restoredOutline) {
        // Save the restored version
        saveOutlineVersion(restoredOutline, `Restored from version ${versions.find(v => v.id === versionId)?.version}`);
        onVersionRestore(restoredOutline);
        toast({
          title: "Version Restored",
          description: "The selected version has been restored.",
        });
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: "Error",
        description: "Failed to restore outline version.",
        variant: "destructive",
      });
    }
  };

  // Create a branch
  const handleCreateBranch = () => {
    if (!branchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a branch name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const branchedOutline = createOutlineBranch(outline, branchName);
      saveOutlineVersion(branchedOutline, `Initial version for branch ${branchName}`);
      onBranchCreate(branchedOutline);
      setIsCreatingBranch(false);
      setBranchName('');
      toast({
        title: "Branch Created",
        description: `New branch "${branchName}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to create branch.",
        variant: "destructive",
      });
    }
  };

  // Toggle version selection for comparison
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      
      // Only allow two selections at most
      if (prev.length < 2) {
        return [...prev, versionId];
      }
      
      // Replace the oldest selection
      return [prev[1], versionId];
    });
    
    // Clear comparison if selection changes
    setComparison(null);
  };

  // Compare selected versions
  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      toast({
        title: "Selection Required",
        description: "Please select exactly two versions to compare.",
        variant: "destructive",
      });
      return;
    }

    const [versionA, versionB] = selectedVersions;
    const result = compareOutlineVersions(versionA, versionB);
    setComparison(result);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Version History
          </CardTitle>
          <CardDescription>
            Manage and compare different versions of your outline
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {comparison && (
            <div className="flex items-center gap-3 bg-muted p-2 rounded-md text-sm">
              <div className="text-green-500">{comparison.added} added</div>
              <div className="text-red-500">{comparison.removed} removed</div>
              <div className="text-blue-500">{comparison.modified} changed</div>
            </div>
          )}
          
          {selectedVersions.length === 2 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCompareVersions}
              className="gap-1"
            >
              <Diff className="h-4 w-4" />
              Compare
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCreatingBranch(true)}
            className="gap-1"
          >
            <GitBranch className="h-4 w-4" />
            New Branch
          </Button>
          
          <div className="relative">
            <Input
              placeholder="Version comment (optional)"
              value={saveMessage}
              onChange={(e) => setSaveMessage(e.target.value)}
              className="h-9 min-w-[200px]"
            />
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSaveVersion}
              disabled={isSaving}
              className="absolute right-1 top-1 gap-1 h-7"
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isCreatingBranch ? (
          <div className="border rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium mb-2">Create New Branch</h3>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter branch name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleCreateBranch}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Create
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsCreatingBranch(false);
                  setBranchName('');
                }}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
        
        <div className="border rounded-md divide-y">
          {versions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No saved versions yet. Save a version to track changes.
            </div>
          ) : (
            versions.map((version) => (
              <div 
                key={version.id}
                className={`p-3 flex items-center justify-between hover:bg-muted/50 ${
                  selectedVersions.includes(version.id) ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => toggleVersionSelection(version.id)}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {version.message || 'No comment'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestoreVersion(version.id)}
                  className="gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default OutlineVersioning;
