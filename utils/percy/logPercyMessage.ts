export function logPercyMessage({ intent, message, agentId }: { intent: string; message: string; agentId: string }) {
  if (typeof window !== 'undefined') {
    const history = JSON.parse(localStorage.getItem('percyMessageHistory') || '[]');
    const entry = { intent, message, agentId, timestamp: new Date().toISOString() };
    history.push(entry);
    localStorage.setItem('percyMessageHistory', JSON.stringify(history));
    console.log('[Percy] Message logged:', { intent, agentId, message });
  }
}

export function getPercyMessageHistory() {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('percyMessageHistory') || '[]');
  }
  return [];
} 