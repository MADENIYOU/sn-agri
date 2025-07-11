
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHAT_USERS, CHAT_MESSAGES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

type User = typeof CHAT_USERS[0];
type Message = typeof CHAT_MESSAGES[0];

const currentUser = CHAT_USERS[0]; // Simulate the current logged-in user

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>(CHAT_USERS[1]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: `msg${Date.now()}`,
      userId: currentUser.id,
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate a reply from the other user
    setTimeout(() => {
      const reply: Message = {
        id: `msg${Date.now() + 1}`,
        userId: selectedUser.id,
        message: 'This is an automated reply!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };
  
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.userId === currentUser.id && selectedUser.id) ||
      (msg.userId === selectedUser.id && currentUser.id)
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <Card className="w-1/3 hidden md:flex flex-col">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="flex flex-col gap-2">
            {CHAT_USERS.map((user) => (
              <Button
                key={user.id}
                variant={selectedUser.id === user.id ? 'secondary' : 'ghost'}
                className="w-full justify-start p-2 h-auto"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{user.name}</p>
                    <p className={cn('text-xs', user.online ? 'text-green-500' : 'text-muted-foreground')}>
                      {user.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-row items-center gap-4 border-b">
          <Avatar>
            <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
            <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{selectedUser.name}</p>
            <p className={cn('text-xs', selectedUser.online ? 'text-green-500' : 'text-muted-foreground')}>
              {selectedUser.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {conversationMessages.map((msg) => {
              const user = CHAT_USERS.find((u) => u.id === msg.userId)!;
              const isCurrentUser = user.id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2',
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                     <p className={cn("text-xs opacity-70 mt-1", isCurrentUser ? "text-right" : "text-left")}>
                      {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                   {isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
