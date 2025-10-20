'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageSquare, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toggleCommentLike, addComment } from '@/app/(app)/feed/actions';
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import type { CommentWithAuthor } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CommentItem({ comment, onInteraction, postId, fetchComments }: { comment: CommentWithAuthor, onInteraction: () => void, postId: string, fetchComments: () => void }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLikingComment, startCommentLikeTransition] = useTransition();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isReplying, startReplyTransition] = useTransition();

    const handleCommentLikeClick = () => {
        startCommentLikeTransition(async () => {
            const { error } = await toggleCommentLike(comment.id);
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: error });
            } else {
                onInteraction();
                fetchComments();
            }
        });
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim() === "") return;

        startReplyTransition(async () => {
            const { error } = await addComment({ postId: postId, content: replyContent, parentId: comment.id });
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: error });
            } else {
                setReplyContent("");
                setShowReplyForm(false);
                onInteraction();
                fetchComments();
            }
        });
    };

    return (
        <div className="flex items-start gap-2 text-sm">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar || undefined} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-lg p-2">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-muted-foreground">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleCommentLikeClick} disabled={isLikingComment}>
                        <ThumbsUp className={cn("w-3 h-3", comment.user_has_liked && "fill-primary text-primary")} /> 
                        <span>{comment.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowReplyForm(!showReplyForm)}>
                        <MessageSquare className="w-3 h-3" /> 
                        <span>Répondre</span>
                    </Button>
                </div>
                {showReplyForm && (
                    <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
                        <Input 
                          value={replyContent} 
                          onChange={(e) => setReplyContent(e.target.value)} 
                          placeholder="Écrire une réponse..."
                          disabled={isReplying}
                        />
                        <Button type="submit" size="icon" disabled={isReplying || replyContent.trim() === ""}>
                            {isReplying ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                        </Button>
                    </form>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-4 space-y-4">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} onInteraction={onInteraction} postId={postId} fetchComments={fetchComments} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
