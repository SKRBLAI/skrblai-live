export function saveIntentMemory(agentIntent: string) {
  const entry = {
    agentIntent,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('percy_intent_memory') || '[]');
    } catch {}
    history.push(entry);
    localStorage.setItem('percy_intent_memory', JSON.stringify(history));
    console.log('[Percy] Intent memory saved:', entry);
  }
  // Prep for backend hook here if needed
}

export function clearPercyMemory() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('percyMessageHistory');
    localStorage.removeItem('lastUsedAgent');
    console.log('[Percy] Memory cleared.');
  }
} 