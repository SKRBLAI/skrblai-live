'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Target } from 'lucide-react';

export default function SportsUploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#161b22] text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Back Navigation */}
        <Link href="/sports" className="inline-flex items-center text-orange-400 hover:text-orange-300 font-semibold mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Sports
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-6">
            UPLOAD YOUR <span className="text-orange-400">TRAINING DATA</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Let Skill Smith analyze your training videos, performance data, and workout logs to create your personalized optimization plan.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 border border-orange-500/30 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <Upload className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Upload Training Files</h3>
              <p className="text-gray-300 mb-6">
                Drag and drop files here or click to select
              </p>
              
              <input
                type="file"
                multiple
                accept=".mp4,.mov,.avi,.jpg,.jpeg,.png,.gif,.csv,.pdf,.txt,.json,.xml"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files) {
                    console.log('Files selected:', e.target.files.length);
                    // Handle file upload logic here
                  }
                }}
              />
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold cursor-pointer hover:from-orange-600 hover:to-red-600 transition-colors"
              >
                <Target className="w-5 h-5 mr-2" />
                Select Files
              </label>
              
              <div className="mt-4 text-sm text-gray-400">
                Supports: MP4, MOV, AVI, JPG, PNG, CSV, PDF, TXT, JSON, XML
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">What to Upload</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Training videos (form analysis)</li>
                <li>• Performance data (CSV files)</li>
                <li>• Workout logs (PDF/TXT)</li>
                <li>• Progress photos</li>
                <li>• Nutrition data</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">What You'll Get</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Personalized training plan</li>
                <li>• Performance analysis</li>
                <li>• Nutrition optimization</li>
                <li>• Injury prevention strategies</li>
                <li>• Progress tracking setup</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sports">
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">
                  Back to Sports
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                  View Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}