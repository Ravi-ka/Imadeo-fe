'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName =
    user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleSignOut = () => {
    void signOut({ redirectUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-background-dark/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link, idx) => (
                <Link
                  key={`${link.name}-${idx}`}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 border-l border-slate-200 dark:border-slate-800 pl-6">
              <ThemeToggle />

              {!isLoaded ? (
                <div className="h-8 w-24 rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
              ) : isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Hi, {displayName}
                  </span>
                  <Link href="/dashboard">
                    <Button size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 py-4 space-y-3 shadow-xl"
          >
            {navLinks.map((link, idx) => (
              <Link
                key={`mobile-${link.name}-${idx}`}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-3">
              {!isLoaded ? null : isSignedIn ? (
                <>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
                    Logged in as {user?.primaryEmailAddress?.emailAddress || displayName}
                  </span>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="outline" fullWidth onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
