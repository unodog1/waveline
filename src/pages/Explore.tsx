import { useSeoMeta } from '@unhead/react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileNav } from '@/components/MobileNav';
import { useAuthor } from '@/hooks/useAuthor';
import { useFollowActions } from '@/hooks/useFollowActions';
import { genUserName } from '@/lib/genUserName';
import { Search, ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useState } from 'react';

function UserCard({ pubkey }: { pubkey: string }) {
  const navigate = useNavigate();
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const { follow, unfollow, isFollowing, isLoading } = useFollowActions();

  const following = isFollowing(pubkey);

  const handleClick = () => {
    const npub = nip19.npubEncode(pubkey);
    navigate(`/profile/${npub}`);
  };

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (following) {
      unfollow(pubkey);
    } else {
      follow(pubkey);
    }
  };

  return (
    <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors cursor-pointer" onClick={handleClick}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14 ring-2 ring-primary/20">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-bold text-lg">
              {(metadata?.name || genUserName(pubkey)).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{metadata?.name || genUserName(pubkey)}</p>
            <p className="text-sm text-muted-foreground truncate">{metadata?.about}</p>
          </div>
          <Button
            onClick={handleFollowToggle}
            disabled={isLoading}
            size="sm"
            className={`rounded-xl font-bold ${
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

export default function Explore() {
  const navigate = useNavigate();
  const { nostr } = useNostr();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['explore-users'],
    queryFn: async () => {
      // Get recent kind 0 (metadata) events from different users
      const events = await nostr.query([
        {
          kinds: [0],
          limit: 50,
        },
      ]);

      // Get unique pubkeys
      const uniquePubkeys = Array.from(new Set(events.map((e) => e.pubkey)));
      return uniquePubkeys.slice(0, 20);
    },
  });

  useSeoMeta({
    title: 'Explore - Waveline',
    description: 'Discover new people on Nostr',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 pb-20 lg:pb-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            size="icon"
            className="rounded-xl hover:bg-primary/10 lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            [...Array(10)].map((_, i) => (
              <Card key={i} className="border-primary/10 bg-card/50">
                <CardContent className="pt-6">
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
            users
              .filter((pubkey) => {
                if (!searchQuery) return true;
                // Simple filter - would need metadata to search properly
                return pubkey.includes(searchQuery.toLowerCase());
              })
              .map((pubkey) => <UserCard key={pubkey} pubkey={pubkey} />)
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
