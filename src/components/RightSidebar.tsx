import { useNavigate } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthor } from '@/hooks/useAuthor';
import { useFollowActions } from '@/hooks/useFollowActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { genUserName } from '@/lib/genUserName';
import { Hash, TrendingUp, UserPlus, Sparkles } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useNavigate as useRouterNavigate } from 'react-router-dom';

function SuggestedUser({ pubkey }: { pubkey: string }) {
  const navigate = useRouterNavigate();
  const navigate = useNavigate();
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const { follow, isFollowing, isLoading } = useFollowActions();
  const following = isFollowing(pubkey);

  return (
    <div className="flex items-center gap-3 group">
      <Avatar 
        className="w-10 h-10 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all"
        onClick={() => {
          const npub = nip19.npubEncode(pubkey);
          navigate(`/profile/${npub}`);
        }}
      >
        <AvatarImage src={metadata?.picture} />
        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-sm">
          {(metadata?.name || genUserName(pubkey)).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          const npub = nip19.npubEncode(pubkey);
          navigate(`/profile/${npub}`);
        }}
      >
        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
          {metadata?.name || genUserName(pubkey)}
        </p>
        {metadata?.nip05 && (
          <p className="text-xs text-accent truncate">✓ {metadata.nip05}</p>
        )}
      </div>
      {!following && (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            follow(pubkey);
          }}
          disabled={isLoading}
          className="rounded-xl bg-gradient-to-r from-primary to-accent font-bold h-8 px-3 shrink-0"
        >
          <UserPlus className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

function TrendingHashtag({ tag, count }: { tag: string; count: number }) {
  const navigate = useRouterNavigate();

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-all group"
      onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
          <Hash className="w-5 h-5 text-accent" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-bold text-sm group-hover:text-primary transition-colors">
            #{tag}
          </p>
          <p className="text-xs text-muted-foreground">
            {count.toLocaleString()} posts
          </p>
        </div>
      </div>
      <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
    </div>
  );
}

export function RightSidebar() {
  const { nostr } = useNostr();
  const navigate = useRouterNavigate();

  // Fetch suggested users to follow
  const { data: suggestedUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [0],
          limit: 100,
        },
      ]);

      // Get unique pubkeys and limit to 5
      const uniquePubkeys = Array.from(new Set(events.map((e) => e.pubkey)));
      return uniquePubkeys.slice(0, 5);
    },
    staleTime: 300000, // 5 minutes
  });

  // Fetch trending hashtags
  const { data: trendingTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [1],
          limit: 200,
        },
      ]);

      // Extract hashtags from posts
      const tagCounts = new Map<string, number>();
      
      for (const event of events) {
        const tTags = event.tags.filter(([name]) => name === 't');
        for (const [, tag] of tTags) {
          if (tag) {
            const lower = tag.toLowerCase();
            tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
          }
        }
      }

      // Sort by count and return top 5
      return Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));
    },
    staleTime: 300000, // 5 minutes
  });

  return (
    <aside className="hidden xl:block fixed right-0 top-0 h-screen w-80 border-l border-primary/10 bg-background/80 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Trending Hashtags */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" strokeWidth={2.5} />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tagsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : trendingTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trending tags yet
              </p>
            ) : (
              trendingTags.map(({ tag, count }) => (
                <TrendingHashtag key={tag} tag={tag} count={count} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Suggested Users */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" strokeWidth={2.5} />
              Who to Follow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usersLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            ) : suggestedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No suggestions yet
              </p>
            ) : (
              suggestedUsers.map((pubkey) => (
                <SuggestedUser key={pubkey} pubkey={pubkey} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Trending Posts Preview */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Hash className="w-5 h-5 text-accent" strokeWidth={2.5} />
              Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['nostr', 'bitcoin', 'technology', 'freedom', 'privacy'].map((topic) => (
                <Badge 
                  key={topic}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all rounded-xl px-3 py-1"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}
                >
                  #{topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
