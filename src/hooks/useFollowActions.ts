import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';

export function useFollowActions() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current contact list
  const { data: contactList } = useQuery({
    queryKey: ['contact-list', user?.pubkey],
    queryFn: async () => {
      if (!user) return null;
      const events = await nostr.query([
        {
          kinds: [3],
          authors: [user.pubkey],
          limit: 1,
        },
      ]);
      return events[0] || null;
    },
    enabled: !!user,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (pubkeyToFollow: string) => {
      if (!user) throw new Error('Not logged in');

      // Get existing tags or create new array
      const existingTags = contactList?.tags || [];
      
      // Check if already following
      const alreadyFollowing = existingTags.some(
        ([name, pubkey]) => name === 'p' && pubkey === pubkeyToFollow
      );

      if (alreadyFollowing) {
        throw new Error('Already following');
      }

      // Add new follow
      const newTags = [...existingTags, ['p', pubkeyToFollow]];

      const event = await user.signer.signEvent({
        kind: 3,
        content: contactList?.content || '',
        tags: newTags,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast({ title: '✅ Followed!' });
    },
    onError: (error: Error) => {
      if (error.message !== 'Already following') {
        toast({ title: 'Failed to follow', variant: 'destructive' });
      }
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (pubkeyToUnfollow: string) => {
      if (!user) throw new Error('Not logged in');

      const existingTags = contactList?.tags || [];
      
      // Remove the pubkey
      const newTags = existingTags.filter(
        ([name, pubkey]) => !(name === 'p' && pubkey === pubkeyToUnfollow)
      );

      const event = await user.signer.signEvent({
        kind: 3,
        content: contactList?.content || '',
        tags: newTags,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast({ title: '🚫 Unfollowed' });
    },
    onError: () => {
      toast({ title: 'Failed to unfollow', variant: 'destructive' });
    },
  });

  // Check if following a specific pubkey
  const isFollowing = (pubkey: string): boolean => {
    if (!contactList) return false;
    return contactList.tags.some(
      ([name, p]) => name === 'p' && p === pubkey
    );
  };

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowing,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
}
