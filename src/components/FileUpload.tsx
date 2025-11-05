/**
 * File Upload Component with Drag & Drop
 */
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import { PaperUploadResponse } from '@/types';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: (response: PaperUploadResponse) => void;
}

interface ExtractedQuestion {
  id: string;
  text: string;
  topic: string;
  importance_score: number;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [subject, setSubject] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Max 10 files
    const filesToAdd = acceptedFiles.slice(0, 10);
    setSelectedFiles(prev => {
      const combined = [...prev, ...filesToAdd];
      return combined.slice(0, 10); // Max 10 total
    });
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter subject name');
      return;
    }

    setUploading(true);

    try {
      toast.loading(`Uploading ${selectedFiles.length} file(s)...`, { id: 'upload' });

      let totalQuestions = 0;
      const allTopics = new Set<string>();

      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        toast.loading(`Processing ${i + 1}/${selectedFiles.length}: ${file.name}`, { id: 'upload' });

        const response = await apiClient.uploadPaper(file, year, subject);
        const data: PaperUploadResponse = response.data;

        totalQuestions += data.questions_extracted;
        data.topics_identified.forEach(topic => allTopics.add(topic));
      }

      toast.success(
        `Successfully processed ${selectedFiles.length} files! Total: ${totalQuestions} questions, ${allTopics.size} topics.`,
        { id: 'upload', duration: 5000 }
      );

      // Fetch extracted questions for the subject
      try {
        const questionsResponse = await apiClient.getQuestions(subject, 100);
        const questions = questionsResponse.data.questions || [];
        setExtractedQuestions(questions.map((q: any, index: number) => ({
          id: q._id || `q-${index}`,
          text: q.text,
          topic: q.topic || 'General',
          importance_score: q.importance_score || 0
        })));
        setShowQuestions(true);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }

      // Reset form
      setSelectedFiles([]);

      if (onUploadComplete) {
        onUploadComplete({
          success: true,
          message: `Processed ${selectedFiles.length} files`,
          paper_id: 'batch_upload',
          extracted_text_length: 0,
          questions_extracted: totalQuestions,
          topics_identified: Array.from(allTopics)
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(
        error.response?.data?.detail || 'Failed to upload files. Please try again.',
        { id: 'upload' }
      );
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, year, subject, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt'],
    },
    maxFiles: 10,
    multiple: true,
    disabled: uploading || !subject.trim(),
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Subject Input - REQUIRED FIRST */}
      <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          📚 Step 1: Enter Subject Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Mathematics, Physics, Chemistry..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          disabled={uploading}
        />
        {!subject.trim() && (
          <p className="mt-2 text-sm text-orange-600 font-medium">
            ⚠️ Subject name is required before uploading files
          </p>
        )}
      </div>

      {/* Year Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📅 Step 2: Year (Optional)
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="2024"
          disabled={uploading}
        />
      </div>

      {/* File Upload */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : subject.trim() ? 'border-gray-300 hover:border-blue-400' : 'border-gray-200 bg-gray-50'
          }
          ${uploading || !subject.trim() ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-600">Processing files...</p>
            </>
          ) : (
            <>
              {isDragActive ? (
                <DocumentIcon className="h-12 w-12 text-blue-500 mb-4" />
              ) : (
                <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
              )}
              
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop files here' : '📄 Step 3: Upload Files (Max 10)'}
              </p>
              
              <p className="text-sm text-gray-500 mb-4">
                Drag & drop files or click to browse
              </p>
              
              <p className="text-xs text-gray-400 mt-2">
                Max 10 files • PDF, PNG, JPG • 10MB per file
              </p>
            </>
          )}
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Selected Files ({selectedFiles.length}/10)
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <DocumentIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !subject.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s) to ${subject}`}
          </button>
        </div>
      )}

      {/* Extracted Questions Display */}
      {showQuestions && extractedQuestions.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              📋 Extracted Questions for {subject}
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {extractedQuestions.length} Questions
              </span>
              <button
                onClick={() => setShowQuestions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {extractedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                        Q{index + 1}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                        {question.topic}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {question.text}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 font-medium">Importance</span>
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {(question.importance_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowQuestions(false);
                setExtractedQuestions([]);
                setSubject('');
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              ✓ Done - Upload More Papers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
