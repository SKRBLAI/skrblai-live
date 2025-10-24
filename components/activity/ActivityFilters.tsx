'use client';

import { ActivityStatus } from './StatusBadge';

interface ActivityFiltersProps {
  agentFilter: string;
  statusFilter: ActivityStatus | 'all';
  onAgentFilterChange: (filter: string) => void;
  onStatusFilterChange: (filter: ActivityStatus | 'all') => void;
  className?: string;
}

const AGENT_OPTIONS = [
  { value: '', label: 'All Agents' },
  { value: 'percy', label: 'Percy' },
  { value: 'skillsmith', label: 'SkillSmith' },
  { value: 'sync', label: 'Sync' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content', label: 'Content' },
  { value: 'seo', label: 'SEO' },
  { value: 'social', label: 'Social Media' },
];

const STATUS_OPTIONS: Array<{ value: ActivityStatus | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'All Status', color: 'text-gray-400' },
  { value: 'running', label: 'Running', color: 'text-green-400' },
  { value: 'success', label: 'Success', color: 'text-emerald-400' },
  { value: 'failed', label: 'Failed', color: 'text-red-400' },
  { value: 'pending', label: 'Pending', color: 'text-gray-400' },
];

export function ActivityFilters({
  agentFilter,
  statusFilter,
  onAgentFilterChange,
  onStatusFilterChange,
  className = ''
}: ActivityFiltersProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Agent Filter */}
      <div className="flex-1">
        <label className="block text-xs text-gray-400 mb-1.5">Agent</label>
        <select
          value={agentFilter}
          onChange={(e) => onAgentFilterChange(e.target.value)}
          aria-label="Filter by agent"
          className="
            w-full px-3 py-2 rounded-lg
            bg-[rgba(21,23,30,0.70)] 
            border border-teal-400/30
            text-white text-sm
            focus:border-teal-400 focus:ring-1 focus:ring-teal-400
            transition-all
            cursor-pointer
          "
        >
          {AGENT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex-1">
        <label className="block text-xs text-gray-400 mb-1.5">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ActivityStatus | 'all')}
          aria-label="Filter by status"
          className="
            w-full px-3 py-2 rounded-lg
            bg-[rgba(21,23,30,0.70)] 
            border border-teal-400/30
            text-white text-sm
            focus:border-teal-400 focus:ring-1 focus:ring-teal-400
            transition-all
            cursor-pointer
          "
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value} className={option.color}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
