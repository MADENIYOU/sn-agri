
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Send, Loader2, Mic, StopCircle, Trash2, Play, Pause, Users, X, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Message, Conversation, ChatUser } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { findUserByEmail } from './actions';

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  
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

  // Audio playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effect to add current user to new chat members list
  useEffect(() => {
    if(currentUser && isDialogOpen) {
      const self = { id: currentUser.id, name: currentUser.user_metadata.fullName || currentUser.email || 'Moi', email: currentUser.email! };
      if (!newMembers.some(m => m.id === self.id)) {
        setNewMembers([self]);
      }
    }
  }, [currentUser, isDialogOpen, newMembers]);

  // Fetch conversations the current user is part of
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConversations(true);

    const { data: memberConvos, error: memberError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', currentUser.id);

    if (memberError) {
      console.error("Erreur de récupération des conversations:", memberError);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les conversations." });
      setLoadingConversations(false);
      return;
    }

    if (!memberConvos || memberConvos.length === 0) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    const conversationIds = memberConvos.map(d => d.conversation_id);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        members:conversation_members ( user_id )
      `)
      .in('id', conversationIds);

    if (error) {
      console.error("Erreur de récupération des conversations:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les conversations." });
    } else {
      const convos: Conversation[] = data.map(convo => ({
        id: convo.id,
        name: convo.name,
        created_at: convo.created_at,
        created_by: convo.created_by,
        members: convo.members.map((m: any) => m.user_id),
      }));
      setConversations(convos);
       if (selectedConversation) {
        // refresh selected conversation data
        const updatedSelected = convos.find(c => c.id === selectedConversation.id);
        setSelectedConversation(updatedSelected || null);
      }
    }
    setLoadingConversations(false);
  }, [currentUser, supabase, toast, selectedConversation]);


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
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(full_name, avatar_url)')
            .eq('conversation_id', selectedConversation.id)
            .order('timestamp', { ascending: true });
        
        if (error) {
            console.error("Erreur de récupération des messages:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les messages." });
        } else {
            setMessages(data as Message[]);
        }
    }
    fetchMessages();
  }, [selectedConversation, supabase, toast]);
    
  // Subscribe to real-time updates for messages
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;
  
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
  
    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
  
          // Avoid duplicating messages if the sender is the current user
          if (newMessage.sender_id === currentUser.id && messages.some(m => m.id === newMessage.id)) {
            return;
          }
  
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
  
          if (senderError) {
            console.error("Error fetching sender for new message", senderError);
            newMessage.sender = { full_name: "Utilisateur Inconnu", avatar_url: "" };
          } else {
            newMessage.sender = senderData;
          }
  
          setMessages((currentMessages) => {
            // Add message only if it's not already in the state
            if (currentMessages.find(m => m.id === newMessage.id)) {
                return currentMessages;
            }
            return [...currentMessages, newMessage]
          });
        }
      )
      .subscribe();
  
    channelRef.current = channel;
  
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedConversation, supabase, currentUser, messages]);


  const handleCreateConversation = async () => {
    if (!currentUser || newGroupName.trim() === '' || newMembers.length < 2) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le nom du groupe et au moins un autre membre sont requis.' });
        return;
    }
    setCreatingConversation(true);
    try {
        const { data: convoData, error: convoError } = await supabase
            .from('conversations')
            .insert({ name: newGroupName, created_by: currentUser.id })
            .select()
            .single();

        if (convoError) throw convoError;

        const membersToInsert = newMembers.map(m => ({ conversation_id: convoData.id, user_id: m.id }));
        const { error: membersError } = await supabase
            .from('conversation_members')
            .insert(membersToInsert);
        
        if (membersError) throw membersError;

        toast({ title: 'Succès', description: 'Conversation créée avec succès.'});
        setNewGroupName('');
        setNewMembers([]);
        setNewMemberEmail('');
        await fetchConversations();
        
        const newConvo: Conversation = {
             id: convoData.id,
            name: convoData.name,
            members: newMembers.map(m => m.id),
            created_by: convoData.created_by,
            created_at: convoData.created_at,
        };
        setSelectedConversation(newConvo);
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


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedConversation || (newMessage.trim() === '' && !audioBlob)) return;
  
    setLoading(true);
    const tempMessageId = `temp-${Date.now()}`;
    const sentAt = new Date().toISOString();
  
    try {
      let audioUrl: string | null = null;
      if (audioBlob) {
        const filePath = `${currentUser.id}/${selectedConversation.id}/${Date.now()}.ogg`;
        const { error: uploadError } = await supabase.storage
          .from('chat-audio')
          .upload(filePath, audioBlob, { contentType: 'audio/ogg' });
  
        if (uploadError) throw uploadError;
  
        const { data: { publicUrl } } = supabase.storage
          .from('chat-audio')
          .getPublicUrl(filePath);
        audioUrl = publicUrl;
      }
  
      const messageToInsert = {
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        message: newMessage,
        audio_url: audioUrl,
        timestamp: sentAt,
      };
      
      setNewMessage('');
      setAudioBlob(null);
  
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert(messageToInsert)
        .select('id')
        .single();
  
      if (insertError) {
        throw insertError;
      }
      
      const finalMessage: Message = {
        ...messageToInsert,
        id: insertedMessage.id,
        sender: {
          full_name: currentUser.user_metadata.fullName || "Moi",
          avatar_url: currentUser.user_metadata.avatar_url || ""
        }
      }

      setMessages(current => [...current.filter(m => m.id !== tempMessageId), finalMessage]);

    } catch (error: any) {
      console.error("Erreur d'envoi de message:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: error.message || "Le message n'a pas pu être envoyé." });
      setMessages(current => current.filter(m => m.id !== tempMessageId));
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
          setAudioBlob(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
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
                        onClick={() => setSelectedConversation(convo)}
                    >
                        <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback><Users className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="font-semibold">{convo.name}</p>
                            <p className="text-xs text-muted-foreground">{convo.members.length} membres</p>
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
                        <AvatarImage src={currentUser.user_metadata.avatar_url || undefined} />
                        <AvatarFallback>{currentUser.user_metadata.fullName?.charAt(0) || 'U'}</AvatarFallback>
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
              <Button type="submit" size="icon" disabled={isRecording || loading || (!newMessage.trim() && !audioBlob)}>
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
                <p className="text-muted-foreground mt-2 max-w-sm">Sélectionnez une conversation dans la liste de gauche ou créez-en une nouvelle pour commencer à discuter avec d'autres agriculteurs.</p>
            </div>
        </Card>
      )}
    </div>
  );
}
