import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Waves, Home as HomeIcon, Bell, Mail, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Home = () => {
  const { user, metadata } = useCurrentUser();
  const { theme, setTheme } = useTheme();

  useSeoMeta({
    title: 'Home - Waveline',
    description: 'Your ocean of connections on Nostr',
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Subtle animated background */}
      <div className="absolute inset-0 isolate -z-10 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-gradient-shift" />
      </div>

      {/* Navigation Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 border-r border-primary/10 bg-background/80 backdrop-blur-xl p-6 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Waves className="w-8 h-8 text-primary" strokeWidth={2.5} />
            <div className="absolute inset-0 blur-lg bg-primary/50 -z-10" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Waveline
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="justify-start gap-3 text-base h-12 bg-primary/10 hover:bg-primary/20"
          >
            <HomeIcon className="w-5 h-5" />
            Home
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-base h-12 hover:bg-primary/10">
            <Search className="w-5 h-5" />
            Explore
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-base h-12 hover:bg-primary/10">
            <Bell className="w-5 h-5" />
            Notifications
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-base h-12 hover:bg-primary/10">
            <Mail className="w-5 h-5" />
            Messages
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-base h-12 hover:bg-primary/10">
            <User className="w-5 h-5" />
            Profile
          </Button>
        </nav>

        {/* Compose Button */}
        <Button 
          size="lg"
          className="w-full mt-4 rounded-2xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-semibold"
        >
          Create Wave
        </Button>

        {/* User Profile at Bottom */}
        <div className="mt-auto pt-6 border-t border-primary/10">
          {user ? (
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={metadata?.picture} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {metadata?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{metadata?.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.pubkey.slice(0, 8)}...
                </p>
              </div>
            </div>
          ) : (
            <LoginArea className="w-full" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Waveline..." 
                  className="pl-10 rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full hover:bg-primary/10"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
        </header>

        {/* Feed Container */}
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Post Composer */}
          {user && (
            <Card className="mb-6 border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={metadata?.picture} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {metadata?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      placeholder="What's on your mind?"
                      className="w-full min-h-[100px] p-3 rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex justify-end mt-3">
                      <Button className="rounded-2xl bg-gradient-to-r from-primary to-accent">
                        Post Wave
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feed Posts Placeholder */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">User {i}</span>
                        <span className="text-xs text-muted-foreground">· 2h ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">npub1...</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    This is a sample post in the Waveline feed. The ocean-inspired design creates 
                    a calm and immersive social experience. 🌊
                  </p>
                  <div className="flex gap-6 mt-4 text-muted-foreground">
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <span className="text-sm">Reply</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <span className="text-sm">Repost</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <span className="text-sm">Like</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Floating animation styles */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(20px, 20px) scale(1.1);
            opacity: 1;
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
