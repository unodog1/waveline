import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/Layout';
import { genUserName } from '@/lib/genUserName';
import { Heart, Repeat2, MessageCircle, Zap } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

function NotificationItem({ event }: { event: NostrEvent }) {
  const navigate = useNavigate();
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;

  const getNotificationType = () => {
    if (event.kind === 7) return { icon: Heart, label: 'liked your post', color: 'text-red-500' };
    if (event.kind === 6) return { icon: Repeat2, label: 'reposted your post', color: 'text-accent' };
    if (event.kind === 1) return { icon: MessageCircle, label: 'replied to your post', color: 'text-primary' };
    if (event.kind === 9735) return { icon: Zap, label: 'zapped your post', color: 'text-yellow-500' };
    return { icon: Heart, label: 'interacted with your post', color: 'text-muted-foreground' };
  };

  const { icon: Icon, label, color } = getNotificationType();

  const handleClick = () => {
    const npub = nip19.npubEncode(event.pubkey);
    navigate(`/profile/${npub}`);
  };

  return (
    <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors cursor-pointer" onClick={handleClick}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${color} mt-1`} strokeWidth={2.5} />
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-sm">
              {(metadata?.name || genUserName(event.pubkey)).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-bold">{metadata?.name || genUserName(event.pubkey)}</span>
              {' '}
              <span className="text-muted-foreground">{label}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(event.created_at * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Notifications() {
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.pubkey],
    queryFn: async () => {
      if (!user) return [];
      
      // Query reactions (kind 7), reposts (kind 6), and mentions (kind 1 with p tag)
      const events = await nostr.query([
        {
          kinds: [1, 6, 7, 9735],
          '#p': [user.pubkey],
          limit: 100,
        },
      ]);

      // Filter out own events and sort by date
      return events
        .filter((e) => e.pubkey !== user.pubkey)
        .sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  useSeoMeta({
    title: 'Notifications - Waveline',
    description: 'Your notifications',
  });

  if (!user) {
    return (
      <Layout showSearch={false} showRightSidebar={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <Card className="border-primary/10 bg-card/50 max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to view notifications</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false} showRightSidebar={false}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        <div className="space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-primary/10 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <Card className="border-dashed border-primary/20">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No notifications yet 🔔</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((event) => <NotificationItem key={event.id} event={event} />)
          )}
        </div>
      </div>
    </Layout>
  );
}
