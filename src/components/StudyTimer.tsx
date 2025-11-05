/**
 * Study Timer Component with Pomodoro Technique
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { apiClient } from '@/lib/api';
import { TimerState, TimerStats } from '@/types';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');

interface StudyTimerProps {
  userId?: string;
  currentTopic?: string;
}

export default function StudyTimer({ userId = 'default_user', currentTopic }: StudyTimerProps) {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [stats, setStats] = useState<TimerStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize timer and WebSocket connection
  useEffect(() => {
    initializeTimer();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  const initializeTimer = async () => {
    try {
      await apiClient.createTimer(userId, 25, 5, 15, 4);
      fetchTimerState();
      fetchStats();
    } catch (error) {
      console.error('Timer initialization error:', error);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`${WS_URL}/api/timer/ws/${userId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTimerState(data.state);

      // Show notification if available
      if (data.notification) {
        toast.success(data.notification, { duration: 5000 });
        
        // Play notification sound (optional)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Study Timer', { body: data.notification });
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt reconnection after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
  };

  const fetchTimerState = async () => {
    try {
      const response = await apiClient.getTimerState(userId);
      setTimerState(response.data.state);
    } catch (error) {
      console.error('Error fetching timer state:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getTimerStats(userId);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStart = async () => {
    try {
      await apiClient.startTimer(userId, currentTopic);
      toast.success('Timer started!');
    } catch (error) {
      toast.error('Failed to start timer');
    }
  };

  const handlePause = async () => {
    try {
      await apiClient.pauseTimer(userId);
      toast.success('Timer paused');
    } catch (error) {
      toast.error('Failed to pause timer');
    }
  };

  const handleReset = async () => {
    try {
      await apiClient.resetTimer(userId);
      fetchStats();
      toast.success('Timer reset');
    } catch (error) {
      toast.error('Failed to reset timer');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!timerState) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const progressPercentage = timerState.is_break
    ? 100 - (timerState.time_remaining / (5 * 60)) * 100
    : 100 - (timerState.time_remaining / (25 * 60)) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Connection Status */}
      <div className="flex items-center justify-end mb-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="ml-2 text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
            {timerState.is_break ? '☕ Break Time' : '📚 Focus Time'}
          </h3>
          {currentTopic && !timerState.is_break && (
            <p className="text-xs text-gray-400">{currentTopic}</p>
          )}
        </div>

        {/* Circular Progress */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={timerState.is_break ? '#10b981' : '#3b82f6'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progressPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800">
                {formatTime(timerState.time_remaining)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Session {timerState.current_session}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={timerState.is_running ? handlePause : handleStart}
            className={`
              p-4 rounded-full shadow-lg transition-all duration-200
              ${timerState.is_running
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-primary-500 hover:bg-primary-600'
              }
              text-white
            `}
          >
            {timerState.is_running ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8" />
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200"
          >
            <ArrowPathIcon className="w-8 h-8 text-gray-700" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.sessions_completed}
                </div>
                <div className="text-xs text-gray-500">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.total_study_minutes}
                </div>
                <div className="text-xs text-gray-500">Study mins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.total_break_minutes}
                </div>
                <div className="text-xs text-gray-500">Break mins</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
