import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';

interface MuteList {
  pubkeys: string[];
  hashtags: string[];
  words: string[];
  threads: string[];
}

export function useMuteList() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch mute list (kind 10000)
  const { data: muteList = { pubkeys: [], hashtags: [], words: [], threads: [] }, isLoading } = useQuery({
    queryKey: ['mute-list', user?.pubkey],
    queryFn: async (): Promise<MuteList> => {
      if (!user) return { pubkeys: [], hashtags: [], words: [], threads: [] };
      
      const events = await nostr.query([{
        kinds: [10000],
        authors: [user.pubkey],
        limit: 1,
      }]);

      if (events.length === 0) {
        return { pubkeys: [], hashtags: [], words: [], threads: [] };
      }

      const event = events[0];
      const pubkeys = event.tags.filter(([t]) => t === 'p').map(([, pubkey]) => pubkey);
      const hashtags = event.tags.filter(([t]) => t === 't').map(([, tag]) => tag);
      const words = event.tags.filter(([t]) => t === 'word').map(([, word]) => word);
      const threads = event.tags.filter(([t]) => t === 'e').map(([, eventId]) => eventId);

      return { pubkeys, hashtags, words, threads };
    },
    enabled: !!user,
  });

  // Publish updated mute list
  const { mutate: updateMuteList } = useMutation({
    mutationFn: async (newMuteList: MuteList) => {
      if (!user) throw new Error('User not logged in');

      const tags: string[][] = [
        ...newMuteList.pubkeys.map(pubkey => ['p', pubkey]),
        ...newMuteList.hashtags.map(tag => ['t', tag]),
        ...newMuteList.words.map(word => ['word', word]),
        ...newMuteList.threads.map(eventId => ['e', eventId]),
      ];

      const event: Partial<NostrEvent> = {
        kind: 10000,
        content: '',
        tags,
      };

      await user.signer.signEvent(event as NostrEvent);
      await nostr.event(event as NostrEvent);
      return newMuteList;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['mute-list', user?.pubkey], data);
      toast({ title: '✅ Mute list updated!' });
    },
    onError: () => {
      toast({ title: 'Failed to update mute list', variant: 'destructive' });
    },
  });

  // Helper functions
  const isMuted = (pubkey: string): boolean => {
    return muteList.pubkeys.includes(pubkey);
  };

  const mutePubkey = (pubkey: string) => {
    if (!muteList.pubkeys.includes(pubkey)) {
      const newMuteList = {
        ...muteList,
        pubkeys: [...muteList.pubkeys, pubkey],
      };
      updateMuteList(newMuteList);
    }
  };

  const unmutePubkey = (pubkey: string) => {
    const newMuteList = {
      ...muteList,
      pubkeys: muteList.pubkeys.filter(p => p !== pubkey),
    };
    updateMuteList(newMuteList);
  };

  const toggleMute = (pubkey: string) => {
    if (isMuted(pubkey)) {
      unmutePubkey(pubkey);
    } else {
      mutePubkey(pubkey);
    }
  };

  const muteHashtag = (tag: string) => {
    if (!muteList.hashtags.includes(tag)) {
      const newMuteList = {
        ...muteList,
        hashtags: [...muteList.hashtags, tag],
      };
      updateMuteList(newMuteList);
    }
  };

  const muteWord = (word: string) => {
    const lowerWord = word.toLowerCase();
    if (!muteList.words.includes(lowerWord)) {
      const newMuteList = {
        ...muteList,
        words: [...muteList.words, lowerWord],
      };
      updateMuteList(newMuteList);
    }
  };

  const muteThread = (eventId: string) => {
    if (!muteList.threads.includes(eventId)) {
      const newMuteList = {
        ...muteList,
        threads: [...muteList.threads, eventId],
      };
      updateMuteList(newMuteList);
    }
  };

  return {
    muteList,
    isLoading,
    isMuted,
    mutePubkey,
    unmutePubkey,
    toggleMute,
    muteHashtag,
    muteWord,
    muteThread,
  };
}
