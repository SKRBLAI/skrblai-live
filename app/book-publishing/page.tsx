'use client';

import React from 'react';
import PublishingAssistantPanel from '@/components/book-publishing/PublishingAssistantPanel';
import PageLayout from '@/components/layouts/PageLayout';

import '@/styles/components/BookPublishing.css';

export default function BookPublishingPage() {
  return (
    <PageLayout title="AI-Powered Book Publishing">
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              AI-Powered Book Publishing
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your manuscript into a published book with our cutting-edge AI platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <PublishingAssistantPanel className="shadow-2xl" />
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-3">AI Enhancement</h3>
              <p className="text-gray-300">Our AI analyzes your manuscript and suggests improvements for style, structure, and engagement.</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-3">Smart Formatting</h3>
              <p className="text-gray-300">Automated formatting and typesetting optimized for multiple publishing platforms.</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-3">Global Distribution</h3>
              <p className="text-gray-300">Publish your book across major platforms like Amazon, Apple Books, and more.</p>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}