'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getForums, getFollowedForums, toggleFollowForum, createForum } from './actions';
import type { Forum } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Users as UsersIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CreateForumDialog({ onCreate }: { onCreate: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        if (!name.trim() || !description.trim()) {
            toast({ variant: 'destructive', description: 'Veuillez remplir tous les champs.' });
            return;
        }
        setIsCreating(true);
        const { error } = await createForum(name, description);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: error });
        } else {
            toast({ title: 'Succès', description: 'Forum créé avec succès.' });
            setName('');
            setDescription('');
            setIsOpen(false);
            onCreate();
        }
        setIsCreating(false);
    };

    if (!user) return null; // Only authenticated users can create forums

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer un Forum
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer un Nouveau Forum</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input placeholder="Nom du forum" value={name} onChange={e => setName(e.target.value)} />
                    <Textarea placeholder="Description du forum" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ForumCard({ forum, onFollowToggle, isAuthenticated }: { forum: Forum; onFollowToggle: (forumId: string) => void; isAuthenticated: boolean }) {
    const { toast } = useToast();
    const [isToggling, setIsToggling] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        if (!isAuthenticated) {
            toast({ variant: 'destructive', description: 'Connectez-vous pour suivre un forum.' });
            router.push('/login');
            return;
        }
        setIsToggling(true);
        const { success, error } = await toggleFollowForum(forum.id);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: error });
        } else if (success) {
            toast({ title: 'Succès', description: forum.is_followed ? 'Forum non suivi.' : 'Forum suivi.' });
            onFollowToggle(forum.id);
        }
        setIsToggling(false);
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <Link href={`/forum/${forum.id}`} className="hover:underline">
                        {forum.name}
                    </Link>
                    <Button 
                        variant={forum.is_followed ? 'secondary' : 'default'} 
                        size="sm" 
                        onClick={handleToggle}
                        disabled={isToggling || !isAuthenticated}
                    >
                        {isToggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {forum.is_followed ? 'Suivi' : 'Suivre'}
                    </Button>
                </CardTitle>
                <CardDescription>{forum.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
                <p className="text-xs text-muted-foreground">Créé le {new Date(forum.created_at).toLocaleDateString()}</p>
            </CardContent>
        </Card>
    );
}

export default function ForumPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [allForums, setAllForums] = useState<Forum[]>([]);
    const [followedForums, setFollowedForums] = useState<Forum[]>([]);
    const [loadingForums, setLoadingForums] = useState(true);
    const [activeTab, setActiveTab] = useState<'for_you' | 'followed'>('for_you');

    const fetchForums = useCallback(async () => {
        setLoadingForums(true);
        const { forums, error } = await getForums();
        if (error && error !== 'User not authenticated') {
            toast({ variant: 'destructive', title: 'Erreur', description: error });
        } else if (forums) {
            // Randomize for "Pour toi" section
            setAllForums(forums.sort(() => Math.random() - 0.5));
        }
        setLoadingForums(false);
    }, [toast]);

    const fetchFollowedForums = useCallback(async () => {
        if (!user) {
            setFollowedForums([]);
            return;
        }
        setLoadingForums(true);
        const { forums, error } = await getFollowedForums();
        if (error && error !== 'User not authenticated') {
            toast({ variant: 'destructive', title: 'Erreur', description: error });
        } else if (forums) {
            setFollowedForums(forums);
        }
        setLoadingForums(false);
    }, [user, toast]);

    useEffect(() => {
        fetchForums();
        if (user) {
            fetchFollowedForums();
        }
    }, [fetchForums, fetchFollowedForums, user]);

    const handleFollowToggle = (forumId: string) => {
        // Optimistically update UI
        setAllForums(prev => prev.map(f => f.id === forumId ? { ...f, is_followed: !f.is_followed } : f));
        setFollowedForums(prev => {
            const existing = prev.find(f => f.id === forumId);
            if (existing) {
                return prev.filter(f => f.id !== forumId);
            } else {
                const forumToAdd = allForums.find(f => f.id === forumId);
                return forumToAdd ? [...prev, { ...forumToAdd, is_followed: true }] : prev;
            }
        });
    };

    if (authLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Forums Communautaires</h1>
                {user && <CreateForumDialog onCreate={fetchForums} />}
            </div>

            <div className="flex gap-2 border-b pb-2">
                <Button 
                    variant={activeTab === 'for_you' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('for_you')}
                >
                    Pour toi
                </Button>
                {user && (
                    <Button 
                        variant={activeTab === 'followed' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('followed')}
                    >
                        Suivis
                    </Button>
                )}
            </div>

            {loadingForums ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Loader2 className="h-6 w-6 animate-spin" /></CardHeader>
                            <CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === 'for_you' && allForums.length > 0 ? (
                        allForums.map(forum => (
                            <ForumCard 
                                key={forum.id} 
                                forum={forum} 
                                onFollowToggle={handleFollowToggle} 
                                isAuthenticated={!!user}
                            />
                        ))
                    ) : activeTab === 'followed' && user && followedForums.length > 0 ? (
                        followedForums.map(forum => (
                            <ForumCard 
                                key={forum.id} 
                                forum={forum} 
                                onFollowToggle={handleFollowToggle} 
                                isAuthenticated={!!user}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full text-center p-4">
                            {activeTab === 'for_you' ? 'Aucun forum disponible pour le moment.' : 'Vous ne suivez aucun forum.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}