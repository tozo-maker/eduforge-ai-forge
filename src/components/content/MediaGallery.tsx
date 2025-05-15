
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Image, Video, Upload, Search } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  thumbnail: string;
  date: string;
}

interface MediaGalleryProps {
  projectId: string;
}

export function MediaGallery({ projectId }: MediaGalleryProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('images');
  
  // Simulated media data
  const sampleMedia: MediaItem[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952',
      title: 'Student working on laptop',
      thumbnail: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=200',
      date: '2025-04-28'
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
      title: 'Computer code closeup',
      thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200',
      date: '2025-04-26'
    },
    {
      id: '3',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Educational video',
      thumbnail: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200',
      date: '2025-04-25'
    }
  ];
  
  const filteredMedia = sampleMedia.filter(item => {
    if (activeTab === 'images' && item.type !== 'image') return false;
    if (activeTab === 'videos' && item.type !== 'video') return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files[0]);
    }
  };
  
  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 20;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 0;
        }
        
        return newProgress;
      });
    }, 500);
  };

  const insertMediaToEditor = (item: MediaItem) => {
    // In a real app, this would communicate with the editor component
    // to insert the selected media
    console.log('Insert media to editor:', item);
    
    // Simulate a message to user
    alert(`${item.type === 'image' ? 'Image' : 'Video'} "${item.title}" has been added to your clipboard. You can paste it into the editor.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="media-upload" className="cursor-pointer">
              <div className="flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </div>
              <Input 
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </Label>
          </div>
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <p className="text-sm">Uploading...</p>
            <div className="h-2 bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Media</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No media found. Upload some media to get started.</p>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative group">
                {item.type === 'image' ? (
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <Video className="absolute h-12 w-12 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => insertMediaToEditor(item)}
                  >
                    {item.type === 'image' ? (
                      <Image className="h-4 w-4 mr-2" />
                    ) : (
                      <Video className="h-4 w-4 mr-2" />
                    )}
                    Insert
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate" title={item.title}>
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.date}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
