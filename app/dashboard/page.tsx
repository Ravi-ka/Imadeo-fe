'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Server, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { getToken, isLoaded, signOut } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        if (!isLoaded) return;
        
        // Get the JWT token from Clerk to send to our backend
        const token = await getToken();
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/health', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching health data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setHealthData(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while reaching the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, [isLoaded, getToken]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Server className="w-8 h-8 text-primary" />
              System Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Viewing backend health metrics and status
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => signOut({ redirectUrl: '/login' })}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {loading || !isLoaded ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Connecting to backend...</p>
            </div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger/10 border border-danger/20 rounded-xl p-6 flex items-start gap-4"
            >
              <AlertCircle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
              <div>
                <h3 className="text-danger font-semibold text-lg">Connection Failed</h3>
                <p className="text-danger/80 mt-1">{error}</p>
                <p className="text-danger/60 text-sm mt-3">Ensure your backend is running at http://localhost:8000</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Backend is online and authenticated</span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Raw Health Response
                  </h3>
                </div>
                <pre className="text-sm font-mono text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
