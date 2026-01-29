import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
}

interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['link-preview', url],
    queryFn: async () => {
      try {
        // Use a CORS proxy to fetch Open Graph data
        const proxyUrl = `https://proxy.shakespeare.diy/?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();

        // Parse Open Graph tags
        const og: OpenGraphData = {};
        
        const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
        if (titleMatch) og.title = titleMatch[1];

        const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
        if (descMatch) og.description = descMatch[1];

        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
        if (imageMatch) og.image = imageMatch[1];

        const siteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);
        if (siteMatch) og.siteName = siteMatch[1];

        // Fallback to regular title if no OG title
        if (!og.title) {
          const titleTag = html.match(/<title>([^<]*)<\/title>/i);
          if (titleTag) og.title = titleTag[1];
        }

        return og;
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
        return null;
      }
    },
    staleTime: 3600000, // 1 hour
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="mt-3 border-primary/10 bg-card/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.title) return null;

  const hostname = new URL(url).hostname.replace('www.', '');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3"
    >
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 transition-all group">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {data.image && (
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                <img
                  src={data.image}
                  alt={data.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {data.title}
              </p>
              {data.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {data.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                <span>{data.siteName || hostname}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
