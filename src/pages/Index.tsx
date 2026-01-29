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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10 animate-gradient-bg">
      {/* Animated mesh gradient background with more intensity */}
      <div className="absolute inset-0 isolate -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tl from-accent/15 via-transparent to-primary/15 animate-gradient-shift-reverse" />
      </div>

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

      {/* Animated floating orbs with more movement */}
      <div className="absolute inset-0 isolate -z-10 opacity-25">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary/40 to-accent/30 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '20s' }} />
        <div className="absolute top-40 right-32 w-[32rem] h-[32rem] bg-gradient-to-tl from-accent/35 to-primary/25 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '25s', animationDelay: '-5s' }} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-gradient-to-tr from-primary/30 to-accent/40 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '30s', animationDelay: '-10s' }} />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-bl from-accent/30 to-primary/35 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '28s', animationDelay: '-15s' }} />
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
          {/* Main heading with animated gradient */}
          <div className="space-y-8">
            <h1 className="text-8xl md:text-9xl font-bold leading-tight tracking-tight relative">
              <span className="inline-block bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent animate-gradient-flow">
                Ride The Wave
              </span>
              {/* Shimmer overlay effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-clip-text text-transparent pointer-events-none">
                Ride The Wave
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up">
              Experience social connection that flows naturally. Dive into a desktop client designed for depth, discovery, and fluid interaction.
            </p>
          </div>

          {/* CTA - Bigger with animated gradient */}
          <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              className="relative text-2xl px-12 py-8 rounded-3xl bg-gradient-to-r from-primary via-accent to-primary hover:shadow-2xl hover:shadow-primary/60 hover:scale-110 transition-all duration-300 group font-semibold overflow-hidden animate-gradient-button"
            >
              <span className="relative z-10 flex items-center">
                <Waves className="w-7 h-7 mr-3 group-hover:animate-pulse" />
                Dive In
              </span>
              {/* Animated shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-button-shine" />
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

      {/* Advanced animations */}
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

        @keyframes float-complex {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(40px, -40px) scale(1.15) rotate(5deg);
          }
          50% {
            transform: translate(-30px, -20px) scale(0.95) rotate(-5deg);
          }
          75% {
            transform: translate(20px, 30px) scale(1.05) rotate(3deg);
          }
        }

        @keyframes gradient-flow {
          0%, 100% {
            background-position: 0% 50%;
            background-size: 300% 300%;
          }
          50% {
            background-position: 100% 50%;
            background-size: 300% 300%;
          }
        }

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

        @keyframes gradient-shift-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-20px, -20px) scale(1.05);
            opacity: 1;
          }
        }

        @keyframes gradient-bg {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes button-shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-wave {
          animation: wave linear infinite;
        }

        .animate-float-complex {
          animation: float-complex ease-in-out infinite;
        }

        .animate-gradient-flow {
          background-size: 300% 300%;
          animation: gradient-flow 6s ease infinite;
        }

        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }

        .animate-gradient-shift-reverse {
          animation: gradient-shift-reverse 20s ease-in-out infinite;
        }

        .animate-gradient-bg {
          background-size: 400% 400%;
          animation: gradient-bg 20s ease infinite;
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .animate-gradient-button {
          background-size: 200% 200%;
          animation: gradient-flow 4s ease infinite;
        }

        .animate-button-shine {
          animation: button-shine 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Index;
