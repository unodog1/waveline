import { useSeoMeta } from '@unhead/react';
import { useParams } from 'react-router-dom';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { nip19 } from 'nostr-tools';
import { Calendar, ExternalLink, MapPin, Link as LinkIcon, MessageCircle, Repeat2, Heart, Zap } from 'lucide-react';
import { ZapButton } from '@/components/ZapButton';
import type { NostrEvent } from '@nostrify/nostrify';

export default function Profile() {
  const { npub } = useParams<{ npub: string }>();
  const { user: currentUser } = useCurrentUser();
  const { nostr } = useNostr();

  // Decode npub to hex pubkey
  let pubkey: string | undefined;
  try {
    if (npub?.startsWith('npub')) {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        pubkey = decoded.data;
      }
    } else {
      pubkey = npub;
    }
  } catch (e) {
    console.error('Invalid npub:', e);
  }

  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;

  // Fetch user's posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['profile-posts', pubkey],
    queryFn: async () => {
      if (!pubkey) return [];
      const events = await nostr.query([
        {
          kinds: [1],
          authors: [pubkey],
          limit: 50,
        },
      ]);
      return events
        .filter((e) => !e.tags.some(([t]) => t === 'e')) // Filter out replies
        .sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
  });

  useSeoMeta({
    title: `${metadata?.name || genUserName(pubkey || '')} - Waveline`,
    description: metadata?.about || 'View profile on Waveline',
  });

  if (!pubkey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid profile</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.pubkey === pubkey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            {/* Banner placeholder */}
            <div className="h-32 -mx-6 -mt-6 mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-t-xl" />

            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="-mt-20 relative">
                <Avatar className="w-32 h-32 ring-4 ring-background">
                  <AvatarImage src={metadata?.picture} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-bold text-3xl">
                    {(metadata?.name || genUserName(pubkey)).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold">{metadata?.name || genUserName(pubkey)}</h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    {pubkey.slice(0, 8)}...{pubkey.slice(-8)}
                  </p>
                </div>

                {metadata?.about && (
                  <p className="text-foreground/90 leading-relaxed">{metadata.about}</p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {metadata?.website && (
                    <a
                      href={metadata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {new URL(metadata.website).hostname}
                    </a>
                  )}
                  {metadata?.nip05 && (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" />
                      {metadata.nip05}
                    </div>
                  )}
                </div>

                {!isOwnProfile && currentUser && (
                  <div className="flex gap-2 pt-2">
                    <Button className="rounded-xl bg-gradient-to-r from-primary to-accent font-bold">
                      Follow
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-2">Posts</h2>
          {postsLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="border-primary/10 bg-card/50">
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card className="border-dashed border-primary/20">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet 🌊</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((event) => (
              <Card key={event.id} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap break-words">
                    <NoteContent event={event} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(event.created_at * 1000).toLocaleDateString()}</span>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {event.tags.filter(([t]) => t === 'e').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
