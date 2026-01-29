import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

type FeedType = 'following' | 'global' | 'trending';

export function useFeed(feedType: FeedType, followingPubkeys?: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['feed', feedType, followingPubkeys],
    queryFn: async () => {
      let events: NostrEvent[];

      if (feedType === 'following' && followingPubkeys && followingPubkeys.length > 0) {
        // Query posts and reposts from people the user follows
        events = await nostr.query([
          {
            kinds: [1, 6], // kind 1 = text notes, kind 6 = reposts
            authors: followingPubkeys,
            limit: 50,
          },
        ]);

        // Filter out replies from kind 1 posts (posts that have 'e' tags are replies)
        // Keep all kind 6 reposts
        events = events.filter((event) => {
          if (event.kind === 6) return true; // Always show reposts
          const eTags = event.tags.filter(([tagName]) => tagName === 'e');
          return eTags.length === 0; // Filter out replies
        });
      } else {
        // Global feed - query all kind 1 events and reposts
        events = await nostr.query([
          {
            kinds: [1, 6],
            limit: 50,
          },
        ]);
      }

      // Sort by created_at descending (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
