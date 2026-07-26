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
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Cpu,
      title: 'Automated Compression & Presets',
      description: 'Convert raw images to modern WebP and transcode videos with automated ffmpeg configurations seamlessly.'
    },
    {
      icon: ShieldCheck,
      title: 'Dynamic Watermarking & Protection',
      description: 'Stamp custom brand watermarks onto your digital assets with opacity and position controls.'
    },
    {
      icon: Share2,
      title: 'Signed URL Security & Sharing',
      description: 'Generate temporary presigned URLs with custom expiration times for secure asset distribution.'
    },
    {
      icon: HardDrive,
      title: 'Decoupled Worker Architecture',
      description: 'Built on asynchronous queues with RabbitMQ and Redis to ensure main API threads remain responsive.'
    }
  ];

  const technologies = [
    { name: 'Next.js 15 & React 19', category: 'Frontend', desc: 'App Router architecture with TypeScript & Tailwind CSS styling', color: 'border-blue-500/20' },
    { name: 'Express & Node.js', category: 'API Backend', desc: 'Modular controller services handling media uploads and routing', color: 'border-purple-500/20' },
    { name: 'RabbitMQ & Redis', category: 'Queue System', desc: 'Asynchronous event driven architecture for background workers', color: 'border-amber-500/20' },
    { name: 'MinIO & S3 API', category: 'Object Storage', desc: 'High-performance bucket storage compatible with AWS S3 APIs', color: 'border-emerald-500/20' }
  ];

  const plans = [
    {
      name: 'Developer',
      price: '$0',
      description: 'Ideal for small projects and initial integration testing.',
      features: ['Up to 5GB Storage', '1,000 monthly media ops', 'Standard WebP conversion', 'Community support'],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro Platform',
      price: '$49',
      description: 'For growing applications requiring automated queue pipelines.',
      features: ['100GB Storage', '50,000 monthly media ops', '4K Video ffmpeg presets', 'Dynamic watermarks', 'Signed URLs'],
      cta: 'Get Started Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Dedicated clusters, high throughput queues and custom SLA.',
      features: ['Unlimited Storage', 'Custom worker worker pool', 'Private MinIO instance', '24/7 Dedicated engineering'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How does Imadeo handle large media uploads?',
      answer: 'Imadeo streams uploads through decoupled async queues using Express and RabbitMQ. Media processing is offloaded to background worker threads so client API responses stay instantaneous.'
    },
    {
      question: 'Is MinIO compatible with Amazon S3 SDKs?',
      answer: 'Yes! MinIO exposes full S3 API compatibility. You can use standard AWS SDKs to read, write, and generate signed URLs effortlessly.'
    },
    {
      question: 'Can I customize image and video presets?',
      answer: 'Absolutely. You can define custom quality targets, dimensions, WebP fallbacks, and ffmpeg bitrate settings via simple JSON config presets.'
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
              <span>Next-Gen Media Processing Engine</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Process, Transcode & Manage Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Media at Scale
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Imadeo provides enterprise-grade Digital Asset Management, automated WebP image optimization, ffmpeg video transcoding, and signed URLs — all built on scalable worker queues.
            </motion.p>

            {/* Action buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/dashboard">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore DAM Dashboard
                </Button>
              </Link>
              <Link href="#architecture">
                <Button variant="outline" size="lg">
                  View Architecture
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
              Imadeo handles all details of media asset processing, compression, and delivery so you can focus on building your app.
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

      {/* Architecture Section */}
      <section id="architecture" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Robust Pipeline Architecture
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Highly distributed backend stack optimized for latency, file reliability, and scalability.
            </p>
          </div>

          <div className="w-full glass-panel glow-purple p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center w-full relative">
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                  <Share2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">1. REST Upload</h4>
                <p className="text-xs text-slate-400 mt-1">Image or Video via Express REST API</p>
              </div>

              <div className="hidden md:flex justify-center text-primary animate-pulse">
                <ArrowRight className="w-6 h-6" />
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center mb-3">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">2. Processing Queue</h4>
                <p className="text-xs text-slate-400 mt-1">Decoupled dispatch via RabbitMQ & Redis</p>
              </div>

              <div className="hidden md:flex justify-center text-secondary animate-pulse">
                <ArrowRight className="w-6 h-6" />
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">3. Node.js Workers</h4>
                <p className="text-xs text-slate-400 mt-1">Scalable multi-core CPU media transcoders</p>
              </div>
            </div>

            <div className="w-full flex justify-center my-6">
              <div className="h-8 w-0.5 bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center w-full max-w-4xl">
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">4. Optimized MinIO (S3)</h4>
                <p className="text-xs text-slate-400 mt-1">Object buckets storage storing raw/processed streams</p>
              </div>

              <div className="hidden md:flex justify-center text-slate-300 dark:text-slate-700">
                <span>&mdash;&mdash;&mdash;&mdash;&mdash;&gt;</span>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center mb-3">
                  <Maximize2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">5. Direct Delivery</h4>
                <p className="text-xs text-slate-400 mt-1">Ultra-low latency CDN optimized signed URL asset path</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Powered by Proven Infrastructure
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Imadeo backend relies on modern microservices design constructed using premium dev tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, i) => (
              <div
                key={`tech-${i}`}
                className={`p-6 rounded-xl bg-white dark:bg-slate-900 border ${tech.color} flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tech.category}</span>
                  <h4 className="text-xl font-bold mt-2 text-slate-900 dark:text-slate-100">{tech.name}</h4>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">{tech.desc}</p>
              </div>
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
              Clear answers to standard architecture & configuration questions.
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
