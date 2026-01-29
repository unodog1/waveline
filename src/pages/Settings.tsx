import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RelayListManager } from '@/components/RelayListManager';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useMuteList } from '@/hooks/useMuteList';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor, VolumeX, Loader2 } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';

export default function Settings() {
  const { user } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const { muteList, isLoading: muteLoading, unmutePubkey } = useMuteList();

  useSeoMeta({
    title: 'Settings - Waveline',
    description: 'Configure your Waveline experience',
  });

  if (!user) {
    return (
      <Layout showSearch={false} showRightSidebar={false}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
          <Card className="border-primary/10 bg-card/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to access settings</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false} showRightSidebar={false}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl">
            <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="relays" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
              Relays
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold">
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <Monitor className="w-4 h-4" />
                    System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relays" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Relay Configuration</CardTitle>
                <CardDescription>Manage your Nostr relay connections</CardDescription>
              </CardHeader>
              <CardContent>
                <RelayListManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <VolumeX className="w-5 h-5 text-primary" />
                  Muted Users
                </CardTitle>
                <CardDescription>
                  Manage users you have muted. Their posts won't appear in your feeds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {muteLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : muteList.pubkeys.length === 0 ? (
                  <div className="text-center py-8">
                    <VolumeX className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No muted users</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Muted users will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {muteList.pubkeys.map((pubkey) => (
                      <MutedUserItem key={pubkey} pubkey={pubkey} onUnmute={unmutePubkey} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Component to display a muted user
function MutedUserItem({ pubkey, onUnmute }: { pubkey: string; onUnmute: (pubkey: string) => void }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
          <AvatarImage src={metadata?.picture} />
          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-sm">
            {(metadata?.name || genUserName(pubkey)).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{metadata?.name || genUserName(pubkey)}</p>
          <p className="text-xs text-muted-foreground font-mono">{pubkey.slice(0, 16)}...</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUnmute(pubkey)}
        className="rounded-xl hover:bg-primary/10"
      >
        Unmute
      </Button>
    </div>
  );
}
