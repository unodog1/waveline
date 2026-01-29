import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoginArea } from '@/components/auth/LoginArea';
import { ComposeDialog } from '@/components/ComposeDialog';
import { MobileNav } from '@/components/MobileNav';
import { RightSidebar } from '@/components/RightSidebar';
import { 
  Moon, 
  Sun, 
  Waves, 
  Home as HomeIcon, 
  Bell, 
  Mail, 
  Search as SearchIcon,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';
import { nip19 } from 'nostr-tools';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  showRightSidebar?: boolean;
}

export function Layout({ children, showSearch = true, showRightSidebar = true }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, metadata } = useCurrentUser();
  const { theme, setTheme } = useTheme();

  const handleViewOwnProfile = () => {
    if (user) {
      const npub = nip19.npubEncode(user.pubkey);
      navigate(`/profile/${npub}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Subtle animated background */}
      <div className="absolute inset-0 isolate -z-10 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-gradient-shift" />
      </div>

      {/* Navigation Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:flex left-0 top-0 h-screen w-72 border-r border-primary/10 bg-background/80 backdrop-blur-xl p-6 flex-col gap-6">
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
            className={`justify-start gap-3 text-base h-12 hover:bg-primary/10 ${
              isActive('/home') ? 'bg-primary/10 text-primary font-bold' : ''
            }`}
            onClick={() => navigate('/home')}
          >
            <HomeIcon className="w-5 h-5" />
            Home
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start gap-3 text-base h-12 hover:bg-primary/10 ${
              isActive('/explore') ? 'bg-primary/10 text-primary font-bold' : ''
            }`}
            onClick={() => navigate('/explore')}
          >
            <SearchIcon className="w-5 h-5" />
            Explore
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start gap-3 text-base h-12 hover:bg-primary/10 ${
              isActive('/notifications') ? 'bg-primary/10 text-primary font-bold' : ''
            }`}
            onClick={() => navigate('/notifications')}
            disabled={!user}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start gap-3 text-base h-12 hover:bg-primary/10 ${
              isActive('/messages') ? 'bg-primary/10 text-primary font-bold' : ''
            }`}
            onClick={() => navigate('/messages')}
            disabled={!user}
          >
            <Mail className="w-5 h-5" />
            Messages
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start gap-3 text-base h-12 hover:bg-primary/10 ${
              isActive('/settings') ? 'bg-primary/10 text-primary font-bold' : ''
            }`}
            onClick={() => navigate('/settings')}
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </Button>
        </nav>

        {/* Compose Button */}
        <ComposeDialog>
          <Button 
            size="lg"
            disabled={!user}
            className="w-full mt-4 rounded-2xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-bold text-base"
          >
            Create Wave
          </Button>
        </ComposeDialog>

        {/* User Profile Card at Bottom - Replaces old Profile nav */}
        <div className="mt-auto pt-6 border-t border-primary/10">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                    <AvatarImage src={metadata?.picture} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                      {metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{metadata?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.pubkey.slice(0, 8)}...
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl mb-2 ml-6">
                <DropdownMenuItem 
                  onClick={handleViewOwnProfile}
                  className="cursor-pointer rounded-xl font-semibold"
                >
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/settings/profile')}
                  className="cursor-pointer rounded-xl font-semibold"
                >
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/settings')}
                  className="cursor-pointer rounded-xl font-semibold"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginArea className="w-full" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`lg:ml-72 ${showRightSidebar ? 'xl:mr-80' : ''} min-h-screen`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-10 border-b border-primary/10 bg-background/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <Waves className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Waveline
              </span>
            </div>

            {/* Centered title on larger screens when right sidebar is shown */}
            <div className="hidden xl:flex flex-1 justify-center">
              <h2 className="text-lg font-bold">Waveline</h2>
            </div>

            {/* Search bar - only show when no right sidebar */}
            {showSearch && !showRightSidebar && (
              <div className="hidden sm:flex flex-1 max-w-xl lg:max-w-2xl">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Waveline..." 
                    className="pl-10 rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm"
                    onClick={() => navigate('/search')}
                    readOnly
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
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
              {/* Mobile compose button */}
              <ComposeDialog>
                <Button 
                  size="icon"
                  disabled={!user}
                  className="lg:hidden rounded-full bg-gradient-to-r from-primary to-accent"
                >
                  <Waves className="w-5 h-5" />
                </Button>
              </ComposeDialog>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>

      {/* Right Sidebar - Desktop only */}
      {showRightSidebar && <RightSidebar />}

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Animation styles */}
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
}
