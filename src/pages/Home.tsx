import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { LoginArea } from '@/components/auth/LoginArea';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Waves, Home as HomeIcon, Bell, Mail, Search, User, MessageCircle, Repeat2, Heart, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '@/hooks/useFeed';
import { useFollowing } from '@/hooks/useFollowing';
import type { NostrEvent } from '@nostrify/nostrify';
import { NoteContent } from '@/components/NoteContent';
import { genUserName } from '@/lib/genUserName';
import { ZapButton } from '@/components/ZapButton';
import { ComposeDialog } from '@/components/ComposeDialog';
import { ReplyDialog } from '@/components/ReplyDialog';
import { QuotePostDialog } from '@/components/QuotePostDialog';
import { MobileNav } from '@/components/MobileNav';
import { nip19 } from 'nostr-tools';

type FeedType = 'following' | 'global' | 'trending';

// Post component to display a single Nostr event  
function Post({ event: rawEvent }: { event: NostrEvent }) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);

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

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const npub = nip19.npubEncode(event.pubkey);
    navigate(`/profile/${npub}`);
  };

  const handlePostClick = () => {
    const noteId = nip19.noteEncode(event.id);
    navigate(`/thread/${noteId}`);
  };

  // Format relative time
  const getRelativeTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Handle reply
  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in to reply', variant: 'destructive' });
      return;
    }
    setReplyDialogOpen(true);
  };

  // Handle simple repost (NIP-18 kind 6)
  const handleSimpleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReposted) return;

    publishEvent(
      {
        kind: 6,
        content: JSON.stringify(event),
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
        ],
      },
      {
        onSuccess: () => {
          setIsReposted(true);
          setRepostMenuOpen(false);
          toast({ title: '🌊 Reposted!' });
        },
      }
    );
  };

  // Handle quote post
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

  // Handle like (NIP-25 kind 7 reaction)
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in to like', variant: 'destructive' });
      return;
    }
    if (isLiked) return;

    publishEvent(
      {
        kind: 7,
        content: '+',
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
        ],
      },
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
      <QuotePostDialog event={event} open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
      <Card 
        className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 group overflow-hidden cursor-pointer"
        onClick={handlePostClick}
      >
        {isRepost && (
          <div className="px-6 pt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat2 className="w-4 h-4" />
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
              <div className="flex items-center gap-2">
                <span 
                  className="font-bold truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text cursor-pointer hover:text-primary transition-colors"
                  onClick={handleProfileClick}
                >
                  {authorMetadata?.name || genUserName(event.pubkey)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {getRelativeTime(event.created_at)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 truncate font-mono">
                {event.pubkey.slice(0, 8)}...{event.pubkey.slice(-4)}
              </p>
            </div>
          </div>
        </CardHeader>
      <CardContent className="pt-0">
        <div className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap break-words text-[15px]">
          <NoteContent event={event} />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 pt-4 border-t border-primary/10">
          {/* Reply Button */}
          <button 
            onClick={handleReply}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent hover:text-accent transition-all duration-200 group/btn font-bold shadow-sm hover:shadow-md hover:scale-[1.02] border border-accent/20"
          >
            <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 group-hover/btn:scale-110 transition-all" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-bold hidden xs:inline">
              {event.tags.filter(([t]) => t === 'e').length || 'Reply'}
            </span>
            <span className="text-xs sm:text-sm font-bold xs:hidden">
              {event.tags.filter(([t]) => t === 'e').length || 0}
            </span>
          </button>

          {/* Repost/Quote Button */}
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

          {/* Like Button */}
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

          {/* Zap Button */}
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

const Home = () => {
  const navigate = useNavigate();
  const { user, metadata } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const [feedType, setFeedType] = useState<FeedType>('following');

  // Fetch following list
  const { data: followingPubkeys = [] } = useFollowing(user?.pubkey);

  // Fetch feed based on feed type
  const { data: posts = [], isLoading } = useFeed(feedType, followingPubkeys);

  const handleViewOwnProfile = () => {
    if (user) {
      const npub = nip19.npubEncode(user.pubkey);
      navigate(`/profile/${npub}`);
    }
  };

  useSeoMeta({
    title: 'Home - Waveline',
    description: 'Your ocean of connections on Nostr',
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Subtle animated background */}
      <div className="absolute inset-0 isolate -z-10 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-gradient-shift" />
      </div>

      {/* Navigation Sidebar - Hidden on mobile */}
      <aside className="hidden lg:fixed lg:flex left-0 top-0 h-screen w-72 border-r border-primary/10 bg-background/80 backdrop-blur-xl p-6 flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Waves className="w-8 h-8 text-primary" strokeWidth={2.5} />
            <div className="absolute inset-0 blur-lg bg-primary/50 -z-10" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Waveline
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-base h-12 bg-primary/10 hover:bg-primary/20"
          >
            <HomeIcon className="w-5 h-5" />
            Home
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-base h-12 hover:bg-primary/10"
            onClick={() => navigate('/explore')}
          >
            <Search className="w-5 h-5" />
            Explore
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-base h-12 hover:bg-primary/10"
            onClick={() => navigate('/notifications')}
            disabled={!user}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-base h-12 hover:bg-primary/10"
            disabled={true}
          >
            <Mail className="w-5 h-5" />
            Messages
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-base h-12 hover:bg-primary/10"
            onClick={handleViewOwnProfile}
            disabled={!user}
          >
            <User className="w-5 h-5" />
            Profile
          </Button>
        </nav>

        {/* Compose Button */}
        <ComposeDialog>
          <Button 
            size="lg"
            disabled={!user}
            className="w-full mt-4 rounded-2xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-bold text-base"
          >
            Create Wave
          </Button>
        </ComposeDialog>

        {/* User Profile at Bottom */}
        <div className="mt-auto pt-6 border-t border-primary/10">
          {user ? (
            <div 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
              onClick={handleViewOwnProfile}
            >
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={metadata?.picture} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {metadata?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{metadata?.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.pubkey.slice(0, 8)}...
                </p>
              </div>
            </div>
          ) : (
            <LoginArea className="w-full" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 border-b border-primary/10 bg-background/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <Waves className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Waveline
              </span>
            </div>

            {/* Search bar - hidden on small mobile */}
            <div className="hidden sm:flex flex-1 max-w-xl lg:max-w-2xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Waveline..." 
                  className="pl-10 rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full hover:bg-primary/10"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-primary" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </Button>
              {/* Mobile compose button */}
              <ComposeDialog>
                <Button 
                  size="icon"
                  disabled={!user}
                  className="lg:hidden rounded-full bg-gradient-to-r from-primary to-accent"
                >
                  <Waves className="w-5 h-5" />
                </Button>
              </ComposeDialog>
            </div>
          </div>
        </header>

        {/* Feed Container */}
        <div className="max-w-2xl mx-auto py-4 lg:py-6 px-3 sm:px-4 pb-20 lg:pb-6">
          {/* Feed Type Selector */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 h-12"
                >
                  <span className="font-semibold">
                    {feedType === 'following' && 'Following'}
                    {feedType === 'global' && 'Global'}
                    {feedType === 'trending' && 'Trending'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-320px)] max-w-2xl rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
                <DropdownMenuItem 
                  onClick={() => setFeedType('following')}
                  className="cursor-pointer rounded-xl"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Following</span>
                    <span className="text-xs text-muted-foreground">Posts from people you follow</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFeedType('global')}
                  className="cursor-pointer rounded-xl"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Global</span>
                    <span className="text-xs text-muted-foreground">All posts from the network</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFeedType('trending')}
                  className="cursor-pointer rounded-xl"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Trending</span>
                    <span className="text-xs text-muted-foreground">Popular posts right now</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <Card key={i} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : posts.length === 0 ? (
              // Empty state
              <Card className="border-dashed border-primary/20">
                <CardContent className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <Waves className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {feedType === 'following' 
                        ? "No posts from people you follow yet. Try switching to the Global feed or follow some users!"
                        : "No posts found. The ocean is quiet right now. 🌊"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Display posts
              posts.map((event) => <Post key={event.id} event={event} />)
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Floating animation styles */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(20px, 20px) scale(1.1);
            opacity: 1;
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
