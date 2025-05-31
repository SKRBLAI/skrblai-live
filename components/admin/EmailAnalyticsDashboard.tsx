'use client';
import React, { useState, useEffect } from 'react';

interface EmailMetrics {
  totalSequences: number;
  activeSequences: number;
  emailsSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export default function EmailAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmailMetrics();
  }, []);

  const fetchEmailMetrics = async () => {
    try {
      const response = await fetch('/api/email/analytics');
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Failed to fetch email metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-600">Failed to load email metrics</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900">📧 Email Automation Analytics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics.activeSequences}</div>
          <div className="text-sm text-blue-800">Active Sequences</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics.emailsSent}</div>
          <div className="text-sm text-green-800">Emails Sent</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{metrics.openRate.toFixed(1)}%</div>
          <div className="text-sm text-purple-800">Open Rate</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{metrics.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-orange-800">Conversion Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">📮 Delivery Rate</h4>
          <div className="text-xl font-bold text-gray-700">{metrics.deliveryRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Emails successfully delivered</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">👆 Click Rate</h4>
          <div className="text-xl font-bold text-gray-700">{metrics.clickRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Recipients who clicked links</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">📊 Total Sequences</h4>
          <div className="text-xl font-bold text-gray-700">{metrics.totalSequences}</div>
          <div className="text-sm text-gray-600">All email sequences created</div>
        </div>
      </div>
    </div>
  );
} 