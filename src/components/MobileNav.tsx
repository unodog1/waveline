import { Home, Search, Bell, Mail, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser();

  const handleProfileClick = () => {
    if (user) {
      const npub = nip19.npubEncode(user.pubkey);
      navigate(`/profile/${npub}`);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', onClick: () => navigate('/home') },
    { icon: Search, label: 'Explore', path: '/explore', onClick: () => navigate('/explore') },
    { icon: Bell, label: 'Notifications', path: '/notifications', onClick: () => navigate('/notifications') },
    { icon: Mail, label: 'Messages', path: '/messages', onClick: () => {} },
    { icon: User, label: 'Profile', path: '/profile', onClick: handleProfileClick },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-primary/10">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === '/home' && location.pathname === '/home');
          
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-accent bg-accent/10' 
                  : 'text-muted-foreground hover:text-accent hover:bg-accent/5'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
