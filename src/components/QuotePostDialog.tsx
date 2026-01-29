import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { Loader2 } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

interface QuotePostDialogProps {
  event: NostrEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotePostDialog({ event, open, onOpenChange }: QuotePostDialogProps) {
  const [content, setContent] = useState('');
  const { user, metadata } = useCurrentUser();
  const author = useAuthor(event.pubkey);
  const authorMetadata = author.data?.metadata;
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({ title: 'Please write something', variant: 'destructive' });
      return;
    }

    // Build quote post with q tag (NIP-18)
    const nevent = nip19.neventEncode({ id: event.id, author: event.pubkey });
    const tags = [
      ['q', event.id],
      ['p', event.pubkey],
    ];

    publishEvent(
      {
        kind: 1,
        content: content.trim() + '\n\nnostr:' + nevent,
        tags,
      },
      {
        onSuccess: () => {
          toast({ title: '🌊 Quote posted!' });
          setContent('');
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: 'Failed to post quote', variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary/20 bg-background/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quote Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quote composer */}
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={metadata?.picture} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                {(metadata?.name || genUserName(user?.pubkey || '')).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] text-base resize-none border-primary/20 focus-visible:ring-primary/50 bg-background/50 mb-3"
                disabled={isPending}
                autoFocus
              />
            </div>
          </div>

          {/* Original post preview */}
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={authorMetadata?.picture} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-sm">
                    {(authorMetadata?.name || genUserName(event.pubkey)).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm">
                    {authorMetadata?.name || genUserName(event.pubkey)}
                  </span>
                  <div className="text-sm text-foreground/90 mt-1 leading-relaxed">
                    <NoteContent event={event} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {content.length} characters
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !content.trim()}
                className="rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 font-bold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Quote'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
