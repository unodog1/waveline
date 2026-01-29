import { useSeoMeta } from '@unhead/react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, UserPlus, UserMinus } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { useFollowActions } from '@/hooks/useFollowActions';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

function UserResult({ pubkey }: { pubkey: string }) {
  const navigate = useNavigate();
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const { follow, unfollow, isFollowing, isLoading } = useFollowActions();
  const following = isFollowing(pubkey);

  return (
    <Card 
      className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors cursor-pointer"
      onClick={() => {
        const npub = nip19.npubEncode(pubkey);
        navigate(`/profile/${npub}`);
      }}
    >
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14 ring-2 ring-primary/20">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-bold text-lg">
              {(metadata?.name || genUserName(pubkey)).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{metadata?.name || genUserName(pubkey)}</p>
            {metadata?.nip05 && (
              <p className="text-xs text-accent truncate">✓ {metadata.nip05}</p>
            )}
            <p className="text-sm text-muted-foreground truncate line-clamp-2">{metadata?.about}</p>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              following ? unfollow(pubkey) : follow(pubkey);
            }}
            disabled={isLoading}
            size="sm"
            className={`rounded-xl font-bold shrink-0 ${
              following 
                ? 'bg-accent/20 text-accent border-2 border-accent/30' 
                : 'bg-gradient-to-r from-primary to-accent'
            }`}
            variant={following ? 'outline' : 'default'}
          >
            {following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PostResult({ event, onClick }: { event: NostrEvent; onClick: () => void }) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;

  const getRelativeTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <Card 
      className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-sm">
              {(metadata?.name || genUserName(event.pubkey)).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm truncate">
                {metadata?.name || genUserName(event.pubkey)}
              </span>
              <span className="text-xs text-muted-foreground">
                · {getRelativeTime(event.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
          <NoteContent event={event} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const { nostr } = useNostr();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');

  // Search users by name/nip05
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['search-users', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      // Query recent metadata events
      const events = await nostr.query([
        {
          kinds: [0],
          limit: 100,
        },
      ]);

      // Parse and filter metadata
      const results: Array<{ pubkey: string; metadata: any; score: number }> = [];
      
      for (const event of events) {
        try {
          const metadata = JSON.parse(event.content);
          const searchLower = query.toLowerCase();
          
          let score = 0;
          if (metadata.name?.toLowerCase().includes(searchLower)) score += 10;
          if (metadata.nip05?.toLowerCase().includes(searchLower)) score += 8;
          if (metadata.about?.toLowerCase().includes(searchLower)) score += 3;
          if (metadata.display_name?.toLowerCase().includes(searchLower)) score += 7;
          
          if (score > 0) {
            results.push({ pubkey: event.pubkey, metadata, score });
          }
        } catch (e) {
          // Skip invalid metadata
        }
      }

      // Sort by relevance and return unique pubkeys
      return results
        .sort((a, b) => b.score - a.score)
        .map((r) => r.pubkey)
        .filter((pubkey, index, self) => self.indexOf(pubkey) === index)
        .slice(0, 20);
    },
    enabled: query.length >= 2,
  });

  // Search posts by content
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const events = await nostr.query([
        {
          kinds: [1],
          search: query,
          limit: 50,
        },
      ]);

      return events
        .filter((e) => !e.tags.some(([t]) => t === 'e')) // Filter out replies
        .sort((a, b) => b.created_at - a.created_at);
    },
    enabled: query.length >= 2,
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  useSeoMeta({
    title: query ? `Search: ${query} - Waveline` : 'Search - Waveline',
    description: 'Search users and posts on Nostr',
  });

  return (
    <Layout showSearch={false}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users, posts, hashtags..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50"
              autoFocus
            />
          </div>
        </div>

        {query.length >= 2 ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'users' | 'posts')} className="space-y-6">
            <TabsList className="bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl w-full">
              <TabsTrigger value="users" className="flex-1 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
                Posts ({posts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-3">
              {usersLoading ? (
                [...Array(5)].map((_, i) => (
                  <Card key={i} className="border-primary/10 bg-card/50">
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        <Skeleton className="w-14 h-14 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : users.length === 0 ? (
                <Card className="border-dashed border-primary/20">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </CardContent>
                </Card>
              ) : (
                users.map((pubkey) => <UserResult key={pubkey} pubkey={pubkey} />)
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-3">
              {postsLoading ? (
                [...Array(5)].map((_, i) => (
                  <Card key={i} className="border-primary/10 bg-card/50">
                    <CardContent className="pt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                <Card className="border-dashed border-primary/20">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No posts found</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((event) => (
                  <PostResult 
                    key={event.id} 
                    event={event}
                    onClick={() => {
                      const noteId = nip19.noteEncode(event.id);
                      navigate(`/thread/${noteId}`);
                    }}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Search for users, posts, and hashtags
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Type at least 2 characters to start searching
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
