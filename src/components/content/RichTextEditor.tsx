
import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  ListOrdered, 
  List, 
  Link, 
  Image, 
  Video 
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { MediaInsertDialog } from './MediaInsertDialog';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  projectId: string;
}

export function RichTextEditor({ initialContent, onChange, projectId }: RichTextEditorProps) {
  const [editorContent, setEditorContent] = useState<string>(initialContent);
  const [showMediaDialog, setShowMediaDialog] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showLinkPopover, setShowLinkPopover] = useState<boolean>(false);

  // Simulate contentEditable operations
  const handleFormatClick = (format: string) => {
    const editorElement = document.getElementById('rich-text-editor');
    if (!editorElement) return;
    
    // In a real implementation, this would use document.execCommand or a rich text library
    console.log(`Applying format: ${format}`);
    
    // This is a simplified simulation - in reality, you'd replace this with proper formatting logic
    let updatedContent = editorContent;
    
    switch (format) {
      case 'bold':
        updatedContent += '<strong>Bold text</strong> ';
        break;
      case 'italic':
        updatedContent += '<em>Italic text</em> ';
        break;
      case 'underline':
        updatedContent += '<u>Underlined text</u> ';
        break;
      case 'h1':
        updatedContent += '<h1>Heading 1</h1>';
        break;
      case 'h2':
        updatedContent += '<h2>Heading 2</h2>';
        break;
      case 'h3':
        updatedContent += '<h3>Heading 3</h3>';
        break;
      case 'ol':
        updatedContent += '<ol><li>Ordered item</li></ol>';
        break;
      case 'ul':
        updatedContent += '<ul><li>Unordered item</li></ul>';
        break;
      default:
        break;
    }
    
    setEditorContent(updatedContent);
    onChange(updatedContent);
  };
  
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    setEditorContent(content);
    onChange(content);
  };
  
  const handleMediaInsert = (mediaUrl: string, caption: string) => {
    let mediaHtml = '';
    if (mediaType === 'image') {
      mediaHtml = `<figure><img src="${mediaUrl}" alt="${caption}" style="max-width: 100%;" /><figcaption>${caption}</figcaption></figure>`;
    } else {
      mediaHtml = `<figure><iframe width="560" height="315" src="${mediaUrl}" frameborder="0" allowfullscreen></iframe><figcaption>${caption}</figcaption></figure>`;
    }
    
    const updatedContent = editorContent + mediaHtml;
    setEditorContent(updatedContent);
    onChange(updatedContent);
    setShowMediaDialog(false);
  };

  const handleLinkInsert = () => {
    if (!linkUrl) return;
    
    const linkHtml = `<a href="${linkUrl}" target="_blank">${linkUrl}</a> `;
    const updatedContent = editorContent + linkHtml;
    setEditorContent(updatedContent);
    onChange(updatedContent);
    setLinkUrl('');
    setShowLinkPopover(false);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="border-b p-2">
          <div className="flex flex-wrap gap-2">
            <ToggleGroup type="multiple" className="mr-2">
              <ToggleGroupItem value="bold" onClick={() => handleFormatClick('bold')}>
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" onClick={() => handleFormatClick('italic')}>
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" onClick={() => handleFormatClick('underline')}>
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <ToggleGroup type="single" className="mr-2">
              <ToggleGroupItem value="h1" onClick={() => handleFormatClick('h1')}>
                <Heading1 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="h2" onClick={() => handleFormatClick('h2')}>
                <Heading2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="h3" onClick={() => handleFormatClick('h3')}>
                <Heading3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <ToggleGroup type="single" className="mr-2">
              <ToggleGroupItem value="ol" onClick={() => handleFormatClick('ol')}>
                <ListOrdered className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="ul" onClick={() => handleFormatClick('ul')}>
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Link className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium">Insert Link</h3>
                  <Input 
                    placeholder="https://example.com" 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleLinkInsert}>Insert Link</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                setMediaType('image');
                setShowMediaDialog(true);
              }}
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                setMediaType('video');
                setShowMediaDialog(true);
              }}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div 
            id="rich-text-editor"
            className="min-h-[300px] p-4 outline-none"
            contentEditable={true}
            dangerouslySetInnerHTML={{ __html: editorContent }}
            onInput={handleContentChange}
          />
        </CardContent>
      </Card>
      
      <MediaInsertDialog
        open={showMediaDialog}
        onOpenChange={setShowMediaDialog}
        onInsert={handleMediaInsert}
        mediaType={mediaType}
        projectId={projectId}
      />
      
      <div className="border rounded-md p-4 bg-muted/30">
        <h3 className="font-medium mb-2">Preview</h3>
        <div 
          className="prose prose-blue max-w-none" 
          dangerouslySetInnerHTML={{ __html: editorContent }} 
        />
      </div>
    </div>
  );
}
