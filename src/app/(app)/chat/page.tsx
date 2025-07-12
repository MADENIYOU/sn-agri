
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, Mic, StopCircle, Trash2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHAT_USERS, CHAT_MESSAGES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Message, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';


export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>(CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>(CHAT_USERS[1]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop()); // Stop the microphone stream
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      // You might want to show a toast notification to the user here
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayAudio = (message: Message) => {
    if (playingMessageId === message.id) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }

    if (message.audioUrl && audioRef.current) {
        audioRef.current.src = message.audioUrl;
        audioRef.current.play();
        setPlayingMessageId(message.id);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnd = () => setPlayingMessageId(null);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
    }
  }, []);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (newMessage.trim() === '' && !audioUrl)) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      userId: currentUser.uid,
      message: newMessage,
      audioUrl: audioUrl,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setAudioUrl(null);

    // Simulate a reply from the other user
    setTimeout(() => {
      const reply: Message = {
        id: `msg${Date.now() + 1}`,
        userId: selectedUser.id,
        message: 'Ceci est une réponse automatique !',
        audioUrl: null,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  if (!currentUser) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.userId === currentUser.uid && selectedUser.id) ||
      (msg.userId === selectedUser.id && currentUser.uid)
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <audio ref={audioRef} />
      <Card className="w-1/3 hidden md:flex flex-col">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="flex flex-col gap-2">
            {CHAT_USERS.filter(u => u.id !== currentUser.uid).map((user) => (
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
                      {user.online ? 'En ligne' : 'Hors ligne'}
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
              {selectedUser.online ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {conversationMessages.map((msg) => {
              const user = CHAT_USERS.find((u) => u.id === msg.userId);
              const isCurrentUser = user?.id === currentUser.uid;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isCurrentUser && user && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                   <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2',
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.audioUrl ? (
                        <div className="flex items-center gap-2">
                           <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handlePlayAudio(msg)}>
                                <Play className={cn("h-4 w-4", playingMessageId === msg.id && "text-primary")} />
                           </Button>
                           <div className="w-40 h-1 bg-muted/50 rounded-full" />
                        </div>
                      ) : (
                         <p className="text-sm">{msg.message}</p>
                      )}
                       <p className={cn("text-xs opacity-70 mt-1", isCurrentUser ? "text-right" : "text-left")}>
                        {formatDistanceToNow(msg.timestamp, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                   {isCurrentUser && user && (
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
          {audioUrl && !isRecording && (
             <div className="flex items-center gap-2 p-2 rounded-lg bg-muted mb-2">
                <audio src={audioUrl} controls className="flex-1" />
                <Button size="icon" variant="ghost" onClick={() => setAudioUrl(null)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
             </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={isRecording || !!audioUrl}
            />
            {isRecording ? (
               <Button type="button" size="icon" onClick={stopRecording} variant="destructive">
                <StopCircle className="h-4 w-4" />
                <span className="sr-only">Arrêter l'enregistrement</span>
              </Button>
            ) : (
              <Button type="button" size="icon" onClick={startRecording}>
                <Mic className="h-4 w-4" />
                <span className="sr-only">Commencer l'enregistrement</span>
              </Button>
            )}
            <Button type="submit" size="icon" disabled={isRecording}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Envoyer</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
