'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If not authenticated, redirect to login
          router.push('/login');
          return;
        }
        
        // Get user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        
        // Check if user has access to the current route
        if (data.role !== 'admin' && pathname?.includes('/admin')) {
          router.push('/dashboard');
        }
        
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
  }, [pathname, router]);
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      router.push('/login');
    }
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) && 
          toggleButton && 
          !toggleButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);
  
  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  // If no profile was found, show a message
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card p-6 rounded-lg shadow-md border border-border max-w-md w-full">
          <h2 className="text-xl font-medium mb-2 text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access this page.</p>
          <Link 
            href="/login" 
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="bg-card border-b border-border fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              id="sidebar-toggle"
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary focus:outline-none transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <Link href="/dashboard" className="font-bold text-xl text-accent ml-2 md:ml-0">
              LiquorPOS
            </Link>
          </div>
          
          <div className="flex items-center">
            {/* Only show user greeting and logout on desktop */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-foreground text-base truncate max-w-[200px]">
                Hi, {profile.name}
              </span>
            </div>
            
            {/* Show only user greeting on mobile */}
            <span className="md:hidden text-foreground text-sm truncate max-w-[150px]">
              Hi, {profile.name}
            </span>
          </div>
        </div>
      </header>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - fixed position */}
      <aside 
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-16 left-0 bottom-0 w-full md:w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 md:translate-x-0 shadow-lg md:shadow-none flex flex-col`}
      >
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* User profile info at the top of sidebar on mobile */}
          <div className="md:hidden p-4 border-b border-border">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mr-3">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.role}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation links - with scrollable container */}
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <nav className="space-y-1">
              <Link 
                href="/dashboard" 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                  pathname === '/dashboard' 
                    ? 'bg-secondary text-accent' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } transition-colors`}
              >
                <svg 
                  className={`mr-3 h-5 w-5 ${
                    pathname === '/dashboard' ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                  } transition-colors`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              
              <Link 
                href="/pos" 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                  pathname === '/pos' 
                    ? 'bg-secondary text-accent' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } transition-colors`}
              >
                <svg 
                  className={`mr-3 h-5 w-5 ${
                    pathname === '/pos' ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                  } transition-colors`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Point of Sale
              </Link>
              
              {profile.role === 'admin' && (
                <>
                  <Link 
                    href="/inventory" 
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                      pathname === '/inventory' 
                        ? 'bg-secondary text-accent' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    } transition-colors`}
                  >
                    <svg 
                      className={`mr-3 h-5 w-5 ${
                        pathname === '/inventory' ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                      } transition-colors`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                      />
                    </svg>
                    Inventory
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          {/* Sign out button in sidebar - always visible at bottom */}
          <div className="border-t border-border p-4 mt-auto sticky bottom-0 bg-card">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-accent bg-secondary/50 hover:bg-secondary py-2 rounded-md transition-colors"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content - with padding to account for fixed header and sidebar */}
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}