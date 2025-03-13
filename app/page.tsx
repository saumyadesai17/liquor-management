// app/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="py-6 px-4 md:px-8 lg:px-16 flex justify-between items-center backdrop-blur-lg bg-background/80 sticky top-0 z-50 border-b border-border/50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">L</span>
          </div>
          <span className="text-foreground font-bold text-2xl md:text-3xl">LiquorPOS</span>
        </motion.div>
        {/* <div className="space-x-4 md:space-x-6">
          <Link href="/login" className="text-foreground font-medium hover:text-primary transition-colors px-4 py-2 text-base md:text-lg">
            Login
          </Link>
          <Link href="/signup" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105">
            Sign Up Free
          </Link>
        </div> */}
      </header>
      
      {/* Hero Section */}
      <main className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/50 to-transparent" />
        </div>
        
        <div className="relative px-4 md:px-8 lg:px-16 py-16 md:py-24 lg:py-32 xl:py-40">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-8 leading-tight">
                  Modern POS for Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Holi Party
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Streamline your event with our powerful POS system. Manage inventory, process sales, and track analytics in real-time.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/signup" 
                      className="bg-primary px-8 py-4 rounded-xl font-medium text-lg md:text-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl inline-block w-full sm:w-auto"
                      style={{ color: 'white' }}
                    >
                      Get Started Free
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/login" 
                      className="bg-secondary text-foreground px-8 py-4 rounded-xl font-medium text-lg md:text-xl hover:bg-secondary/80 transition-all inline-block w-full sm:w-auto border-2 border-border"
                    >
                      Live Demo →
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative lg:block"
              >
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl overflow-hidden border border-border shadow-2xl">
                  <div className="absolute inset-0 bg-grid-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                  <div className="relative p-6">
                    <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-5 bg-secondary rounded-lg w-3/4" />
                        <div className="h-5 bg-secondary rounded-lg w-1/2" />
                        <div className="h-5 bg-secondary rounded-lg w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square">
                  <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-spin-slow" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Features Section */}
      <section className="relative py-24 lg:py-32 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need for Your Event
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
              Powerful features to make your event management seamless and efficient
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
            {[
              {
                title: "Smart Inventory",
                description: "Automatically track stock levels and get alerts when inventory runs low.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )
              },
              {
                title: "Quick Sales",
                description: "Process transactions rapidly with support for multiple payment methods.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                title: "Real-time Insights",
                description: "Monitor sales and inventory metrics with beautiful real-time dashboards.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-lg text-foreground/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
          <div className="absolute inset-0 bg-grid-white/10" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your Event?
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto">
            Join thousands of event organizers who trust LiquorPOS for their operations.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link 
              href="/signup" 
              className="bg-primary text-primary-foreground px-10 py-5 rounded-xl font-medium text-xl inline-flex items-center space-x-3 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              <span style={{ color: 'white' }}>Start Free Trial</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="relative bg-card/50 backdrop-blur-sm text-foreground py-16 px-4 md:px-8 lg:px-16 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">L</span>
                </div>
                <span className="text-foreground font-bold text-2xl">LiquorPOS</span>
              </div>
              <p className="text-foreground/80 text-lg">
                Modern point of sale system for events and parties.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground text-xl mb-6">Product</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground text-xl mb-6">Company</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground text-xl mb-6">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/80 text-lg mb-4 md:mb-0">
              © 2025 LiquorPOS. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}