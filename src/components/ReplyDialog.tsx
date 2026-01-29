import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useNostrBuildUpload } from '@/hooks/useNostrBuildUpload';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface ReplyDialogProps {
  event: NostrEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReplyDialog({ event, open, onOpenChange }: ReplyDialogProps) {
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, metadata } = useCurrentUser();
  const author = useAuthor(event.pubkey);
  const authorMetadata = author.data?.metadata;
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useNostrBuildUpload();
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Maximum file size is 10MB', variant: 'destructive' });
      return;
    }

    try {
      const result = await uploadFile(file);
      setUploadedImages([...uploadedImages, result.url]);
      toast({ title: '✅ Image uploaded to nostr.build!' });
    } catch (error) {
      toast({ title: 'Failed to upload image', description: 'Please try again', variant: 'destructive' });
    }
  };

  const removeImage = (url: string) => {
    setUploadedImages(uploadedImages.filter(img => img !== url));
  };

  const handleSubmit = () => {
    if (!content.trim() && uploadedImages.length === 0) {
      toast({ title: 'Please write something or add an image', variant: 'destructive' });
      return;
    }

    // Append image URLs to content
    let finalContent = content.trim();
    if (uploadedImages.length > 0) {
      finalContent += (finalContent ? '\n\n' : '') + uploadedImages.join('\n');
    }

    // Build reply tags (NIP-10)
    const tags = [
      ['e', event.id, '', 'reply'],
      ['p', event.pubkey],
    ];

    publishEvent(
      {
        kind: 1,
        content: finalContent,
        tags,
      },
      {
        onSuccess: () => {
          toast({ title: '💬 Reply posted!' });
          setContent('');
          setUploadedImages([]);
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: 'Failed to post reply', variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary/20 bg-background/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Reply
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original post */}
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="pt-4">
              <div className="flex gap-3 mb-3">
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
                  <div className="text-sm text-foreground/90 mt-1 leading-relaxed overflow-hidden break-words">
                    <NoteContent event={event} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply composer */}
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={metadata?.picture} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                {(metadata?.name || genUserName(user?.pubkey || '')).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write your reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] text-base resize-none border-primary/20 focus-visible:ring-primary/50 bg-background/50"
                disabled={isPending || isUploading}
                autoFocus
              />

              {/* Image previews */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((url) => (
                    <div key={url} className="relative group">
                      <img 
                        src={url} 
                        alt="Upload" 
                        className="w-24 h-24 object-cover rounded-xl border-2 border-primary/20"
                      />
                      <button
                        onClick={() => removeImage(url)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isUploading}
                    className="rounded-xl"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Add Image
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {content.length} chars
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      setUploadedImages([]);
                    }}
                    disabled={isPending || isUploading}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || isUploading || (!content.trim() && uploadedImages.length === 0)}
                    className="rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 font-bold"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Replying...
                      </>
                    ) : (
                      'Reply'
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
