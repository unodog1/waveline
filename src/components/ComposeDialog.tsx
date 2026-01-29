import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { Loader2, X } from 'lucide-react';

interface ComposeDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function ComposeDialog({ children, onSuccess }: ComposeDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const { user, metadata } = useCurrentUser();
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({ title: 'Please write something', variant: 'destructive' });
      return;
    }

    publishEvent(
      {
        kind: 1,
        content: content.trim(),
        tags: [],
      },
      {
        onSuccess: () => {
          toast({ title: '🌊 Wave posted!' });
          setContent('');
          setOpen(false);
          onSuccess?.();
        },
        onError: () => {
          toast({ title: 'Failed to post', variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl border-primary/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Wave
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={metadata?.picture} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                {(metadata?.name || genUserName(user?.pubkey || '')).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] text-base resize-none border-primary/20 focus-visible:ring-primary/50 bg-background/50"
                disabled={isPending}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-muted-foreground">
                  {content.length} characters
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
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
                      'Post Wave'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
