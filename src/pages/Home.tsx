import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { useFollowing } from '@/hooks/useFollowing';
import { Layout } from '@/components/Layout';
import { Post } from '@/components/Post';

type FeedType = 'following' | 'global' | 'trending';

const Home = () => {
  const [feedType, setFeedType] = useState<FeedType>('following');
  const { user } = useCurrentUser();

  // Fetch following list
  const { data: followingPubkeys = [] } = useFollowing(user?.pubkey);

  // Fetch feed based on feed type
  const { data: posts = [], isLoading } = useFeed(feedType, followingPubkeys);

  useSeoMeta({
    title: 'Home - Waveline',
    description: 'Your ocean of connections on Nostr',
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-4 lg:py-6 px-3 sm:px-4 pb-20 lg:pb-6">

          {/* Feed Type Selector */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 h-12"
                >
                  <span className="font-semibold">
                    {feedType === 'following' && 'Following'}
                    {feedType === 'global' && 'Global'}
                    {feedType === 'trending' && 'Trending'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-320px)] max-w-2xl rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
                <DropdownMenuItem 
                  onClick={() => setFeedType('following')}
                  className="cursor-pointer rounded-xl"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Following</span>
                    <span className="text-xs text-muted-foreground">Posts from people you follow</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFeedType('global')}
                  className="cursor-pointer rounded-xl"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Global</span>
                    <span className="text-xs text-muted-foreground">All posts from the network</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFeedType('trending')}
                  className="cursor-pointer rounded-xl"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Trending</span>
                    <span className="text-xs text-muted-foreground">Popular posts right now</span>
                  </div>
                </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Feed Posts */}
    <div className="space-y-4">
      {isLoading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i} className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : posts.length === 0 ? (
        <Card className="border-dashed border-primary/20">
          <CardContent className="py-12 px-8 text-center">
            <div className="max-w-sm mx-auto">
              <p className="text-muted-foreground">
                {feedType === 'following' 
                  ? "No posts from people you follow yet. Try the Global feed or follow some users!"
                  : "No posts found. The ocean is quiet right now. 🌊"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        posts.map((event) => <Post key={event.id} event={event} />)
      )}
    </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : posts.length === 0 ? (
              // Empty state
              <Card className="border-dashed border-primary/20">
                <CardContent className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <Waves className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {feedType === 'following' 
                        ? "No posts from people you follow yet. Try switching to the Global feed or follow some users!"
                        : "No posts found. The ocean is quiet right now. 🌊"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Display posts
              posts.map((event) => <Post key={event.id} event={event} />)
        )}
      </div>
    </div>
  </Layout>
  );
};

export default Home;
