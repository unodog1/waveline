import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useMuteList } from '@/hooks/useMuteList';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Repeat2, Heart, MoreHorizontal, VolumeX, Volume2 } from 'lucide-react';
import { ZapButton } from '@/components/ZapButton';
import { ReplyDialog } from '@/components/ReplyDialog';
import { QuotePostDialog } from '@/components/QuotePostDialog';
import { MediaEmbed } from '@/components/MediaEmbed';
import { LinkPreview } from '@/components/LinkPreview';
import { NoteContent } from '@/components/NoteContent';
import { genUserName } from '@/lib/genUserName';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

interface PostProps {
  event: NostrEvent;
  showThread?: boolean;
  isMainPost?: boolean;
}

export function Post({ event: rawEvent, showThread = true, isMainPost = false }: PostProps) {
  const navigate = useNavigate();
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { mutate: publishEvent } = useNostrPublish();
  const { isMuted, toggleMute } = useMuteList();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Check if this is a repost (kind 6)
  const isRepost = rawEvent.kind === 6;
  let repostedEvent: NostrEvent | null = null;
  let reposter = useAuthor(rawEvent.pubkey);
  
  if (isRepost) {
    try {
      repostedEvent = JSON.parse(rawEvent.content);
    } catch (e) {
      console.error('Failed to parse repost:', e);
    }
  }

  // Use the reposted event if it exists, otherwise use the original event
  const event = repostedEvent || rawEvent;
  const author = useAuthor(event.pubkey);
  const authorMetadata = author.data?.metadata;
  const reposterMetadata = reposter.data?.metadata;

  // Check for quoted event (q tag)
  const quotedEventId = event.tags.find(([t]) => t === 'q')?.[1];
  
  // Fetch quoted event if exists
  const { data: quotedEvent } = useQuery({
    queryKey: ['quoted-event', quotedEventId],
    queryFn: async () => {
      if (!quotedEventId) return null;
      const events = await nostr.query([{ ids: [quotedEventId], limit: 1 }]);
      return events[0] || null;
    },
    enabled: !!quotedEventId,
  });

  // Extract URLs from content
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const urls = extractUrls(event.content);
  
  // Separate media URLs from regular URLs
  const mediaUrls = urls.filter(url => 
    /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov)$/i.test(url) ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('spotify.com') ||
    url.includes('music.apple.com') ||
    url.includes('soundcloud.com')
  );

  const regularUrls = urls.filter(url => !mediaUrls.includes(url)).slice(0, 1); // Show first link preview

  const getRelativeTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const npub = nip19.npubEncode(event.pubkey);
    navigate(`/profile/${npub}`);
  };

  const handlePostClick = () => {
    if (!showThread) return;
    const noteId = nip19.noteEncode(event.id);
    navigate(`/thread/${noteId}`);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in to reply', variant: 'destructive' });
      return;
    }
    setReplyDialogOpen(true);
  };

  const handleSimpleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReposted) return;

    publishEvent(
      { kind: 6, content: JSON.stringify(event), tags: [['e', event.id], ['p', event.pubkey]] },
      {
        onSuccess: () => {
          setIsReposted(true);
          setRepostMenuOpen(false);
          toast({ title: '🌊 Reposted!' });
        },
      }
    );
  };

  const handleQuotePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRepostMenuOpen(false);
    setQuoteDialogOpen(true);
  };

  const handleRepostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in to repost', variant: 'destructive' });
      return;
    }
    setRepostMenuOpen(!repostMenuOpen);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in to mute', variant: 'destructive' });
      return;
    }
    toggleMute(event.pubkey);
    setMoreMenuOpen(false);
    toast({ 
      title: isMuted(event.pubkey) ? '🔊 User unmuted' : '🔇 User muted',
      description: isMuted(event.pubkey) ? 'You will now see their posts' : 'You will no longer see their posts'
    });
  };

  return (
    <>
      <ReplyDialog event={event} open={replyDialogOpen} onOpenChange={setReplyDialogOpen} />
      <QuotePostDialog event={event} open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
      
      <Card 
        className={`border-primary/10 bg-card/50 backdrop-blur-sm transition-all duration-300 group overflow-hidden ${
          showThread ? 'hover:bg-card/60 hover:border-primary/20 cursor-pointer' : ''
        }`}
        onClick={showThread ? handlePostClick : undefined}
      >
        {isRepost && (
          <div className="px-6 pt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat2 className="w-4 h-4 text-accent" />
            <span className="font-medium">
              {reposterMetadata?.name || genUserName(rawEvent.pubkey)} reposted
            </span>
          </div>
        )}
        
        <CardHeader className={isRepost ? "pb-3 pt-2" : "pb-3"}>
          <div className="flex items-start gap-3">
            <Avatar 
              className="w-12 h-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/40 cursor-pointer"
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
            {user && user.pubkey !== event.pubkey && (
              <DropdownMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
                  <DropdownMenuItem 
                    onClick={handleMuteToggle}
                    className="cursor-pointer rounded-xl font-semibold"
                  >
                    {isMuted(event.pubkey) ? (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Unmute User
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Mute User
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Post Content */}
          <div className={`text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${isMainPost ? 'text-lg' : 'text-[15px]'}`}>
            <NoteContent event={event} />
          </div>

          {/* Media Embeds */}
          {mediaUrls.map((url, index) => (
            <MediaEmbed key={index} url={url} />
          ))}

          {/* Link Preview for first non-media URL */}
          {regularUrls.map((url, index) => (
            <LinkPreview key={index} url={url} />
          ))}

          {/* Quoted Post */}
          {quotedEvent && (
            <Card className="border-primary/10 bg-background/50 mt-3">
              <CardContent className="pt-4">
                <div className="flex gap-3 mb-2">
                  <Avatar className="w-8 h-8 ring-1 ring-primary/20">
                    <AvatarImage src={useAuthor(quotedEvent.pubkey).data?.metadata?.picture} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-xs">
                      {(useAuthor(quotedEvent.pubkey).data?.metadata?.name || genUserName(quotedEvent.pubkey)).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">
                      {useAuthor(quotedEvent.pubkey).data?.metadata?.name || genUserName(quotedEvent.pubkey)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-foreground/80 line-clamp-4 overflow-hidden break-words">
                  <NoteContent event={quotedEvent} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-3 border-t border-primary/10">
            <button 
              onClick={handleReply}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border border-accent/20"
            >
              <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 group-hover/btn:scale-110 transition-all" strokeWidth={2.5} />
              <span className="text-xs sm:text-sm font-bold hidden xs:inline">
                {event.tags.filter(([t]) => t === 'e').length || 'Reply'}
              </span>
              <span className="text-xs sm:text-sm font-bold xs:hidden">
                {event.tags.filter(([t]) => t === 'e').length || 0}
              </span>
            </button>

            <DropdownMenu open={repostMenuOpen} onOpenChange={setRepostMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  onClick={handleRepostClick}
                  disabled={isReposted}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 rounded-xl sm:rounded-2xl transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border ${
                    isReposted 
                      ? 'bg-gradient-to-br from-accent/30 to-accent/20 text-accent cursor-not-allowed border-accent/30' 
                      : 'bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent border-accent/20'
                  }`}
                >
                  <Repeat2 className="w-4 sm:w-5 h-4 sm:h-5 group-hover/btn:rotate-180 transition-all duration-300" strokeWidth={2.5} />
                  <span className="text-xs sm:text-sm font-bold hidden xs:inline">Repost</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
                <DropdownMenuItem 
                  onClick={handleSimpleRepost}
                  className="cursor-pointer rounded-xl font-semibold"
                >
                  <Repeat2 className="w-4 h-4 mr-2" />
                  Repost
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleQuotePost}
                  className="cursor-pointer rounded-xl font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Quote Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              onClick={handleLike}
              disabled={isLiked}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 rounded-xl sm:rounded-2xl transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border ${
                isLiked 
                  ? 'bg-gradient-to-br from-accent/30 to-accent/20 text-accent cursor-not-allowed border-accent/30' 
                  : 'bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent border-accent/20'
              }`}
            >
              <Heart className={`w-4 sm:w-5 h-4 sm:h-5 group-hover/btn:scale-125 transition-all ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
              <span className="text-xs sm:text-sm font-bold hidden xs:inline">Like</span>
            </button>

            <div className="flex-1 flex items-center justify-center h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] border border-accent/20">
              <ZapButton 
                target={event as any} 
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-accent w-full h-full group/btn font-bold text-xs sm:text-sm"
                showCount={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
