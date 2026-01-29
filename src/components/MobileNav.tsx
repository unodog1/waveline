import { Home, Search, Bell, Mail, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { nip19 } from 'nostr-tools';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, metadata } = useCurrentUser();

  const handleProfileClick = () => {
    if (user) {
      const npub = nip19.npubEncode(user.pubkey);
      navigate(`/profile/${npub}`);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', onClick: () => navigate('/home') },
    { icon: Search, label: 'Explore', path: '/explore', onClick: () => navigate('/explore') },
    { icon: Bell, label: 'Notifications', path: '/notifications', onClick: () => navigate('/notifications'), disabled: !user },
    { icon: Mail, label: 'Messages', path: '/messages', onClick: () => navigate('/messages'), disabled: !user },
    { icon: Settings, label: 'Settings', path: '/settings', onClick: () => navigate('/settings') },
  ];

  // Profile tab shows user avatar when logged in, Settings icon when not
  const profileItem = user ? {
    type: 'profile' as const,
    label: 'Profile',
    path: '/profile',
    onClick: handleProfileClick,
  } : {
    type: 'settings' as const,
    icon: Settings,
    label: 'Settings',
    path: '/settings',
    onClick: () => navigate('/settings'),
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-primary/10 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === '/home' && location.pathname === '/home');
          
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                item.disabled 
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : isActive 
                    ? 'text-accent bg-accent/10' 
                    : 'text-muted-foreground hover:text-accent hover:bg-accent/5'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
        
        {/* Profile/Settings Tab */}
        <button
          onClick={profileItem.onClick}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
            location.pathname.startsWith('/profile') || location.pathname === '/settings'
              ? 'text-accent bg-accent/10' 
              : 'text-muted-foreground hover:text-accent hover:bg-accent/5'
          }`}
        >
          {user ? (
            <>
              <Avatar className="w-5 h-5 ring-1 ring-primary/20">
                <AvatarImage src={metadata?.picture} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary text-[8px] font-bold">
                  {(metadata?.name || genUserName(user.pubkey)).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-semibold">Profile</span>
            </>
          ) : (
            <>
              <Settings className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-semibold">Settings</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
