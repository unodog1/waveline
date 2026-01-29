import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWallet } from '@/hooks/useWallet';
import { useNWC } from '@/hooks/useNWCContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { 
  Wallet as WalletIcon, 
  Zap, 
  CheckCircle2, 
  Plug, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  XCircle
} from 'lucide-react';

export default function Wallet() {
  const { user } = useCurrentUser();
  const { webln } = useWallet();
  const { addConnection, removeConnection, connections, activeConnection: activeConnStr, setActiveConnection } = useNWC();
  const { toast } = useToast();
  const [nwcUrl, setNwcUrl] = useState('');
  const [nwcAlias, setNwcAlias] = useState('');
  const [connecting, setConnecting] = useState(false);

  useSeoMeta({
    title: 'Wallet - Waveline',
    description: 'Manage your Lightning wallet on Nostr',
  });

  const handleNWCConnect = async () => {
    if (!nwcUrl.trim()) {
      toast({ title: 'Please enter a connection string', variant: 'destructive' });
      return;
    }

    setConnecting(true);
    try {
      const success = await addConnection(nwcUrl, nwcAlias || 'NWC Wallet');
      if (success) {
        setNwcUrl('');
        setNwcAlias('');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleWebLNConnect = async () => {
    if (webln) {
      toast({ title: '✅ Extension wallet already connected!' });
      return;
    }

    try {
      if (window.webln) {
        await window.webln.enable();
        toast({ title: '✅ Extension wallet connected!' });
      } else {
        toast({ 
          title: 'No wallet extension found', 
          description: 'Please install Alby or another WebLN wallet',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: 'Failed to connect extension', variant: 'destructive' });
    }
  };

  const handleDisconnectNWC = (connectionString: string) => {
    removeConnection(connectionString);
  };

  if (!user) {
    return (
      <Layout showSearch={false} showRightSidebar={false}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 lg:pb-8">
          <Card className="border-primary/10 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <WalletIcon className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Lightning Wallet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Please log in to connect your Lightning wallet and manage transactions
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const activeConn = connections.find(c => c.connectionString === activeConnStr);
  const isConnected = !!(webln || activeConn);

  return (
    <Layout showSearch={false} showRightSidebar={false}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <WalletIcon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Lightning Wallet
              </h1>
              <p className="text-muted-foreground">
                Connect and manage your Bitcoin Lightning wallet
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status Overview */}
        <Card className="border-primary/10 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Connection Status</CardTitle>
                <CardDescription>Your wallet connection details</CardDescription>
              </div>
              {isConnected ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 px-4 py-1.5">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/30 px-4 py-1.5">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {webln && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shadow-lg">
                    <Plug className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">Browser Extension</p>
                    <p className="text-sm text-muted-foreground">WebLN wallet is active</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
              </div>
            )}

            {activeConn && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">{activeConn.alias || 'NWC Wallet'}</p>
                    <p className="text-sm text-muted-foreground">Nostr Wallet Connect</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnectNWC(activeConn.connectionString)}
                    className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            )}

            {!isConnected && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No wallet connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect a wallet below to start zapping
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Tabs */}
        <Tabs defaultValue="extension" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl">
            <TabsTrigger 
              value="extension" 
              className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold"
            >
              <Plug className="w-4 h-4 mr-2" />
              Extension
            </TabsTrigger>
            <TabsTrigger 
              value="nwc" 
              className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-semibold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Nostr Wallet Connect
            </TabsTrigger>
          </TabsList>

          {/* Browser Extension Tab */}
          <TabsContent value="extension" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5 text-primary" />
                  Browser Extension Wallet
                </CardTitle>
                <CardDescription>
                  Connect using a WebLN-compatible browser extension
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recommended Extensions
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Alby - Full-featured Lightning wallet</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Mutiny - Self-custodial Lightning wallet</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Any WebLN-compatible extension</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleWebLNConnect}
                    disabled={!!webln}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 font-bold text-base transition-all duration-300"
                  >
                    {webln ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Extension Connected
                      </>
                    ) : (
                      <>
                        <Plug className="w-5 h-5 mr-2" />
                        Connect Extension
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nostr Wallet Connect Tab */}
          <TabsContent value="nwc" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Nostr Wallet Connect
                </CardTitle>
                <CardDescription>
                  Connect your wallet using NWC connection string
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Wallet Name (Optional)</label>
                    <Input
                      placeholder="My Lightning Wallet"
                      value={nwcAlias}
                      onChange={(e) => setNwcAlias(e.target.value)}
                      className="rounded-xl border-primary/20 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">NWC Connection String</label>
                    <Input
                      placeholder="nostr+walletconnect://..."
                      value={nwcUrl}
                      onChange={(e) => setNwcUrl(e.target.value)}
                      className="rounded-xl border-primary/20 bg-background/50 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this from your wallet settings in Alby, Mutiny, or other NWC-compatible wallets
                    </p>
                  </div>

                  <Button
                    onClick={handleNWCConnect}
                    disabled={connecting || !nwcUrl.trim()}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-accent/30 font-bold text-base transition-all duration-300"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                </div>

                {/* Connected NWC Wallets */}
                {connections.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-primary/10">
                    <h3 className="text-sm font-semibold text-muted-foreground">Connected Wallets</h3>
                    {connections.map((conn) => (
                      <div 
                        key={conn.connectionString}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          activeConnStr === conn.connectionString
                            ? 'bg-accent/10 border-accent/30 shadow-sm'
                            : 'bg-background/30 border-primary/10 hover:bg-background/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              activeConnStr === conn.connectionString
                                ? 'bg-accent/20'
                                : 'bg-primary/10'
                            }`}>
                              <Zap className={`w-5 h-5 ${
                                activeConnStr === conn.connectionString ? 'text-accent' : 'text-primary'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold">{conn.alias || 'NWC Wallet'}</p>
                              <div className="flex items-center gap-2">
                                {activeConnStr === conn.connectionString && (
                                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                                    Active
                                  </Badge>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Connected
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {activeConnStr !== conn.connectionString && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveConnection(conn.connectionString)}
                                className="rounded-xl"
                              >
                                Set Active
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnectNWC(conn.connectionString)}
                              className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        {!isConnected && (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
              <CardContent className="pt-6">
                <Sparkles className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-lg mb-2">Why Connect a Wallet?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <span>Send and receive Lightning payments instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <span>Zap posts and creators to show appreciation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <span>Support the Lightning Network ecosystem</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-gradient-to-br from-accent/5 to-transparent backdrop-blur-sm">
              <CardContent className="pt-6">
                <AlertCircle className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-bold text-lg mb-2">Security First</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Your keys never leave your wallet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Non-custodial - you control your funds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Encrypted connections via Nostr protocol</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
