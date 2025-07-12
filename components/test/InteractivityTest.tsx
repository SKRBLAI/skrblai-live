'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface InteractivityTestProps {
  onComplete?: (results: TestResult[]) => void;
}

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

export default function InteractivityTest({ onComplete }: InteractivityTestProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runInteractivityTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Percy Onboarding Container',
        selector: '[data-percy-onboarding]',
        test: 'Container exists and has pointer-events-auto'
      },
      {
        name: 'Percy Chat Container',
        selector: '[data-percy-chat-container]',
        test: 'Chat container is scrollable'
      },
      {
        name: 'Percy Input Field',
        selector: '[data-percy-input]',
        test: 'Input field is focusable and accepts input'
      },
      {
        name: 'Percy Submit Button',
        selector: '[data-percy-submit-button]',
        test: 'Submit button is clickable'
      },
      {
        name: 'Percy Option Buttons',
        selector: '[data-percy-option]',
        test: 'Option buttons are clickable'
      },
      {
        name: 'Percy Stats Cards',
        selector: '[data-percy-stat]',
        test: 'Stats cards are interactive'
      },
      {
        name: 'Percy Prompt Bar',
        selector: '[data-percy-prompt-bar]',
        test: 'Prompt bar is interactive'
      }
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      setCurrentTest(test.name);
      await new Promise(resolve => setTimeout(resolve, 500)); // Visual delay
      
      try {
        const element = document.querySelector(test.selector);
        
        if (!element) {
          results.push({
            test: test.name,
            passed: false,
            message: `Element not found: ${test.selector}`
          });
          continue;
        }

        // Check if element has pointer-events-auto class or style
        const hasPointerEvents = element.classList.contains('pointer-events-auto') || 
                                getComputedStyle(element).pointerEvents === 'auto';

        // Check if element is visible
        const isVisible = (element as HTMLElement).offsetParent !== null;

        // Check if element is in viewport
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                           rect.bottom <= window.innerHeight && 
                           rect.right <= window.innerWidth;

        if (!hasPointerEvents) {
          results.push({
            test: test.name,
            passed: false,
            message: 'Element does not have pointer-events enabled'
          });
        } else if (!isVisible) {
          results.push({
            test: test.name,
            passed: false,
            message: 'Element is not visible'
          });
        } else {
          results.push({
            test: test.name,
            passed: true,
            message: 'Element is interactive and accessible'
          });
        }

        // Special tests for specific elements
        if (test.selector === '[data-percy-chat-container]') {
          const canScroll = element.scrollHeight > element.clientHeight;
          if (!canScroll) {
            results[results.length - 1] = {
              test: test.name,
              passed: false,
              message: 'Chat container is not scrollable'
            };
          }
        }

        if (test.selector === '[data-percy-input]') {
          const input = element as HTMLInputElement;
          const canFocus = input.tabIndex >= 0 || input.type === 'text' || input.type === 'email';
          if (!canFocus) {
            results[results.length - 1] = {
              test: test.name,
              passed: false,
              message: 'Input field cannot be focused'
            };
          }
        }

      } catch (error) {
        results.push({
          test: test.name,
          passed: false,
          message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest('');
    
    if (onComplete) {
      onComplete(results);
    }
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const allPassed = totalTests > 0 && passedTests === totalTests;

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-900/95 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400">Interactivity Test</h3>
        {!isRunning && totalTests > 0 && (
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm text-gray-300">
              {passedTests}/{totalTests}
            </span>
          </div>
        )}
      </div>

      {!isRunning && totalTests === 0 && (
        <button
          onClick={runInteractivityTests}
          className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          Run Tests
        </button>
      )}

      {isRunning && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-300">Testing: {currentTest}</span>
          </div>
        </div>
      )}

      {!isRunning && totalTests > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                result.passed ? 'bg-green-900/30' : 'bg-red-900/30'
              }`}
            >
              {result.passed ? (
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{result.test}</div>
                <div className="text-xs text-gray-400">{result.message}</div>
              </div>
            </motion.div>
          ))}
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={runInteractivityTests}
              className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm"
            >
              Re-run Tests
            </button>
            <button
              onClick={() => {
                setTestResults([]);
                setCurrentTest('');
              }}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 