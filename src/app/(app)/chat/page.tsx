'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Send, Loader2, Mic, StopCircle, Trash2, Play, Pause, Users, X, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Message, Conversation, ChatUser } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { findUserByEmail, getConversations, getMessages, createConversation, sendMessage, markConversationAsRead } from './actions';

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // New Conversation Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMembers, setNewMembers] = useState<ChatUser[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [findingUser, setFindingUser] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effect to add current user to new chat members list
  useEffect(() => {
    if(currentUser && isDialogOpen) {
      const self = { id: currentUser.id, name: currentUser.fullName || currentUser.email || 'Moi', email: currentUser.email! };
      if (!newMembers.some(m => m.id === self.id)) {
        setNewMembers([self]);
      }
    }
  }, [currentUser, isDialogOpen]);

  // Fetch conversations the current user is part of
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConversations(true);

    const { conversations, error } = await getConversations();

    if (error) {
      console.error("Erreur de récupération des conversations:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les conversations." });
    } else if (conversations) {
      setConversations(conversations);
    }
    setLoadingConversations(false);
  }, [currentUser, toast]);


  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedConversation) {
        setMessages([]);
        return;
    };

    const fetchMessages = async () => {
        const { messages, error } = await getMessages(selectedConversation.id);
        
        if (error) {
            console.error("Erreur de récupération des messages:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les messages." });
        } else {
            setMessages(messages as Message[]);
        }
    }
    fetchMessages();
  }, [selectedConversation, toast]);
    
  // Polling for conversations
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentUser) return;
      const { conversations: newConversations, error } = await getConversations();
      if (!error && newConversations) {
        setConversations(newConversations);
        if (selectedConversation) {
          const updatedSelected = newConversations.find(c => c.id === selectedConversation.id);
          setSelectedConversation(updatedSelected || null);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser, selectedConversation]);


  const handleCreateConversation = async () => {
    if (!currentUser || newGroupName.trim() === '' || newMembers.length < 2) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le nom du groupe et au moins un autre membre sont requis.' });
        return;
    }
    setCreatingConversation(true);
    try {
        const memberIds = newMembers.map(m => m.id);
        const { conversation, error } = await createConversation(newGroupName, memberIds);

        if (error || !conversation) throw new Error(error || "La conversation n'a pas pu être créée.");

        toast({ title: 'Succès', description: 'Conversation créée avec succès.'});
        setNewGroupName('');
        setNewMembers([]);
        setNewMemberEmail('');
        await fetchConversations();
        
        setSelectedConversation(conversation);
        setIsDialogOpen(false); // Close dialog on success

    } catch (error: any) {
        console.error("Erreur de création de conversation:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: error.message || "La conversation n'a pas pu être créée." });
    } finally {
        setCreatingConversation(false);
    }
  };
  
  const handleAddMember = async () => {
    if (newMemberEmail.trim() === '') return;
    setFindingUser(true);

    const { user, error } = await findUserByEmail(newMemberEmail);

    if (error || !user) {
      toast({ variant: 'destructive', title: 'Utilisateur non trouvé', description: error || 'Aucun utilisateur trouvé avec cet email.' });
    } else {
      if (!newMembers.some(m => m.id === user.id)) {
          setNewMembers([...newMembers, user]);
          setNewMemberEmail('');
      } else {
          toast({ variant: 'destructive', description: "Cet utilisateur est déjà dans la liste."});
      }
    }
    
    setFindingUser(false);
  };


  const handleRemoveMember = (memberId: string) => {
    if (currentUser && memberId === currentUser.id) {
        toast({ variant: "destructive", description: "Vous ne pouvez pas vous retirer vous-même." });
        return;
    }
    setNewMembers(newMembers.filter(m => m.id !== memberId));
  };


  const handleSendMessage = async (e: React.FormEvent | null, directAudioBlob?: Blob) => {
    if (e) e.preventDefault();
    const audioToSend = directAudioBlob || audioBlob;
    if (!currentUser || !selectedConversation || (newMessage.trim() === '' && !audioToSend)) return;
  
    setLoading(true);
  
    try {
      let audioUrl: string | null = null;
      if (audioToSend) {
        const formData = new FormData();
        formData.append('file', audioToSend, 'audio.ogg');
        const response = await fetch('/api/upload-audio', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload audio.');
        }
        audioUrl = result.fileUrl;
      }
  
      const { message: sentMessage, error } = await sendMessage(selectedConversation.id, newMessage, audioUrl || undefined);

      if (error || !sentMessage) {
        throw new Error(error || "Le message n'a pas pu être envoyé.");
      }
      
      setMessages(current => [...current, sentMessage]);
      setNewMessage('');
      setAudioBlob(null);

    } catch (error: any) {
      console.error("Erreur d'envoi de message:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: error.message || "Le message n'a pas pu être envoyé." });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const options = { mimeType: 'audio/ogg; codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.warn(`${options.mimeType} is not supported, falling back to default.`);
            mediaRecorderRef.current = new MediaRecorder(stream);
        } else {
            mediaRecorderRef.current = new MediaRecorder(stream, options);
        }

        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
          handleSendMessage(null, audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
      } catch (err) {
        console.error("Erreur d'accès au microphone:", err);
        toast({ variant: 'destructive', title: 'Erreur de Microphone', description: "Impossible d'accéder au microphone. Veuillez vérifier les permissions."});
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };
  
  const handlePlayAudio = (message: Message) => {
    if (audioRef.current && message.audio_url) {
      if (playingMessageId === message.id) {
        audioRef.current.pause();
        setPlayingMessageId(null);
      } else {
        audioRef.current.src = message.audio_url;
        audioRef.current.play();
        setPlayingMessageId(message.id);
      }
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnded = () => setPlayingMessageId(null);
      audio.addEventListener('ended', onEnded);
      return () => {
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedConversation(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!currentUser) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Hier';
    }
    return format(date, 'dd/MM/yy');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <audio ref={audioRef} />
      <Card className="w-1/3 hidden md:flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Conversations</CardTitle>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input placeholder="Nom du groupe" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                        <div className="flex gap-2">
                           <Input placeholder="Email du membre à ajouter" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMember()} />
                           <Button onClick={handleAddMember} disabled={findingUser}>
                                {findingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ajouter
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Membres</h4>
                            <div className="flex flex-wrap gap-2">
                                {newMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-2 bg-muted p-1 rounded-md text-sm">
                                        <span>{member.name}</span>
                                        <button onClick={() => handleRemoveMember(member.id)}>
                                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateConversation} disabled={creatingConversation}>
                            {creatingConversation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-2">
             {loadingConversations ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : conversations.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {conversations.map((convo) => (
                    <Button
                        key={convo.id}
                        variant={selectedConversation?.id === convo.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start p-2 h-auto"
                        onClick={() => {
                            setSelectedConversation(convo);
                            markConversationAsRead(convo.id);
                            setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unreadCount: 0 } : c));
                        }}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback><Users className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                            <div className="text-left flex-grow">
                                <p className="font-semibold">{convo.name}</p>
                                <p className="text-xs text-muted-foreground">{convo.members.length} membres</p>
                            </div>
                            <div className="flex flex-col items-end">
                                {convo.lastMessageAt && <p className="text-xs text-muted-foreground">{formatLastMessageTime(convo.lastMessageAt)}</p>}
                                {convo.unreadCount && convo.unreadCount > 0 && (
                                    <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center mt-1">
                                        {convo.unreadCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center p-4">Aucune conversation. Créez-en une nouvelle pour commencer !</p>
            )}
        </CardContent>
      </Card>
      
      {selectedConversation ? (
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex-row items-center gap-4 border-b">
            <Avatar>
              <AvatarFallback><Users className="h-5 w-5"/></AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{selectedConversation.name}</p>
              <p className="text-xs text-muted-foreground">{selectedConversation.members.length} membres</p>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => {
                const sender = msg.sender || {full_name: "Utilisateur Inconnu", avatar_url: ""}; 
                const isCurrentUser = msg.sender_id === currentUser.id;
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
                        <AvatarImage src={sender.avatar_url || undefined} />
                        <AvatarFallback>{sender.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                     <div className="flex flex-col gap-1.5">
                        {!isCurrentUser && <p className="text-xs text-muted-foreground ml-3">{sender.full_name}</p>}
                        <div
                        className={cn(
                            'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 flex flex-col',
                            isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                        >
                        {msg.audio_url ? (
                            <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className={cn("h-8 w-8 shrink-0", isCurrentUser && "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground")} onClick={() => handlePlayAudio(msg)}>
                                {playingMessageId === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <div className="w-40 h-1 bg-muted-foreground/30 rounded-full" />
                            </div>
                        ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        )}
                        <p className={cn("text-xs opacity-70 mt-1 self-end", isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: fr }) : 'envoi...'}
                        </p>
                        </div>
                    </div>
                     {isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatarUrl || undefined} />
                        <AvatarFallback>{currentUser.fullName?.charAt(0) || 'U'}</AvatarFallback>
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
              <div className="flex-1 flex items-center gap-2">
                {isRecording ? (
                  <div className="w-full flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                  </div>
                ) : (
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    disabled={loading}
                  />
                )}
              </div>
              {isRecording ? (
                <Button type="button" size="icon" onClick={stopRecording} variant="destructive">
                  <StopCircle className="h-4 w-4" />
                  <span className="sr-only">Arrêter l\'enregistrement</span>
                </Button>
              ) : (
                <Button type="button" size="icon" onClick={startRecording} disabled={loading || !!newMessage}>
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Commencer l\'enregistrement</span>
                </Button>
              )}
              <Button type="submit" size="icon" disabled={isRecording || loading || !newMessage.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Envoyer</span>
              </Button>
            </form>
          </div>
        </Card>
      ) : (
         <Card className="flex-1 flex flex-col items-center justify-center bg-muted/50">
            <div className="text-center p-6">
                <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                <h2 className="mt-4 text-xl font-semibold">Bienvenue sur le chat</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">Sélectionnez une conversation dans la liste de gauche ou créez-en une nouvelle pour commencer à discuter avec d\'autres agriculteurs.</p>
            </div>
        </Card>
      )}
    </div>
  );
}