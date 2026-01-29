import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useMuteList } from '@/hooks/useMuteList';
import type { NostrEvent } from '@nostrify/nostrify';

type FeedType = 'following' | 'global' | 'trending';

export function useFeed(feedType: FeedType, followingPubkeys?: string[]) {
  const { nostr } = useNostr();
  const { muteList } = useMuteList();

  return useQuery({
    queryKey: ['feed', feedType, followingPubkeys, muteList.pubkeys],
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

      // Filter out muted users
      events = events.filter((event) => {
        // For reposts (kind 6), check both the reposter and the original author
        if (event.kind === 6) {
          if (muteList.pubkeys.includes(event.pubkey)) return false;
          try {
            const repostedEvent = JSON.parse(event.content);
            if (muteList.pubkeys.includes(repostedEvent.pubkey)) return false;
          } catch (e) {
            // If can't parse, filter it out to be safe
            return false;
          }
        }
        return !muteList.pubkeys.includes(event.pubkey);
      });

      // Sort by created_at descending (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
