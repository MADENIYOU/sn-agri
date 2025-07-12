
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, Mic, StopCircle, Trash2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHAT_USERS } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Message, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { firestore, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>(CHAT_USERS[1]);
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatId = useCallback((uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  }, []);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const chatId = getChatId(currentUser.uid, selectedUser.id);
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          audioUrl: data.audioUrl,
          timestamp: data.timestamp,
        });
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Erreur de récupération des messages:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les messages." });
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser, getChatId, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      toast({ variant: 'destructive', title: 'Erreur Microphone', description: "Veuillez autoriser l'accès au microphone." });
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
        audioRef.current.play().catch(e => console.error("Erreur de lecture audio:", e));
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (newMessage.trim() === '' && !audioBlob)) return;
    
    setLoading(true);
    const chatId = getChatId(currentUser.uid, selectedUser.id);
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');

    try {
        let audioUrl: string | null = null;
        if (audioBlob) {
            const audioRef = ref(storage, `chat_audio/${chatId}/${Date.now()}.webm`);
            const snapshot = await uploadBytes(audioRef, audioBlob);
            audioUrl = await getDownloadURL(snapshot.ref);
        }

        await addDoc(messagesRef, {
            senderId: currentUser.uid,
            receiverId: selectedUser.id,
            message: newMessage,
            audioUrl: audioUrl,
            timestamp: serverTimestamp(),
        });

        setNewMessage('');
        setAudioBlob(null);

    } catch (error) {
        console.error("Erreur d'envoi de message:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: "Le message n'a pas pu être envoyé." });
    } finally {
        setLoading(false);
    }
  };

  if (!currentUser) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
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
            {messages.map((msg) => {
              const user = CHAT_USERS.find((u) => u.id === msg.senderId);
              const isCurrentUser = msg.senderId === currentUser.uid;
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
                                {playingMessageId === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                           </Button>
                           <div className="w-40 h-1 bg-muted-foreground/30 rounded-full" />
                        </div>
                      ) : (
                         <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      )}
                       <p className={cn("text-xs opacity-70 mt-1", isCurrentUser ? "text-right" : "text-left")}>
                        {msg.timestamp ? formatDistanceToNow(new Timestamp(msg.timestamp.seconds, msg.timestamp.nanoseconds).toDate(), { addSuffix: true, locale: fr }) : 'envoi...'}
                      </p>
                    </div>
                  </div>
                   {isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.photoURL || undefined} />
                      <AvatarFallback>{currentUser.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <div className="p-4 border-t">
          {audioBlob && !isRecording && (
             <div className="flex items-center gap-2 p-2 rounded-lg bg-muted mb-2">
                <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
                <Button size="icon" variant="ghost" onClick={() => setAudioBlob(null)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
             </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={isRecording || !!audioBlob || loading}
            />
            {isRecording ? (
               <Button type="button" size="icon" onClick={stopRecording} variant="destructive">
                <StopCircle className="h-4 w-4" />
                <span className="sr-only">Arrêter l'enregistrement</span>
              </Button>
            ) : (
              <Button type="button" size="icon" onClick={startRecording} disabled={loading || !!newMessage}>
                <Mic className="h-4 w-4" />
                <span className="sr-only">Commencer l'enregistrement</span>
              </Button>
            )}
            <Button type="submit" size="icon" disabled={isRecording || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Envoyer</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
