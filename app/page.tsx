'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navbar 
} from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Cpu, 
  Image as ImageIcon, 
  Video, 
  Grid, 
  FileText, 
  Lock, 
  ShieldCheck,
  Zap, 
  ArrowRight,
  Database,
  Layers,
  ChevronDown,
  CheckCircle2,
  Share2,
  Maximize2
} from 'lucide-react';

// Pricing plans
const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for local experiments and small hobby projects.',
    features: [
      'Up to 100 media uploads / mo',
      'Standard image optimization',
      'Basic watermark templates',
      'Metadata extraction',
      'Community support',
    ],
    cta: 'Start for Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For growing applications requiring high performance and speed.',
    features: [
      'Up to 15,000 media uploads / mo',
      'Ultra-fast Video Transcoding',
      'Custom watermarking presets',
      'Redis & RabbitMQ processing queue priority',
      'Dedicated API endpoint keys',
      'Email support (under 2 hours)',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored for high-scale enterprise workflows and custom storage.',
    features: [
      'Unlimited uploads & transcoding',
      'Custom S3 / MinIO storage support',
      'SLA guarantees & priority routing',
      'On-premise Docker deployment support',
      'Dedicated account engineer',
      '24/7 Phone & Slack support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

// Feature Items
const features = [
  {
    title: 'Image Optimization',
    description: 'Auto-compress WebP/AVIF conversions preserving absolute visual quality.',
    icon: ImageIcon,
  },
  {
    title: 'Video Transcoding',
    description: 'Multi-resolution HLS, MP4 chunking, and encoding powered by ffmpeg.',
    icon: Video,
  },
  {
    title: 'Thumbnail Generation',
    description: 'Instant, intelligent smart-cropping at custom coordinates.',
    icon: Grid,
  },
  {
    title: 'Dynamic Watermarking',
    description: 'Superimpose transparent, secure watermarks with customized positioning.',
    icon: Lock,
  },
  {
    title: 'Metadata Extraction',
    description: 'Parse EXIF geolocation data, resolution, bitrates, and video codecs.',
    icon: FileText,
  },
  {
    title: 'Secure Sharing',
    description: 'Temporary signed URLs and AES-256 access controlled delivery.',
    icon: ShieldCheck,
  },
  {
    title: 'Detailed Analytics',
    description: 'Monitor storage latency, bandwidth usage, and task processing times.',
    icon: Sparkles,
  },
  {
    title: 'Background Queue',
    description: 'Asynchronous workers powered by RabbitMQ & Redis message loops.',
    icon: Cpu,
  },
];

// Tech stack logo definitions
const technologies = [
  { name: 'Express.js', category: 'Backend Framework', desc: 'TS Router API', color: 'border-green-500/20 text-green-400' },
  { name: 'RabbitMQ', category: 'Message Broker', desc: 'Task Distribution Queues', color: 'border-orange-500/20 text-orange-400' },
  { name: 'Redis', category: 'Cache & Pub/Sub', desc: 'Realtime Rate-limiting & Status', color: 'border-red-500/20 text-red-400' },
  { name: 'PostgreSQL', category: 'Relational Database', desc: 'Metadata & Configuration', color: 'border-blue-500/20 text-blue-400' },
  { name: 'MongoDB', category: 'Document Store', desc: 'Flexible Asset Schemas', color: 'border-emerald-500/20 text-emerald-400' },
  { name: 'MinIO (S3)', category: 'Object Storage', desc: 'Raw & Optimized File Buckets', color: 'border-cyan-500/20 text-cyan-400' },
  { name: 'Docker', category: 'Infrastructure', desc: 'Scale workers anywhere', color: 'border-indigo-500/20 text-indigo-400' },
];

// FAQs
const faqs = [
  {
    question: 'How does the video transcoding work under the hood?',
    answer: 'Imadeo offloads heavy transcoding tasks. When a video is uploaded, an API request triggers a RabbitMQ job. Autoscale workers download the file, process it into HLS streams using multi-threaded ffmpeg, upload segments to MinIO/S3, and emit updates via Redis Pub/Sub.'
  },
  {
    question: 'Can I hook up my own S3/MinIO bucket storage?',
    answer: 'Yes! Pro and Enterprise users can specify custom storage connection credentials, letting Imadeo write optimized outputs directly into your cloud accounts without staging them on ours.'
  },
  {
    question: 'What image formats do you support for optimization?',
    answer: 'We support PNG, JPEG, WebP, AVIF, TIFF, and SVG. Our system automatically chooses the best resolution, compression, and format according to client browser headers.'
  },
  {
    question: 'Is there a limit on file upload size?',
    answer: 'On the Free tier, file size limits are 10MB for images and 50MB for videos. Pro accounts scale up to 1GB for video files.'
  }
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary dark:text-primary-light text-xs font-semibold">
              <Sparkles className="w-4.5 h-4.5" />
              <span>Version 2.0 API is now live</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Process, Optimize & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Manage Your Media
              </span> <br />
              at Scale.
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              An enterprise-grade media processing pipeline. Upload images or videos, configure optimization filters, embed watermarks, and distribute via high-speed global storage API.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
              <a href="#architecture">
                <Button variant="outline" size="lg">
                  View Architecture
                </Button>
              </a>
            </div>
          </div>

          {/* Animated Illustration: Media Flow Pipeline Simulation */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md aspect-square rounded-2xl glass-panel glow-blue p-6 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Floating nodes simulation */}
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <span className="text-xs font-mono text-slate-400">PIPELINE MONITOR</span>
                <span className="flex items-center text-xs text-success font-semibold">
                  <span className="w-2.5 h-2.5 bg-success rounded-full animate-ping mr-2" />
                  Active Node
                </span>
              </div>

              {/* Dynamic Queue Visualization */}
              <div className="flex flex-col space-y-4 my-6 relative">
                {/* File Upload card */}
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3"
                >
                  <div className="p-2 bg-primary/10 rounded text-primary">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">raw_hero_video.mp4</p>
                    <p className="text-[10px] text-slate-400">124.8 MB • Pending Queue</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-warning/10 text-warning rounded-full font-medium">Transcoding</span>
                </motion.div>

                {/* Arrow down connecting flow */}
                <div className="w-full flex justify-center py-1">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-primary to-secondary animate-pulse" />
                </div>

                {/* Worker processing details */}
                <motion.div 
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
                  className="bg-slate-550 dark:bg-slate-900 p-3 rounded-lg border border-primary/30 shadow-md flex items-center space-x-3"
                >
                  <div className="p-2 bg-secondary/10 rounded text-secondary animate-spin">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">FFmpeg Worker #04</p>
                    <p className="text-[10px] text-slate-400">Applying Watermark & HLS Chunking...</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-primary">64%</span>
                  </div>
                </motion.div>

                {/* Arrow down connecting flow */}
                <div className="w-full flex justify-center py-1">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-secondary to-accent animate-pulse" />
                </div>

                {/* Optimized S3 result */}
                <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                  <div className="p-2 bg-accent/10 rounded text-accent">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">stream_720p.m3u8</p>
                    <p className="text-[10px] text-success">Optimized • Uploaded to MinIO</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-success/10 text-success rounded-full font-medium">Done</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>CPU: 42%</span>
                <span>QUEUE: 1 ACTIVE JOB</span>
                <span>SPEED: 4.8MB/S</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-slate-950/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Built for Modern Media Flow
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Imadeo handles all details of media asset processing, compression, and delivery so you can focus on building your app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
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

      {/* 3. Architecture Section */}
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

          {/* Interactive SVG / Flowchart Diagram */}
          <div className="w-full glass-panel glow-purple p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center w-full relative">
              
              {/* Step 1: Upload */}
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                  <Share2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">1. REST Upload</h4>
                <p className="text-xs text-slate-400 mt-1">Image or Video via Express REST API</p>
              </div>

              {/* Connector 1 */}
              <div className="hidden md:flex justify-center text-primary animate-pulse">
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Step 2: Queue */}
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center mb-3">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">2. Processing Queue</h4>
                <p className="text-xs text-slate-400 mt-1">Decoupled dispatch via RabbitMQ & Redis</p>
              </div>

              {/* Connector 2 */}
              <div className="hidden md:flex justify-center text-secondary animate-pulse">
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Step 3: Workers */}
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
              
              {/* Storage */}
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

              {/* Delivery */}
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

      {/* 4. Tech Stack Section */}
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
                key={i}
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

      {/* 5. Pricing Section */}
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
                key={i}
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
                      <li key={fIdx} className="flex items-start space-x-3 text-sm">
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

      {/* 6. FAQ Section */}
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
                  key={i}
                  className="border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/30 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 text-sm text-slate-650 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                          {faq.answer}
                        </div>
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
    </>
  );
}
