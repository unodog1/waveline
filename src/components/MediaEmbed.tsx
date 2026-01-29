import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, ExternalLink, Music2 } from 'lucide-react';

interface MediaEmbedProps {
  url: string;
}

export function MediaEmbed({ url }: MediaEmbedProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check URL type
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  const isVideo = /\.(mp4|webm|mov)$/i.test(url);
  const isYouTube = url.includes('youtube.com/watch') || url.includes('youtu.be/');
  const isSpotify = url.includes('spotify.com/track') || url.includes('spotify.com/album') || url.includes('spotify.com/playlist');
  const isAppleMusic = url.includes('music.apple.com');
  const isSoundCloud = url.includes('soundcloud.com');

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  // Extract Spotify ID and type
  const getSpotifyInfo = (url: string) => {
    const match = url.match(/spotify\.com\/(track|album|playlist)\/([^?\s]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };

  if (isImage) {
    return (
      <>
        <div 
          className="relative rounded-2xl overflow-hidden cursor-pointer group mt-3 isolate"
          onClick={() => setLightboxOpen(true)}
        >
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 -z-10" />
          )}
          <img
            src={url}
            alt="Post media"
            className="w-full max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-7xl border-none bg-black/95 p-2">
            <img
              src={url}
              alt="Post media"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (isVideo) {
    return (
      <div className="relative rounded-2xl overflow-hidden mt-3">
        <video
          src={url}
          controls
          className="w-full max-h-[500px] bg-black"
          preload="metadata"
        />
      </div>
    );
  }

  if (isYouTube) {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;

    return (
      <div className="relative rounded-2xl overflow-hidden mt-3 aspect-video bg-black isolate">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (isSpotify) {
    const spotifyInfo = getSpotifyInfo(url);
    if (!spotifyInfo) return null;

    const embedUrl = `https://open.spotify.com/embed/${spotifyInfo.type}/${spotifyInfo.id}`;

    return (
      <Card className="mt-3 border-primary/10 bg-gradient-to-br from-green-500/10 to-green-600/5 overflow-hidden">
        <CardContent className="p-0">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-xl"
          />
        </CardContent>
      </Card>
    );
  }

  if (isAppleMusic) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3"
      >
        <Card className="border-primary/10 bg-gradient-to-br from-pink-500/10 to-red-500/5 hover:from-pink-500/20 hover:to-red-500/10 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-red-500/30 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Apple Music</p>
                <p className="text-xs text-muted-foreground truncate">Play on Apple Music</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </a>
    );
  }

  if (isSoundCloud) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3"
      >
        <Card className="border-primary/10 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:from-orange-500/20 hover:to-orange-600/10 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">SoundCloud</p>
                <p className="text-xs text-muted-foreground truncate">Listen on SoundCloud</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </a>
    );
  }

  return null;
}
