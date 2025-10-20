'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageSquare, Share2, Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { createPost, getPosts, toggleLike, addComment, getComments, getPostById } from '@/app/(app)/feed/actions';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import type { Post, CommentWithAuthor } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useParams } from 'next/navigation';
import { CommentItem } from "@/components/feed/CommentItem";

function PostDetailCard({ post, onUpdate }: { post: Post, onUpdate: (post: Post) => void }) {
    const { toast } = useToast();
    const [isLiking, startLikeTransition] = useTransition();
    const [isCommenting, startCommentTransition] = useTransition();
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<CommentWithAuthor[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const handleLikeClick = () => {
        const originalPost = { ...post };
        const updatedPost = {
            ...post,
            likes: post.user_has_liked ? post.likes - 1 : post.likes + 1,
            user_has_liked: !post.user_has_liked,
        };
        onUpdate(updatedPost);

        startLikeTransition(async () => {
            const { error } = await toggleLike(post.id);
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: error });
                onUpdate(originalPost); // Revert on error
            }
        });
    }

    const handleShareClick = () => {
        const postUrl = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(postUrl);
        toast({ title: "Lien copié !", description: "Le lien vers la publication a été copié dans votre presse-papiers."});
    }

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim() === "") return;

        startCommentTransition(async () => {
            const { comment: newComment, error } = await addComment({ postId: post.id, content: comment });
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: error });
            } else if (newComment) {
                setComment("");
                setComments(prev => [newComment, ...prev]);
                onUpdate({ ...post, comments: post.comments + 1 });
            }
        });
    }

    const fetchComments = useCallback(async () => {
        setLoadingComments(true);
        const { comments, error } = await getComments(post.id);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: error });
        } else if (comments) {
            setComments(comments);
        }
        setLoadingComments(false);
    }, [post.id, toast]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <Avatar>
                    <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{post.author.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</p>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-2">
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
            <CardFooter className="flex justify-between border-t p-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLikeClick} disabled={isLiking}>
                <ThumbsUp className={cn("w-4 h-4", post.user_has_liked && "fill-primary text-primary")} /> 
                <span>{post.likes} J'aime</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> 
                <span>{post.comments} Commentaire</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleShareClick}>
                <Share2 className="w-4 h-4" /> 
                <span>Partager</span>
              </Button>
            </CardFooter>
            <div className="p-4 border-t">
                <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-4">
                    <Input 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      placeholder="Ajouter un commentaire..."
                      disabled={isCommenting}
                    />
                    <Button type="submit" size="icon" disabled={isCommenting || comment.trim() === ""}>
                        {isCommenting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
                <div className="space-y-4">
                    {loadingComments ? (
                        <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin"/></div>
                    ) : comments.length > 0 ? (
                                                    comments.map(c => (
                                                        <CommentItem key={c.id} comment={c} onInteraction={fetchComments} postId={post.id} fetchComments={fetchComments} />
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-center text-muted-foreground">Aucun commentaire pour le moment.</p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                            );
                        }
                        
                                                
                        export default function PostDetailPage() {    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchPost = useCallback(async () => {
        setLoading(true);
        const { post: fetchedPost, error } = await getPostById(id as string);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: error });
            setPost(null);
        } else {
            setPost(fetchedPost);
        }
        setLoading(false);
    }, [id, toast]);

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id, fetchPost]);

    const updatePost = (updatedPost: Post) => {
        setPost(updatedPost);
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <PostSkeleton />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 text-center text-muted-foreground">
                <p>Publication non trouvée.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <PostDetailCard post={post} onUpdate={updatePost} />
        </div>
    );
}

function PostSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-48 w-full rounded-md" />
            </CardContent>
            <CardFooter className="flex justify-between border-t p-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
    )
}
