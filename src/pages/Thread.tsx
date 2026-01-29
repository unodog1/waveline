import { useSeoMeta } from '@unhead/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageCircle, Repeat2, Heart, Zap } from 'lucide-react';
import { NoteContent } from '@/components/NoteContent';
import { genUserName } from '@/lib/genUserName';
import { ZapButton } from '@/components/ZapButton';
import { ReplyDialog } from '@/components/ReplyDialog';
import { Layout } from '@/components/Layout';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { useState } from 'react';

function PostCard({ event, isMainPost = false }: { event: NostrEvent; isMainPost?: boolean }) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const author = useAuthor(event.pubkey);
  const authorMetadata = author.data?.metadata;
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const getRelativeTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleProfileClick = () => {
    const npub = nip19.npubEncode(event.pubkey);
    navigate(`/profile/${npub}`);
  };

  const handleReply = () => {
    if (!user) {
      toast({ title: 'Please log in to reply', variant: 'destructive' });
      return;
    }
    setReplyDialogOpen(true);
  };

  const handleRepost = () => {
    if (!user) {
      toast({ title: 'Please log in to repost', variant: 'destructive' });
      return;
    }
    if (isReposted) return;

    publishEvent(
      { kind: 6, content: JSON.stringify(event), tags: [['e', event.id], ['p', event.pubkey]] },
      {
        onSuccess: () => {
          setIsReposted(true);
          toast({ title: '🌊 Reposted!' });
        },
      }
    );
  };

  const handleLike = () => {
    if (!user) {
      toast({ title: 'Please log in to like', variant: 'destructive' });
      return;
    }
    if (isLiked) return;

    publishEvent(
      { kind: 7, content: '+', tags: [['e', event.id], ['p', event.pubkey]] },
      {
        onSuccess: () => {
          setIsLiked(true);
          toast({ title: '❤️ Liked!' });
        },
      }
    );
  };

  return (
    <>
      <ReplyDialog event={event} open={replyDialogOpen} onOpenChange={setReplyDialogOpen} />
      <Card className={`border-primary/10 bg-card/50 backdrop-blur-sm ${!isMainPost && 'hover:bg-card/60 transition-colors'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar 
              className="w-12 h-12 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all"
              onClick={handleProfileClick}
            >
              <AvatarImage src={authorMetadata?.picture} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                {(authorMetadata?.name || genUserName(event.pubkey)).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className="font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={handleProfileClick}
                >
                  {authorMetadata?.name || genUserName(event.pubkey)}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {event.pubkey.slice(0, 8)}...
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {isMainPost 
                    ? new Date(event.created_at * 1000).toLocaleString()
                    : getRelativeTime(event.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className={`text-foreground leading-relaxed whitespace-pre-wrap break-words ${isMainPost ? 'text-lg' : 'text-[15px]'}`}>
            <NoteContent event={event} />
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-primary/10">
            <button 
              onClick={handleReply}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border border-accent/20"
            >
              <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-all" strokeWidth={2.5} />
              <span className="text-sm font-bold">{event.tags.filter(([t]) => t === 'e').length || 'Reply'}</span>
            </button>
            <button 
              onClick={handleRepost}
              disabled={isReposted}
              className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border ${
                isReposted 
                  ? 'bg-gradient-to-br from-accent/30 to-accent/20 text-accent cursor-not-allowed border-accent/30' 
                  : 'bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent border-accent/20'
              }`}
            >
              <Repeat2 className="w-5 h-5 group-hover/btn:rotate-180 transition-all duration-300" strokeWidth={2.5} />
              <span className="text-sm font-bold">Repost</span>
            </button>
            <button 
              onClick={handleLike}
              disabled={isLiked}
              className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border ${
                isLiked 
                  ? 'bg-gradient-to-br from-accent/30 to-accent/20 text-accent cursor-not-allowed border-accent/30' 
                  : 'bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent border-accent/20'
              }`}
            >
              <Heart className={`w-5 h-5 group-hover/btn:scale-125 transition-all ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
              <span className="text-sm font-bold">Like</span>
            </button>
            <div className="flex-1 flex items-center justify-center h-11 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] border border-accent/20">
              <ZapButton 
                target={event as any} 
                className="flex items-center justify-center gap-2 text-accent w-full h-full group/btn font-bold"
                showCount={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function Thread() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { nostr } = useNostr();

  // Decode note ID
  let eventId: string | undefined;
  try {
    if (noteId?.startsWith('note')) {
      const decoded = nip19.decode(noteId);
      if (decoded.type === 'note') {
        eventId = decoded.data;
      }
    } else if (noteId?.startsWith('nevent')) {
      const decoded = nip19.decode(noteId);
      if (decoded.type === 'nevent') {
        eventId = decoded.data.id;
      }
    } else {
      eventId = noteId;
    }
  } catch (e) {
    console.error('Invalid note ID:', e);
  }

  // Fetch main post
  const { data: mainPost, isLoading: mainLoading } = useQuery({
    queryKey: ['thread', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const events = await nostr.query([{ ids: [eventId], limit: 1 }]);
      return events[0] || null;
    },
    enabled: !!eventId,
  });

  // Fetch replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['thread-replies', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const events = await nostr.query([{ kinds: [1], '#e': [eventId], limit: 100 }]);
      return events.sort((a, b) => a.created_at - b.created_at);
    },
    enabled: !!eventId,
  });

  useSeoMeta({
    title: 'Thread - Waveline',
    description: 'View conversation thread',
  });

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <p className="text-muted-foreground">Invalid thread</p>
      </div>
    );
  }

  return (
    <Layout showSearch={false}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 rounded-xl hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {mainLoading ? (
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="pt-6 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : mainPost ? (
          <PostCard event={mainPost} isMainPost={true} />
        ) : (
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Post not found</p>
            </CardContent>
          </Card>
        )}

        {replies.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold px-2">
              Replies ({replies.length})
            </h3>
            {replies.map((reply) => (
              <PostCard key={reply.id} event={reply} />
            ))}
          </div>
        )}

        {!repliesLoading && replies.length === 0 && mainPost && (
          <Card className="border-dashed border-primary/20">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No replies yet. Be the first to respond! 🌊</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
