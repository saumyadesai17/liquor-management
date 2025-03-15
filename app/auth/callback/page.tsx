'use client'; // Remove this line if using Pages Router

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // or 'next/router' for Pages Router
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [status, setStatus] = useState('loading'); // loading, success, or error

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if we have a hash fragment in the URL
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token')) {
          // Process the hash with Supabase
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error confirming email:', error);
            setMessage('There was a problem confirming your email. Please try again.');
            setStatus('error');
            return;
          }
          
          if (data?.session) {
            setMessage('Your email has been confirmed successfully!');
            setStatus('success');
            
            // Redirect to login page after showing success message
            setTimeout(() => {
              router.push('/login');
            }, 3000); // Redirect after 3 seconds
          }
        } else {
          setMessage('Invalid confirmation link. Please request a new one.');
          setStatus('error');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setMessage('An unexpected error occurred. Please try again later.');
        setStatus('error');
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-md border border-border">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{message}</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-500/10 p-3 rounded-full inline-flex mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{message}</h2>
            <p className="mt-2 text-muted-foreground">Redirecting you to login page in a few seconds...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-500/10 p-3 rounded-full inline-flex mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 w-6 h-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{message}</h2>
            <div className="mt-4">
              <Link 
                href="/login" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}