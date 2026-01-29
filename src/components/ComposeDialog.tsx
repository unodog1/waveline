import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useNostrBuildUpload } from '@/hooks/useNostrBuildUpload';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';

interface ComposeDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function ComposeDialog({ children, onSuccess }: ComposeDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, metadata } = useCurrentUser();
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

    publishEvent(
      {
        kind: 1,
        content: finalContent,
        tags: [],
      },
      {
        onSuccess: () => {
          toast({ title: '🌊 Wave posted!' });
          setContent('');
          setUploadedImages([]);
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
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] text-base resize-none border-primary/20 focus-visible:ring-primary/50 bg-background/50"
                disabled={isPending || isUploading}
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
                      setOpen(false);
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
