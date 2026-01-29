import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch the list of pubkeys a user is following
 * Uses NIP-02 contact list (kind 3)
 */
export function useFollowing(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['following', pubkey],
    queryFn: async () => {
      if (!pubkey) return [];

      // Query kind 3 contact list events
      const events = await nostr.query([
        {
          kinds: [3],
          authors: [pubkey],
          limit: 1,
        },
      ]);

      if (events.length === 0) return [];

      // Extract pubkeys from p tags
      const followingPubkeys = events[0].tags
        .filter(([tagName]) => tagName === 'p')
        .map(([_, pubkey]) => pubkey);

      return followingPubkeys;
    },
    enabled: !!pubkey,
    staleTime: 60000, // Consider data stale after 1 minute
  });
}
