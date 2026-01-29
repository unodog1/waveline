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
        // Query posts from people the user follows (kind 1 = text notes)
        events = await nostr.query([
          {
            kinds: [1],
            authors: followingPubkeys,
            limit: 50,
          },
        ]);
      } else {
        // Global feed - query all kind 1 events
        events = await nostr.query([
          {
            kinds: [1],
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
