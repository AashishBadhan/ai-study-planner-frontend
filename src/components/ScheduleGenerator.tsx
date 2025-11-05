/**
 * Study Schedule Generator Component
 */
'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { StudySchedule } from '@/types';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { CalendarIcon, ClockIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function ScheduleGenerator() {
  const [availableHours, setAvailableHours] = useState<number>(40);
  const [studyDuration, setStudyDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [schedule, setSchedule] = useState<StudySchedule | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (availableHours <= 0) {
      toast.error('Please enter valid available hours');
      return;
    }

    try {
      setGenerating(true);
      toast.loading('Generating personalized schedule...', { id: 'schedule' });

      const response = await apiClient.generateSchedule({
        available_hours: availableHours,
        study_duration: studyDuration,
        break_duration: breakDuration,
      });

      setSchedule(response.data);
      toast.success('Schedule generated successfully!', { id: 'schedule' });
    } catch (error: any) {
      console.error('Schedule generation error:', error);
      const message = error.response?.data?.detail || 'Failed to generate schedule';
      toast.error(message, { id: 'schedule' });
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!schedule) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('📚 Your Personalized Study Plan', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Hours: ${schedule.total_hours} | Sessions: ${schedule.total_sessions}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Topic Distribution
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Topic Time Allocation:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(schedule.topic_distribution).forEach(([topic, hours]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${topic}: ${hours} hours`, 25, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Sessions
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Study Sessions:', 20, yPosition);
    yPosition += 10;

    let currentDay = 1;
    schedule.sessions.forEach((session, index) => {
      if (session.day !== currentDay) {
        currentDay = session.day;
        yPosition += 5;
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Day ${currentDay}`, 20, yPosition);
        yPosition += 8;
      }

      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${index + 1}. ${session.topic} - ${session.duration_minutes} mins`,
        25,
        yPosition
      );
      yPosition += 7;
    });

    doc.save('study-schedule.pdf');
    toast.success('PDF downloaded successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Study Schedule Generator</h2>
        <p className="text-gray-600">Create a personalized study plan based on topic importance</p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Study Hours
            </label>
            <input
              type="number"
              value={availableHours}
              onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              max="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Total hours you can dedicate</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Duration (minutes)
            </label>
            <input
              type="number"
              value={studyDuration}
              onChange={(e) => setStudyDuration(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="10"
              max="120"
            />
            <p className="text-xs text-gray-500 mt-1">Session length</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="5"
              max="30"
            />
            <p className="text-xs text-gray-500 mt-1">Rest between sessions</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {generating ? 'Generating...' : '🚀 Generate Schedule'}
        </button>
      </div>

      {/* Schedule Display */}
      {schedule && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Schedule Summary</h3>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <ClockIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{schedule.total_hours}</div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CalendarIcon className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{schedule.total_sessions}</div>
                  <div className="text-sm text-gray-600">Study Sessions</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl">📚</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.keys(schedule.topic_distribution).length}
                  </div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Allocation by Topic</h3>
            <div className="space-y-3">
              {Object.entries(schedule.topic_distribution)
                .sort(([, a], [, b]) => b - a)
                .map(([topic, hours]) => (
                  <div key={topic} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{topic}</span>
                        <span className="text-sm text-gray-500">{hours} hours</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(hours / schedule.total_hours) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Sessions by Day */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Sessions Timeline</h3>
            {Array.from(new Set(schedule.sessions.map(s => s.day))).map(day => (
              <div key={day} className="mb-6 last:mb-0">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Day {day}
                </h4>
                <div className="space-y-2 pl-7">
                  {schedule.sessions
                    .filter(s => s.day === day)
                    .map((session, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-primary-500 bg-gray-50 p-3 rounded"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{session.topic}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {session.duration_minutes} minutes • {session.questions_to_cover.length} questions
                            </div>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {(session.importance_score * 100).toFixed(0)}% importance
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
