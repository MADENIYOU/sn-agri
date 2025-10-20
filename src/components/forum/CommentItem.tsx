'use client';

import { useState, useTransition, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CommentWithAuthor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addForumPostComment, toggleForumCommentLike, getForumComments } from '@/app/(app)/forum/actions';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function CommentItem({
  comment,
  postId,
  fetchComments,
  canInteract,
  isAuthenticated
}: {
  comment: CommentWithAuthor;
  postId: string;
  fetchComments: () => void;
  canInteract: boolean;
  isAuthenticated: boolean;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, startReplyTransition] = useTransition();
  const [isLiking, startLikeTransition] = useTransition();
  const [replies, setReplies] = useState<CommentWithAuthor[]>(comment.replies || []);
  const router = useRouter();

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() === '') return;
    if (!isAuthenticated) {
        toast({ variant: 'destructive', description: 'Connectez-vous pour répondre.' });
        router.push('/login');
        return;
    }
    if (!canInteract) {
        toast({ variant: 'destructive', description: 'Suivez le forum pour interagir.' });
        return;
    }

    startReplyTransition(async () => {
      const { comment: newReply, error } = await addForumPostComment({
        postId,
        content: replyContent,
        parentId: comment.id,
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: error });
      } else if (newReply) {
        setReplyContent('');
        setShowReplyInput(false);
        setReplies((prev) => [...prev, newReply]);
        fetchComments(); // Refresh parent comments to update count
      }
    });
  };

  const handleLikeClick = () => {
    if (!isAuthenticated) {
        toast({ variant: 'destructive', description: 'Connectez-vous pour aimer un commentaire.' });
        router.push('/login');
        return;
    }
    if (!canInteract) {
        toast({ variant: 'destructive', description: 'Suivez le forum pour interagir.' });
        return;
    }

    startLikeTransition(async () => {
      const { success, error } = await toggleForumCommentLike(comment.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: error });
      } else if (success) {
        fetchComments(); // Refresh comments to update like count
      }
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map((n:string) => n[0]).join('');
  };

  return (
    <div className="flex items-start space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.name} />
        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className="font-semibold text-sm">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
          </p>
        </div>
        <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs flex items-center gap-1"
            onClick={handleLikeClick}
            disabled={isLiking || !isAuthenticated}
          >
            <ThumbsUp className={cn("w-3 h-3", comment.user_has_liked && "fill-primary text-primary")} />
            <span>{comment.likes}</span>
          </Button>
          {canInteract && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              Répondre
            </Button>
          )}
        </div>

        {showReplyInput && canInteract && (
          <form onSubmit={handleReplySubmit} className="flex gap-2 mt-3">
            <Input
              placeholder="Écrire une réponse..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={isReplying}
            />
            <Button type="submit" size="icon" disabled={isReplying || replyContent.trim() === ''}>
              {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}

        <div className="ml-6 mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              fetchComments={fetchComments}
              canInteract={canInteract}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
