'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('pos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      // 1. Create the user in Supabase auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (authError) throw authError;
      
      if (data?.user) {
        // 2. Create the profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            role
          });
          
        if (profileError) throw profileError;
        
        setSuccess(true);
        
        // Redirect after a longer delay to give user time to read the message
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to sign up');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto sm:max-w-md">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-foreground">
          Create your account
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-muted-foreground">
          Or{' '}
          <Link href="/login" className="font-medium text-accent hover:text-accent-foreground">
            sign in to your existing account
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
          
          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              Account created successfully! Please check your email for a confirmation link. You will be redirected to the login page in a few seconds...
            </div>
          )}
          
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSignUp}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-accent focus:border-accent text-sm"
                />
              </div>
            </div>

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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-accent focus:border-accent text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-accent focus:border-accent text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground">
                Account Type
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-accent focus:border-accent text-sm"
                >
                  <option value="admin">Administrator</option>
                  <option value="pos">POS Operator</option>
                </select>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Administrators can manage inventory and view all data. POS operators can only process sales.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or</span>
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