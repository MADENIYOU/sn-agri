
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
import { firestore, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { CHAT_USERS } from '@/lib/constants'; // For simulation

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

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      const self = { id: currentUser.uid, name: currentUser.displayName || currentUser.email || 'Moi', email: currentUser.email! };
      if (!newMembers.some(m => m.id === self.id)) {
        setNewMembers([self]);
      }
    }
  }, [currentUser, isDialogOpen, newMembers]);

  // Fetch conversations the current user is part of
  useEffect(() => {
    if (!currentUser) return;

    setLoadingConversations(true);
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(conversationsRef, where('members', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(convos);
      if (convos.length > 0 && !selectedConversation) {
        // Automatically select the first conversation if none is selected
        // setSelectedConversation(convos[0]);
      } else if (selectedConversation) {
        // refresh selected conversation data
        const updatedSelected = convos.find(c => c.id === selectedConversation.id);
        setSelectedConversation(updatedSelected || null);
      }
      setLoadingConversations(false);
    }, (error) => {
      console.error("Erreur de récupération des conversations:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les conversations." });
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUser, toast]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedConversation) {
        setMessages([]);
        return;
    };

    const messagesRef = collection(firestore, 'conversations', selectedConversation.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          senderId: data.senderId,
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
  }, [selectedConversation, toast]);

  const handleCreateConversation = async () => {
    if (!currentUser || newGroupName.trim() === '' || newMembers.length < 2) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le nom du groupe et au moins un autre membre sont requis.' });
        return;
    }
    setCreatingConversation(true);
    try {
        const memberIds = newMembers.map(m => m.id);
        const docRef = await addDoc(collection(firestore, 'conversations'), {
            name: newGroupName,
            members: memberIds,
            createdBy: currentUser.uid,
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Succès', description: 'Conversation créée avec succès.'});
        setIsDialogOpen(false);
        setNewGroupName('');
        setNewMembers([]);
        setSelectedConversation({ id: docRef.id, name: newGroupName, members: memberIds, createdBy: currentUser.uid, createdAt: Timestamp.now() });
    } catch (error) {
        console.error("Erreur de création de conversation:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: "La conversation n'a pas pu être créée." });
    } finally {
        setCreatingConversation(false);
    }
  };

  const handleAddMember = async () => {
    if (newMemberEmail.trim() === '') return;
    
    // In a real app, this would be a secure Cloud Function call.
    // Here we query firestore directly which is not secure for production.
    try {
        const usersRef = collection(firestore, 'users'); // Assuming you have a 'users' collection
        const q = query(usersRef, where("email", "==", newMemberEmail.trim()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            toast({ variant: 'destructive', title: 'Utilisateur non trouvé', description: `Aucun utilisateur avec l'email ${newMemberEmail}`});
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userToAdd = { id: userDoc.id, name: userDoc.data().displayName, email: userDoc.data().email };

        if (!newMembers.some(m => m.id === userToAdd.id)) {
            setNewMembers([...newMembers, userToAdd]);
            setNewMemberEmail('');
        } else {
            toast({ variant: 'destructive', description: "Cet utilisateur est déjà dans la liste."});
        }
    } catch (e) {
        // Fallback to simulation if 'users' collection doesn't exist or query fails
        console.warn("Firestore 'users' collection not found or query failed. Falling back to simulated user search.", e)
        const userToAdd = CHAT_USERS.find(u => u.name.toLowerCase().includes(newMemberEmail.toLowerCase().split('@')[0]));

        if (userToAdd) {
             if (!newMembers.some(m => m.id === userToAdd.id)) {
                setNewMembers([...newMembers, { id: userToAdd.id, name: userToAdd.name, email: `${userToAdd.name.split(' ')[0].toLowerCase()}@example.com` }]);
                setNewMemberEmail('');
            } else {
                toast({ variant: 'destructive', description: "Cet utilisateur est déjà dans la liste."});
            }
        } else {
            toast({ variant: 'destructive', title: 'Utilisateur non trouvé', description: `Impossible de trouver un utilisateur avec l'email ${newMemberEmail}`});
        }
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (memberId === currentUser?.uid) {
        toast({ variant: "destructive", description: "Vous ne pouvez pas vous retirer vous-même." });
        return;
    }
    setNewMembers(newMembers.filter(m => m.id !== memberId));
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedConversation || (newMessage.trim() === '' && !audioBlob)) return;
    
    setLoading(true);
    const messagesRef = collection(firestore, 'conversations', selectedConversation.id, 'messages');

    try {
        let audioUrl: string | null = null;
        if (audioBlob) {
            const audioFileRef = ref(storage, `chat_audio/${selectedConversation.id}/${Date.now()}.webm`);
            const snapshot = await uploadBytes(audioFileRef, audioBlob);
            audioUrl = await getDownloadURL(snapshot.ref);
        }

        await addDoc(messagesRef, {
            senderId: currentUser.uid,
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

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          // Stop all tracks to release the microphone
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
    if (audioRef.current && message.audioUrl) {
      if (playingMessageId === message.id) {
        audioRef.current.pause();
        setPlayingMessageId(null);
      } else {
        audioRef.current.src = message.audioUrl;
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
                           <Button onClick={handleAddMember}>Ajouter</Button>
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
                const sender = CHAT_USERS.find(u => u.id === msg.senderId) || {name: "Utilisateur Inconnu", avatar: ""}; // Simulation: get user details
                const isCurrentUser = msg.senderId === currentUser.uid;
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
                        <AvatarImage src={sender.avatar} />
                        <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                     <div className="flex flex-col gap-1.5">
                        {!isCurrentUser && <p className="text-xs text-muted-foreground ml-3">{sender.name}</p>}
                        <div
                        className={cn(
                            'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 flex flex-col',
                            isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                        >
                        {msg.audioUrl ? (
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

    