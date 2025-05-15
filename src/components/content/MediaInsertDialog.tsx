
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface MediaInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (mediaUrl: string, caption: string) => void;
  mediaType: 'image' | 'video';
  projectId: string;
}

export function MediaInsertDialog({
  open,
  onOpenChange,
  onInsert,
  mediaType,
  projectId
}: MediaInsertDialogProps) {
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaCaption, setMediaCaption] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('url');
  
  const handleUrlInsert = () => {
    if (!mediaUrl) return;
    onInsert(mediaUrl, mediaCaption);
    setMediaUrl('');
    setMediaCaption('');
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };
  
  const handleFileUpload = () => {
    if (!uploadFile) return;
    
    // In a real app, this would upload to a storage service
    // Here we'll simulate an upload process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Generate a fake URL for the uploaded file
        const fakeUrl = `https://example.com/storage/${projectId}/${uploadFile.name}`;
        onInsert(fakeUrl, mediaCaption);
        
        // Reset states
        setUploadFile(null);
        setUploadProgress(0);
        setMediaCaption('');
      }
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Insert {mediaType === 'image' ? 'Image' : 'Video'}
          </DialogTitle>
          <DialogDescription>
            {mediaType === 'image'
              ? 'Add an image to your content'
              : 'Add a video from YouTube, Vimeo, or other platforms'}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="url"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="media-url">Media URL</Label>
              <Input
                id="media-url"
                placeholder={mediaType === 'image' ? 'https://example.com/image.jpg' : 'https://youtube.com/watch?v=abcd1234'}
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-caption">Caption</Label>
              <Textarea
                id="media-caption"
                placeholder="Add a caption to describe the media"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
              />
            </div>

            {uploadFile && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected file: {uploadFile.name}</p>
                {uploadProgress > 0 && (
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="upload-caption">Caption</Label>
              <Textarea
                id="upload-caption"
                placeholder="Add a caption to describe the media"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'url' ? (
            <Button onClick={handleUrlInsert}>Insert</Button>
          ) : (
            <Button onClick={handleFileUpload} disabled={!uploadFile}>
              Upload & Insert
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
