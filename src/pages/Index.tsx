import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Waves } from 'lucide-react';

const Index = () => {
  const { theme, setTheme } = useTheme();

  useSeoMeta({
    title: 'Waveline - Ride the Nostr Wave',
    description: 'A modern, ocean-inspired desktop Nostr client. Immerse yourself in a fluid, unconventional social experience.',
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 isolate -z-10 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Wave 1 */}
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/30 to-transparent animate-wave" 
               style={{ 
                 clipPath: 'polygon(0 50%, 10% 45%, 20% 50%, 30% 45%, 40% 50%, 50% 45%, 60% 50%, 70% 45%, 80% 50%, 90% 45%, 100% 50%, 100% 100%, 0 100%)',
                 animationDuration: '8s'
               }} />
          {/* Wave 2 */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-accent/25 to-transparent animate-wave" 
               style={{ 
                 clipPath: 'polygon(0 60%, 10% 55%, 20% 60%, 30% 55%, 40% 60%, 50% 55%, 60% 60%, 70% 55%, 80% 60%, 90% 55%, 100% 60%, 100% 100%, 0 100%)',
                 animationDuration: '12s',
                 animationDelay: '-2s'
               }} />
          {/* Wave 3 */}
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-primary/20 to-transparent animate-wave" 
               style={{ 
                 clipPath: 'polygon(0 70%, 10% 65%, 20% 70%, 30% 65%, 40% 70%, 50% 65%, 60% 70%, 70% 65%, 80% 70%, 90% 65%, 100% 70%, 100% 100%, 0 100%)',
                 animationDuration: '15s',
                 animationDelay: '-4s'
               }} />
        </div>
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 isolate -z-10 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" 
             style={{ animationDuration: '20s' }} />
        <div className="absolute top-40 right-32 w-96 h-96 bg-accent/25 rounded-full blur-3xl animate-float" 
             style={{ animationDuration: '25s', animationDelay: '-5s' }} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" 
             style={{ animationDuration: '30s', animationDelay: '-10s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Waves className="w-8 h-8 text-primary" strokeWidth={2.5} />
            <div className="absolute inset-0 blur-lg bg-primary/50 -z-10" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Waveline
          </span>
        </div>
        
        <div className="flex items-center gap-4">
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
          <LoginArea className="max-w-60" />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-96px)] px-8">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Main heading with gradient */}
          <div className="space-y-8">
            <h1 className="text-8xl md:text-9xl font-bold leading-tight tracking-tight">
              <span className="inline-block bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                Ride The Wave
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Experience social connection that flows naturally. Dive into a desktop client designed for depth, discovery, and fluid interaction.
            </p>
          </div>

          {/* CTA - Bigger and closer */}
          <div className="pt-4">
            <Button 
              size="lg" 
              className="text-2xl px-12 py-8 rounded-3xl bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/60 hover:scale-110 transition-all duration-300 group font-semibold"
            >
              <Waves className="w-7 h-7 mr-3 group-hover:animate-pulse" />
              Dive In
            </Button>
          </div>

          {/* Bottom tagline */}
          <div className="pt-20">
            <p className="text-sm text-muted-foreground">
              Vibed with{' '}
              <a 
                href="https://shakespeare.diy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-accent transition-colors duration-300 underline underline-offset-4"
              >
                Shakespeare
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Ripple effect on hover */}
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(-5%) translateY(-5%);
          }
          50% {
            transform: translateX(-10%) translateY(0);
          }
          75% {
            transform: translateX(-5%) translateY(5%);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-wave {
          animation: wave linear infinite;
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
