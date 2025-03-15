'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerificationSuccess() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-md border border-border">
        <div className="text-center">
          <div className="bg-green-500/10 p-3 rounded-full inline-flex mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Email verified successfully!</h2>
          <p className="mt-2 text-muted-foreground">Your account has been activated. Redirecting you to login page in a few seconds...</p>
          <div className="mt-4">
            <Link 
              href="/login" 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}