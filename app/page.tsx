'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Sparkles, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  HardDrive, 
  Share2, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  Database,
  Maximize2,
  FileCode2,
  Lock,
  Workflow,
  FolderOpen,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: FolderOpen,
      title: 'Media Asset Management',
      description: 'Upload, manage, rename, and organize your digital assets with an intuitive grid and list interface.'
    },
    {
      icon: Users,
      title: 'Workspace Collaboration',
      description: 'Create isolated workspaces to manage your assets for different teams or projects seamlessly.'
    },
    {
      icon: LayoutDashboard,
      title: 'Rich Dashboard Analytics',
      description: 'Track your total assets, storage usage, and recent uploads from a centralized dashboard.'
    },
    {
      icon: Share2,
      title: 'Secure File Actions',
      description: 'Download files, mark your favorites, and generate instant sharing links for your media assets.'
    }
  ];

  const technologies = [
    { name: 'Next.js 15 & React 19', category: 'Frontend', desc: 'App Router architecture with Server Components & Hooks', color: 'border-blue-500/20' },
    { name: 'Clerk Auth', category: 'Security', desc: 'Secure authentication and session management for users', color: 'border-purple-500/20' },
    { name: 'Zustand & React Query', category: 'State Management', desc: 'Efficient client-side state and async data fetching', color: 'border-amber-500/20' },
    { name: 'Tailwind CSS & Framer', category: 'Styling & Animation', desc: 'Utility-first styling with smooth layout animations', color: 'border-emerald-500/20' }
  ];

  const plans = [
    {
      name: 'Developer',
      price: '$0',
      description: 'Ideal for individuals and small personal projects.',
      features: ['1 Workspace', 'Standard asset management', 'Grid & List views', 'Basic file sharing'],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro Platform',
      price: '$29',
      description: 'For growing teams requiring robust organization.',
      features: ['Unlimited Workspaces', 'Advanced filtering', 'Image converter (soon)', 'Priority support'],
      cta: 'Get Started Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Dedicated resources and custom integrations.',
      features: ['Custom storage limits', 'Dedicated account manager', 'Custom integrations', '24/7 Dedicated engineering'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How does Imadeo manage workspaces?',
      answer: 'Imadeo allows you to switch between multiple workspaces, keeping your digital assets segregated and organized for different projects or teams.'
    },
    {
      question: 'What types of assets can I upload?',
      answer: 'You can upload various types of media assets including images, videos, and documents, all accessible from a unified dashboard view.'
    },
    {
      question: 'Is the image converter available?',
      answer: 'The image converter and other advanced transformation tools are currently in development and will be rolling out soon.'
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            
            {/* Pill Tag */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-primary"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Modern Digital Asset Management</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Organize, Share & Manage Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Media Assets
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Imadeo provides an intuitive Digital Asset Management platform to upload, organize, favorite, and securely share your media files across multiple workspaces.
            </motion.p>

            {/* Action buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/dashboard/overview">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore DAM Dashboard
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Built for Modern Digital Asset Pipelines
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Imadeo handles all details of media asset organization, sharing, and delivery so you can focus on building your app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={`feature-${i}`}
                whileHover={{ y: -6 }}
                className="p-6 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Fair, Transparent Pricing
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Pick the plan that suits your media workflow. Spin up our pipeline instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan, i) => (
              <div
                key={`plan-${i}`}
                className={`p-8 rounded-2xl flex flex-col justify-between relative ${
                  plan.popular 
                    ? 'border-2 border-primary bg-white dark:bg-slate-900 shadow-xl scale-105 z-10' 
                    : 'border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                  </div>
                  
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-slate-500">/month</span>}
                  </div>

                  <ul className="space-y-3 pt-6 border-t border-slate-150 dark:border-slate-800">
                    {plan.features.map((feature, fIdx) => (
                      <li key={`feature-spec-${fIdx}`} className="flex items-start space-x-3 text-sm">
                        <CheckCircle2 className="w-4.5 h-4.5 text-success shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-350">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/register" className="w-full">
                    <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Clear answers to standard usage & feature questions.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={`faq-${i}`}
                  className="border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/30 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/40 pt-4"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
