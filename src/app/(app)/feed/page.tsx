import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FEED_POSTS } from "@/lib/constants";
import { ThumbsUp, MessageSquare, Share2, Send } from "lucide-react";
import Image from "next/image";

export default function FeedPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Community Feed</h1>
        <p className="text-muted-foreground">
          Connect, share, and learn with the Senegalese agricultural community.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="/avatars/01.png" alt="Moussa Faye" />
              <AvatarFallback>MF</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <Textarea placeholder="What's on your mind, Moussa?" />
              <div className="flex justify-end">
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {FEED_POSTS.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">{post.author.role} &middot; {post.timestamp}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{post.content}</p>
              {post.image && (
                <div className="mt-4 rounded-lg overflow-hidden border">
                  <Image
                    src={post.image.src}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="w-full object-cover"
                    data-ai-hint={post.image.aiHint}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" /> <span>{post.likes} Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> <span>{post.comments} Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" /> <span>Share</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
