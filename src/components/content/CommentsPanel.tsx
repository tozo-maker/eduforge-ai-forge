
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Comment, Edit, Check, X, MessageSquare, AlertCircle } from 'lucide-react';

interface ContentComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  timestamp: string;
  position: string; // Reference to content element
  status: 'open' | 'resolved';
  replies?: ContentComment[];
}

interface CommentsProps {
  projectId: string;
  content: string;
}

export function CommentsPanel({ projectId, content }: CommentsProps) {
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Simulate loading comments
  useEffect(() => {
    const mockComments: ContentComment[] = [
      {
        id: 'comment-1',
        userId: 'user-2',
        userName: 'Jane Smith',
        userAvatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?fit=crop&w=64&h=64',
        content: 'This introduction needs more context about the target audience.',
        timestamp: 'Today at 10:30 AM',
        position: 'Introduction',
        status: 'open'
      },
      {
        id: 'comment-2',
        userId: 'user-3',
        userName: 'Michael Johnson',
        userAvatar: null,
        content: 'I added references to support this section.',
        timestamp: 'Yesterday at 4:15 PM',
        position: 'Section 2',
        status: 'resolved',
        replies: [
          {
            id: 'reply-1',
            userId: 'user-1',
            userName: 'You',
            userAvatar: null,
            content: 'Thanks for adding these references!',
            timestamp: 'Yesterday at 5:20 PM',
            position: 'Section 2',
            status: 'resolved'
          }
        ]
      },
      {
        id: 'comment-3',
        userId: 'user-1',
        userName: 'You',
        userAvatar: null,
        content: 'We should clarify the learning objectives in this assessment section.',
        timestamp: 'Monday at 2:45 PM',
        position: 'Assessment',
        status: 'open'
      }
    ];
    
    setComments(mockComments);
  }, [projectId]);
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: ContentComment = {
      id: `comment-${Date.now()}`,
      userId: 'user-1',
      userName: 'You',
      userAvatar: null,
      content: newComment,
      timestamp: 'Just now',
      position: 'Current section',
      status: 'open'
    };
    
    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
  };
  
  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    setEditingComment(commentId);
    setEditContent(comment.content);
  };
  
  const handleSaveEdit = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent };
        }
        return comment;
      })
    );
    
    setEditingComment(null);
    setEditContent('');
  };
  
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };
  
  const handleResolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, status: 'resolved' };
        }
        return comment;
      })
    );
  };
  
  const handleReopenComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, status: 'open' };
        }
        return comment;
      })
    );
  };
  
  const filteredComments = comments.filter(comment => {
    if (currentFilter === 'all') return true;
    return comment.status === currentFilter;
  });
  
  const renderComment = (comment: ContentComment, isReply = false) => (
    <div key={comment.id} className={`p-3 rounded-lg ${isReply ? 'ml-8 bg-muted/50' : 'bg-muted'} mb-3`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8">
          {comment.userAvatar ? (
            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
          ) : (
            <AvatarFallback>{comment.userName.slice(0, 2)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{comment.userName}</p>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>
            <div className="flex items-center gap-1">
              {comment.status === 'open' ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleResolveComment(comment.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleReopenComment(comment.id)}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              )}
              {comment.userId === 'user-1' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleEditComment(comment.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-1">
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Section: {comment.position}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  );
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <MessageSquare className="h-5 w-5" />
            Comments & Annotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment or annotation..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
            
            <Tabs defaultValue="all" onValueChange={(value) => setCurrentFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="open">
                  Open ({comments.filter(c => c.status === 'open').length})
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved ({comments.filter(c => c.status === 'resolved').length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {filteredComments.length > 0 ? (
                    filteredComments.map(comment => renderComment(comment))
                  ) : (
                    <p className="text-center text-muted-foreground">No comments yet</p>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="open" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {filteredComments.length > 0 ? (
                    filteredComments.map(comment => renderComment(comment))
                  ) : (
                    <p className="text-center text-muted-foreground">No open comments</p>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="resolved" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {filteredComments.length > 0 ? (
                    filteredComments.map(comment => renderComment(comment))
                  ) : (
                    <p className="text-center text-muted-foreground">No resolved comments</p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
