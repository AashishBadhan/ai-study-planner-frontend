/**
 * Dashboard Component with Analytics and Visualizations
 */
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { apiClient } from '@/lib/api';
import { AnalysisResponse, TopicAnalysis } from '@/types';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAnalysis();
      setAnalysis(response.data);
    } catch (error: any) {
      console.error('Analysis error:', error);
      if (error.response?.status === 400) {
        toast.error('No data available. Please upload exam papers first.');
      } else {
        toast.error('Failed to load analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.total_questions === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Yet</h2>
          <p className="text-gray-600">
            Upload some exam papers to get started with your personalized study plan!
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const topicChartData = analysis.topics.slice(0, 10).map(topic => ({
    name: topic.topic.length > 20 ? topic.topic.substring(0, 20) + '...' : topic.topic,
    questions: topic.frequency,
    importance: (topic.importance_score * 100).toFixed(0),
  }));

  const importanceData = analysis.topics.slice(0, 6).map((topic, index) => ({
    name: topic.topic,
    value: topic.frequency,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis of your exam preparation</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Questions"
            value={analysis.total_questions}
            icon="❓"
            color="blue"
          />
          <StatCard
            title="Topics Identified"
            value={analysis.topics.length}
            icon="📋"
            color="green"
          />
          <StatCard
            title="Repeated Questions"
            value={analysis.repeated_questions.length}
            icon="🔁"
            color="yellow"
          />
          <StatCard
            title="Top Predictions"
            value={analysis.predictions.length}
            icon="🎯"
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Topic Distribution Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Topic Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="questions" fill="#3b82f6" name="Questions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Importance Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Topic Importance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={importanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {importanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Important Topics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔥 Most Important Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.important_topics.map((topic, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Top Predicted Questions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 Top Predicted Questions
          </h3>
          <div className="space-y-3">
            {analysis.predictions.slice(0, 10).map((prediction, index) => (
              <div
                key={prediction.id}
                className="border-l-4 border-primary-500 bg-gray-50 p-4 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-primary-600">
                        #{index + 1}
                      </span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Importance: {(prediction.importance_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-gray-700">{prediction.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
