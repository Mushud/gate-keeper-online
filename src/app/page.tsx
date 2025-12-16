import Link from 'next/link';
import { ShieldIcon, CheckmarkCircleIcon, LockIcon, ZapIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 mb-4">
            <HugeiconsIcon icon={ShieldIcon} size={40} strokeWidth={1.5} className="text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 leading-tight">
            GateKeeperPro
            <span className="block text-zinc-600 text-3xl md:text-4xl mt-2">
              Online Checkout
            </span>
          </h1>

          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Professional OTP verification interface for seamless user authentication.
            Secure, fast, and beautiful.
          </p>

          <div className="flex flex-col items-center gap-4 pt-6">
            <a 
              href="https://gatekeeperpro.cc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Visit GateKeeperPro
            </a>
            <p className="text-sm text-zinc-500 max-w-xl">
              To use the checkout, create a session via the API and you'll receive a unique checkout URL.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-zinc-900">
            Everything you need for OTP verification
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100">
                <HugeiconsIcon icon={ShieldIcon} size={24} strokeWidth={1.5} className="text-zinc-900" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">
                Secure
              </h3>
              <p className="text-zinc-600">
                3-strike system with automatic lockout and rate limiting
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100">
                <HugeiconsIcon icon={ZapIcon} size={24} strokeWidth={1.5} className="text-zinc-900" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">
                Fast
              </h3>
              <p className="text-zinc-600">
                Background name resolution and instant SMS delivery
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100">
                <HugeiconsIcon icon={CheckmarkCircleIcon} size={24} strokeWidth={1.5} className="text-zinc-900" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">
                Simple
              </h3>
              <p className="text-zinc-600">
                Clean, professional UI that works on any device
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100">
                <HugeiconsIcon icon={LockIcon} size={24} strokeWidth={1.5} className="text-zinc-900" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">
                Reliable
              </h3>
              <p className="text-zinc-600">
                Built with Next.js 15, TypeScript, and modern best practices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="container mx-auto px-4 py-20 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-zinc-900">
            How it works
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">
                  Create Checkout Session
                </h3>
                <p className="text-zinc-600">
                  Use your project API key to create a checkout session with success/failure callback URLs.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">
                  Redirect User
                </h3>
                <p className="text-zinc-600">
                  Send your user to the unique checkout URL. They'll see your project name and verification interface.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">
                  User Verifies
                </h3>
                <p className="text-zinc-600">
                  User enters their phone number, receives OTP via SMS, and verifies with a 6-digit code.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">
                  Handle Callback
                </h3>
                <p className="text-zinc-600">
                  User is redirected to your success URL with verified phone, name, and metadata. Create their account!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-12 border-t border-zinc-100">
        <div className="text-center text-zinc-600 text-sm">
          <p>
            Powered by{' '}
            <a 
              href="https://gatekeeperpro.cc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-zinc-900 hover:text-zinc-700 transition-colors"
            >
              GateKeeperPro
            </a>
          </p>
          <p className="mt-2">
            Secure OTP verification for modern applications
          </p>
        </div>
      </div>
    </div>
  );
}
