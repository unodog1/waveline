import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Waves, Droplets, Shell, Fish } from 'lucide-react';

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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tl from-accent/25 via-transparent to-primary/20 animate-gradient-shift-reverse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse-slow" />
      </div>

      {/* Animated wave background - more dramatic */}
      <div className="absolute inset-0 isolate -z-10 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Wave 1 - Larger, more dramatic */}
          <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-primary/40 via-primary/20 to-transparent animate-wave" 
               style={{ 
                 clipPath: 'polygon(0 40%, 5% 35%, 10% 40%, 15% 35%, 20% 45%, 25% 40%, 30% 35%, 35% 40%, 40% 35%, 45% 45%, 50% 40%, 55% 35%, 60% 40%, 65% 35%, 70% 45%, 75% 40%, 80% 35%, 85% 40%, 90% 35%, 95% 40%, 100% 35%, 100% 100%, 0 100%)',
                 animationDuration: '10s'
               }} />
          {/* Wave 2 */}
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-accent/35 via-accent/15 to-transparent animate-wave" 
               style={{ 
                 clipPath: 'polygon(0 50%, 5% 45%, 10% 50%, 15% 55%, 20% 50%, 25% 45%, 30% 50%, 35% 55%, 40% 50%, 45% 45%, 50% 50%, 55% 55%, 60% 50%, 65% 45%, 70% 50%, 75% 55%, 80% 50%, 85% 45%, 90% 50%, 95% 55%, 100% 50%, 100% 100%, 0 100%)',
                 animationDuration: '14s',
                 animationDelay: '-3s'
               }} />
          {/* Wave 3 */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-primary/30 via-primary/10 to-transparent animate-wave" 
               style={{ 
                 clipPath: 'polygon(0 60%, 5% 65%, 10% 60%, 15% 55%, 20% 60%, 25% 65%, 30% 60%, 35% 55%, 40% 60%, 45% 65%, 50% 60%, 55% 55%, 60% 60%, 65% 65%, 70% 60%, 75% 55%, 80% 60%, 85% 65%, 90% 60%, 95% 55%, 100% 60%, 100% 100%, 0 100%)',
                 animationDuration: '18s',
                 animationDelay: '-6s'
               }} />
        </div>
      </div>

      {/* Floating bubbles/particles */}
      <div className="absolute inset-0 isolate -z-10 opacity-30">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm animate-bubble-float"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Animated floating orbs - more dynamic */}
      <div className="absolute inset-0 isolate -z-10 opacity-30">
        <div className="absolute top-20 left-20 w-[30rem] h-[30rem] bg-gradient-to-br from-primary/50 via-accent/30 to-primary/40 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '18s' }} />
        <div className="absolute top-40 right-32 w-[40rem] h-[40rem] bg-gradient-to-tl from-accent/45 via-primary/30 to-accent/35 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '22s', animationDelay: '-4s' }} />
        <div className="absolute bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-primary/40 via-accent/35 to-primary/30 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '26s', animationDelay: '-8s' }} />
        <div className="absolute top-1/2 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-bl from-accent/40 via-primary/30 to-accent/45 rounded-full blur-3xl animate-float-complex" 
             style={{ animationDuration: '24s', animationDelay: '-12s' }} />
      </div>

      {/* Floating sea icons */}
      <div className="absolute inset-0 isolate -z-10 opacity-20 pointer-events-none">
        <Droplets className="absolute top-20 left-1/4 w-8 h-8 text-primary/40 animate-drift" style={{ animationDuration: '20s' }} />
        <Shell className="absolute top-40 right-1/3 w-6 h-6 text-accent/40 animate-drift" style={{ animationDuration: '25s', animationDelay: '-5s' }} />
        <Fish className="absolute bottom-1/3 left-1/3 w-10 h-10 text-primary/30 animate-drift" style={{ animationDuration: '30s', animationDelay: '-10s' }} />
        <Droplets className="absolute bottom-40 right-1/4 w-7 h-7 text-accent/40 animate-drift" style={{ animationDuration: '22s', animationDelay: '-8s' }} />
      </div>

      {/* Navigation - Glass morphism */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-background/30 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Waves className="w-8 h-8 text-primary animate-wave-icon" strokeWidth={2.5} />
            <div className="absolute inset-0 blur-lg bg-primary/60 -z-10 animate-pulse-slow" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-flow">
            Waveline
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full hover:bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-110"
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
              <span className="inline-block bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent animate-gradient-flow drop-shadow-2xl">
                Ride The Wave
              </span>
              {/* Shimmer overlay effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer bg-clip-text text-transparent pointer-events-none">
                Ride The Wave
              </span>
              {/* Glow effect behind text */}
              <span className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-30 -z-10 animate-pulse-slow">
                Ride The Wave
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up backdrop-blur-sm">
              Experience social connection that flows naturally. Dive into a desktop client designed for depth, discovery, and fluid interaction.
            </p>
          </div>

          {/* CTA - Bigger with animated gradient and glass effect */}
          <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              className="relative text-2xl px-12 py-8 rounded-3xl bg-gradient-to-r from-primary via-accent to-primary hover:shadow-2xl hover:shadow-primary/60 hover:scale-110 transition-all duration-500 group font-semibold overflow-hidden animate-gradient-button backdrop-blur-sm border-2 border-primary/30"
            >
              <span className="relative z-10 flex items-center">
                <Waves className="w-7 h-7 mr-3 group-hover:animate-wave-icon" />
                Dive In
              </span>
              {/* Animated shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-button-shine" />
              {/* Ripple effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/20 to-primary/0 group-hover:animate-ripple" />
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

      {/* Advanced sea-themed animations */}
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(-5%) translateY(-8%);
          }
          50% {
            transform: translateX(-10%) translateY(0);
          }
          75% {
            transform: translateX(-5%) translateY(8%);
          }
        }

        @keyframes float-complex {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(50px, -50px) scale(1.2) rotate(8deg);
          }
          50% {
            transform: translate(-40px, -30px) scale(0.9) rotate(-8deg);
          }
          75% {
            transform: translate(30px, 40px) scale(1.1) rotate(5deg);
          }
        }

        @keyframes bubble-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-100vh) translateX(20px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-200vh) translateX(-20px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes drift {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.4;
          }
          25% {
            transform: translate(30px, -30px) rotate(10deg);
            opacity: 0.6;
          }
          50% {
            transform: translate(-20px, -60px) rotate(-10deg);
            opacity: 0.8;
          }
          75% {
            transform: translate(40px, -90px) rotate(5deg);
            opacity: 0.6;
          }
        }

        @keyframes wave-icon {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-5deg) scale(1.05);
          }
          50% {
            transform: rotate(5deg) scale(1.1);
          }
          75% {
            transform: rotate(-3deg) scale(1.05);
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
            opacity: 0.9;
          }
          50% {
            transform: translate(30px, 30px) scale(1.15);
            opacity: 1;
          }
        }

        @keyframes gradient-shift-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-30px, -30px) scale(1.1);
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

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
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

        .animate-bubble-float {
          animation: bubble-float linear infinite;
        }

        .animate-drift {
          animation: drift ease-in-out infinite;
        }

        .animate-wave-icon {
          animation: wave-icon ease-in-out 2s infinite;
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
          animation: shimmer 2.5s linear infinite;
        }

        .animate-gradient-button {
          background-size: 200% 200%;
          animation: gradient-flow 4s ease infinite;
        }

        .animate-button-shine {
          animation: button-shine 3s ease-in-out infinite;
        }

        .animate-ripple {
          animation: ripple 1s ease-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
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
