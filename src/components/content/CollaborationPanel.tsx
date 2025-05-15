
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Send } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  role: 'owner' | 'editor' | 'viewer';
  currentlyEditing?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  timestamp: string;
}

interface CollaborationPanelProps {
  projectId: string;
}

export function CollaborationPanel({ projectId }: CollaborationPanelProps) {
  const [activeUsers, setActiveUsers] = useState<Collaborator[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Simulate loading collaborators
  useEffect(() => {
    const mockCollaborators: Collaborator[] = [
      {
        id: 'user-1',
        name: 'You',
        avatar: null,
        status: 'online',
        lastActive: 'now',
        role: 'owner',
        currentlyEditing: 'Introduction section'
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?fit=crop&w=64&h=64',
        status: 'online',
        lastActive: '2 minutes ago',
        role: 'editor',
        currentlyEditing: 'Assessment section'
      },
      {
        id: 'user-3',
        name: 'Michael Johnson',
        avatar: null,
        status: 'away',
        lastActive: '15 minutes ago',
        role: 'editor'
      },
      {
        id: 'user-4',
        name: 'Sarah Williams',
        avatar: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?fit=crop&w=64&h=64',
        status: 'offline',
        lastActive: '3 hours ago',
        role: 'viewer'
      }
    ];
    
    setActiveUsers(mockCollaborators);
    
    // Simulate loading chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        userId: 'user-2',
        userName: 'Jane Smith',
        userAvatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?fit=crop&w=64&h=64',
        content: "I've updated the assessment section with new questions.",
        timestamp: '10:25 AM'
      },
      {
        id: 'msg-2',
        userId: 'user-1',
        userName: 'You',
        userAvatar: null,
        content: 'Thanks! I'll review them shortly.',
        timestamp: '10:27 AM'
      },
      {
        id: 'msg-3',
        userId: 'user-3',
        userName: 'Michael Johnson',
        userAvatar: null,
        content: 'Are we meeting at 2pm to discuss the final draft?',
        timestamp: '10:45 AM'
      }
    ];
    
    setChatMessages(mockMessages);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        // Randomly change some user statuses
        return prev.map(user => {
          if (Math.random() > 0.8) {
            const statuses: ('online' | 'offline' | 'away')[] = ['online', 'away', 'offline'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...user, status: randomStatus };
          }
          return user;
        });
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [projectId]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newChatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'user-1',
      userName: 'You',
      userAvatar: null,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, newChatMessage]);
    setNewMessage('');
  };
  
  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    // In a real app, this would send an invitation to the provided email
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Users className="h-5 w-5" />
              Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              {activeUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar>
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                        )}
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(user.status)} ring-2 ring-white`} 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {user.name} {user.id === 'user-1' && '(You)'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.status === 'online' ? 'Active now' : `Last active ${user.lastActive}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'owner' ? 'default' : 'outline'}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Invite Collaborators</h4>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Email address" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={handleInvite}>Invite</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <MessageSquare className="h-5 w-5" />
              Team Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto mb-4 space-y-3">
              {chatMessages.map((message) => {
                const isOwnMessage = message.userId === 'user-1';
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex gap-2 max-w-[80%]">
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          {message.userAvatar ? (
                            <AvatarImage src={message.userAvatar} alt={message.userName} />
                          ) : (
                            <AvatarFallback>{message.userName.slice(0, 2)}</AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      <div>
                        {!isOwnMessage && (
                          <p className="text-xs font-medium">{message.userName}</p>
                        )}
                        <div 
                          className={`rounded-lg p-3 text-sm ${
                            isOwnMessage 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto flex items-center gap-2">
              <Input 
                placeholder="Type your message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
