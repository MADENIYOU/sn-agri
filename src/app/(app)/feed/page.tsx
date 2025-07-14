
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Share2, Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { createPost, getPosts } from './actions';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Post } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";

function CreatePostForm() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    }
    
    const handleFormSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const { error } = await createPost(formData);
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: error });
            } else {
                formRef.current?.reset();
                setImagePreview(null);
                if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                }
            }
        });
    }
    
    const getInitials = () => {
        if (!user) return "";
        const name = user.user_metadata.fullName || user.user_metadata.full_name;
        if (name) return name.split(' ').map((n:string) => n[0]).join('');
        return user.email?.substring(0, 2).toUpperCase() || "";
    };

    if (!user) return null;

    return (
        <Card>
            <form ref={formRef} action={handleFormSubmit}>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={user.user_metadata.avatar_url || ''} alt={user.user_metadata.fullName || 'User'} />
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                          <Textarea name="content" placeholder={`À quoi pensez-vous, ${user.user_metadata.fullName || ''} ?`} required disabled={isPending} />
                          {imagePreview && (
                              <div className="relative w-fit">
                                  <Image src={imagePreview} alt="Aperçu de l'image" width={100} height={100} className="rounded-md object-cover" />
                                  <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => { setImagePreview(null); if(imageInputRef.current) imageInputRef.current.value = ""; }}>
                                      <X className="h-4 w-4" />
                                  </Button>
                              </div>
                          )}
                          <input type="file" name="image" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageChange} disabled={isPending}/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                    <Button type="button" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} disabled={isPending}>
                        <ImageIcon className="w-5 h-5" />
                        <span className="sr-only">Ajouter une image</span>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Publier
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

function PostCard({ post }: { post: Post }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar>
                    <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{post.author.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</p>
                </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{post.content}</p>
              {post.image_url && (
                <div className="mt-4 rounded-lg overflow-hidden border">
                  <Image
                    src={post.image_url}
                    alt="Image de la publication"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" /> <span>{post.likes} J'aime</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> <span>{post.comments} Commentaire</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" /> <span>Partager</span>
              </Button>
            </CardFooter>
          </Card>
    );
}

function PostSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-48 w-full rounded-md" />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
    )
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const { posts, error } = await getPosts();
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: error });
            } else {
                setPosts(posts);
            }
            setLoading(false);
        }
        fetchPosts();
    }, [toast]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Fil Communautaire</h1>
        <p className="text-muted-foreground">
          Connectez-vous, partagez et apprenez avec la communauté agricole sénégalaise.
        </p>
      </div>

      <CreatePostForm />
      
      <div className="space-y-6">
        {loading ? (
            <>
                <PostSkeleton />
                <PostSkeleton />
            </>
        ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>Aucune publication pour le moment. Soyez le premier à partager quelque chose !</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
