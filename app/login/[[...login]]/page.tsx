import { SignIn } from '@clerk/nextjs';
import { Logo, LogoLockup } from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-stretch bg-background-light dark:bg-background-dark">
      
      {/* Left side Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 z-10">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Logo & Header */}
          <div className="space-y-3 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Logo />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage your media assets & processing queues.
            </p>
          </div>

          <div className="w-full flex justify-center lg:justify-start">
             <SignIn appearance={{
               elements: {
                 rootBox: "w-full",
                 cardBox: "w-full shadow-xl rounded-2xl",
               }
             }} />
          </div>

        </div>
      </div>

      {/* Right side Brand panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-slate-950 via-primary-dark to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative">
          <LogoLockup className="h-16 w-auto" />
        </div>

        <div className="relative space-y-4 max-w-md">
          <h3 className="text-3xl font-extrabold text-white leading-snug">
            Streamline your media workloads instantly.
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Configure automated WebP fallback compression, ffmpeg video presets, and temporary storage signed URLs in seconds.
          </p>
        </div>

        <div className="relative text-xs text-slate-500 font-mono flex justify-between">
          <span>SYSTEM STATUS: OK</span>
          <span>LATENCY: 12ms</span>
        </div>
      </div>

    </div>
  );
}
