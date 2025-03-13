'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Fetch user profile to get role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Redirect based on role
        if (profileData?.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/pos');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto sm:max-w-md">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-muted-foreground">
          Or{' '}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-foreground">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full mx-auto sm:max-w-md">
        <div className="bg-card py-6 px-4 sm:py-8 sm:px-10 shadow sm:rounded-lg border border-border">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-4 sm:space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-accent focus:border-accent text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-accent focus:border-accent text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-foreground">
                  Remember me
                </label>
              </div>

              <div className="text-xs sm:text-sm">
                <Link href="#" className="font-medium text-accent hover:text-accent-foreground">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-xs sm:text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}