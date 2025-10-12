import { describe, it, expect } from 'vitest';
import { agentDashboardList } from '../lib/agents/agentRegistry';

describe('Agent Dashboard Schema Compliance', () => {
  it('should export an array of agents', () => {
    expect(Array.isArray(agentDashboardList)).toBe(true);
    expect(agentDashboardList.length).toBeGreaterThan(0);
  });

  it('should have no duplicate agent ids', () => {
    const ids = agentDashboardList.map(a => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all required fields and correct types', () => {
    agentDashboardList.forEach(agent => {
      expect(typeof agent.id).toBe('string');
      expect(agent.id.length).toBeGreaterThan(0);
      expect(typeof agent.name).toBe('string');
      expect(agent.name.length).toBeGreaterThan(0);
      expect(typeof agent.description).toBe('string');
      expect(agent.description.length).toBeGreaterThan(0);
      expect(typeof agent.visible).toBe('boolean');
      // usageCount, lastRun, performanceScore can be undefined or correct type
      if (agent.usageCount !== undefined) {
        expect(typeof agent.usageCount).toBe('number');
      }
      if (agent.lastRun !== undefined) {
        expect(typeof agent.lastRun).toBe('string');
      }
      if (agent.performanceScore !== undefined) {
        expect(typeof agent.performanceScore).toBe('number');
      }
    });
  });

  it('should not have any missing stub fields', () => {
    agentDashboardList.forEach(agent => {
      expect('usageCount' in agent).toBe(true);
      expect('lastRun' in agent).toBe(true);
      expect('performanceScore' in agent).toBe(true);
    });
  });
}); 