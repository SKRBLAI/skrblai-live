/**
 * usePercyChat Hook
 *
 * React hook for streaming conversations with Percy AI.
 * Handles SSE connection, message streaming, and conversation state.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, loading, error } = usePercyChat();
 *
 * // Send a message
 * await sendMessage('How can I increase my revenue?');
 *
 * // Send with context
 * await sendMessage('What should I focus on?', {
 *   businessType: 'ecommerce',
 *   currentRevenue: 50000
 * });
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/context/AuthContext';

export interface PercyMessage {
  id: string;
  role: 'user' | 'percy';
  content: string;
  timestamp: number;
}

export interface PercyChatContext {
  businessType?: string;
  currentRevenue?: number;
  teamSize?: number;
  mainGoal?: string;
  urgencyLevel?: string;
  [key: string]: any;
}

export interface UsePercyChatOptions {
  onMessageComplete?: (message: PercyMessage) => void;
  onError?: (error: string) => void;
  maxMessages?: number;
}

export function usePercyChat(options: UsePercyChatOptions = {}) {
  const [messages, setMessages] = useState<PercyMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentStreamMessageRef = useRef<string>('');

  const {
    onMessageComplete,
    onError,
    maxMessages = 100,
  } = options;

  /**
   * Send a message to Percy and stream the response
   */
  const sendMessage = useCallback(
    async (message: string, context?: PercyChatContext): Promise<void> => {
      if (!message.trim()) return;

      setLoading(true);
      setStreaming(true);
      setError(null);

      // Add user message immediately
      const userMessage: PercyMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage].slice(-maxMessages));

      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        const response = await fetch('/api/percy/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            message,
            conversationHistory,
            context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get Percy response');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Initialize Percy's message
        const percyMessageId = `percy-${Date.now()}`;
        currentStreamMessageRef.current = '';

        setMessages((prev) => [
          ...prev,
          {
            id: percyMessageId,
            role: 'percy',
            content: '',
            timestamp: Date.now(),
          },
        ]);

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setStreaming(false);
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE format (data: {...}\n\n)
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'text') {
                  // Append text to current message
                  currentStreamMessageRef.current += data.content;

                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage && lastMessage.id === percyMessageId) {
                      lastMessage.content = currentStreamMessageRef.current;
                    }
                    return updated;
                  });
                } else if (data.type === 'done') {
                  // Stream complete
                  const finalMessage: PercyMessage = {
                    id: percyMessageId,
                    role: 'percy',
                    content: currentStreamMessageRef.current,
                    timestamp: Date.now(),
                  };

                  onMessageComplete?.(finalMessage);
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Stream error');
                }
              } catch (parseError) {
                console.error('[usePercyChat] Parse error:', parseError);
              }
            }
          }
        }

        setLoading(false);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('[usePercyChat] Request aborted');
          return;
        }

        const errorMessage = err.message || 'Failed to get Percy response';
        setError(errorMessage);
        onError?.(errorMessage);
        console.error('[usePercyChat] Error:', err);

        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'percy',
            content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
            timestamp: Date.now(),
          },
        ]);

        setLoading(false);
        setStreaming(false);
      }
    },
    [messages, session?.access_token, maxMessages, onMessageComplete, onError]
  );

  /**
   * Cancel the current streaming request
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreaming(false);
      setLoading(false);
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Reset conversation
   */
  const reset = useCallback(() => {
    cancelStream();
    clearMessages();
  }, [cancelStream, clearMessages]);

  return {
    messages,
    loading,
    streaming,
    error,
    sendMessage,
    cancelStream,
    clearMessages,
    reset,
  };
}
