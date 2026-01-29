import { useSeoMeta } from '@unhead/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Post } from '@/components/Post';
import { nip19 } from 'nostr-tools';

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
      <Layout showSearch={false} showRightSidebar={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <p className="text-muted-foreground">Invalid thread</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false} showRightSidebar={false}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 rounded-xl hover:bg-primary/10 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {mainLoading ? (
          <Card className="border-primary/10 bg-card/50 animate-pulse">
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
          <div className="animate-fade-in">
            <Post event={mainPost} showThread={false} isMainPost={true} />
          </div>
        ) : (
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Post not found</p>
            </CardContent>
          </Card>
        )}

        {replies.length > 0 && (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold px-2">
              Replies ({replies.length})
            </h3>
            {replies.map((reply, index) => (
              <div 
                key={reply.id}
                className="animate-fade-in"
                style={{ 
                  animationDelay: `${(index + 1) * 50}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <Post event={reply} showThread={false} />
              </div>
            ))}
          </div>
        )}

        {!repliesLoading && replies.length === 0 && mainPost && (
          <Card className="border-dashed border-primary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No replies yet. Be the first to respond! 🌊</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
