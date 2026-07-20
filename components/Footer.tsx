'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-background-dark/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Imadeo</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Process, optimize, secure and distribute image and video files at production-scale with high-efficiency APIs.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Guides</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Status Page</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Security Details</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">GDPR</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Imadeo Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 sm:mt-0">
            Powered by Next.js & Docker.
          </p>
        </div>
      </div>
    </footer>
  );
}
