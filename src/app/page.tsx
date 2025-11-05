/**
 * Main Application Page
 */
'use client';

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import ScheduleGenerator from '@/components/ScheduleGenerator';
import StudyTimer from '@/components/StudyTimer';
import {
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

type Tab = 'upload' | 'dashboard' | 'schedule' | 'timer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
    // Optionally switch to dashboard after upload
    setTimeout(() => setActiveTab('dashboard'), 1000);
  };

  const tabs = [
    { id: 'upload' as Tab, name: 'Upload', icon: ArrowUpTrayIcon },
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: ChartBarIcon },
    { id: 'schedule' as Tab, name: 'Schedule', icon: CalendarIcon },
    { id: 'timer' as Tab, name: 'Timer', icon: ClockIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🎓</span>
                AI Study Planner
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Smart exam preparation with AI-powered insights
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                      transition-colors duration-200
                      ${isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Exam Papers
              </h2>
              <p className="text-gray-600">
                Upload previous year papers to extract questions and analyze patterns
              </p>
            </div>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}

        {activeTab === 'schedule' && <ScheduleGenerator key={refreshKey} />}

        {activeTab === 'timer' && (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Study Timer
              </h2>
              <p className="text-gray-600">
                Use the Pomodoro technique to stay focused and productive
              </p>
            </div>
            <StudyTimer />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Built with ❤️ using Next.js, FastAPI, and AI/ML technologies</p>
            <p className="mt-1">© 2025 AI Study Planner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
