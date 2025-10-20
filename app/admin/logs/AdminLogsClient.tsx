"use client";
import React, { useState, useEffect } from "react";
import { fetchPercyLogs, formatPercyLogs } from "../../../utils/percyLogger";

interface AdminLogsClientProps {
  user: any;
}

export default function AdminLogsClient({ user }: AdminLogsClientProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(100);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  useEffect(() => {
    setLoading(true);
    fetchPercyLogs({ sessionId: sessionId || undefined, eventType: eventType || undefined })
      .then(data => setLogs(data))
      .finally(() => setLoading(false));
  }, [sessionId, eventType]);

  const pagedLogs = logs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Percy Event Logs</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Filter by sessionId"
          value={sessionId}
          onChange={e => setSessionId(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Filter by event type"
          value={eventType}
          onChange={e => setEventType(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-teal-600 text-white rounded"
          onClick={() => {
            const blob = new Blob([
              formatPercyLogs(logs, { format: exportFormat })
            ], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `percy_logs.${exportFormat}`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export {exportFormat.toUpperCase()}
        </button>
        <select
          className="border p-2 rounded"
          value={exportFormat}
          onChange={e => setExportFormat(e.target.value as 'json' | 'csv')}
          aria-label="Export format"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>
      {loading ? (
        <div>Loading logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Session ID</th>
                <th className="p-2 border">Agent ID</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Timestamp</th>
                <th className="p-2 border">Meta</th>
              </tr>
            </thead>
            <tbody>
              {pagedLogs.map((log, i) => (
                <tr key={log.timestamp + '-' + i} className="border-b">
                  <td className="p-2 border font-mono">{log.sessionId}</td>
                  <td className="p-2 border font-mono">{log.agentId}</td>
                  <td className="p-2 border">{log.type}</td>
                  <td className="p-2 border font-mono">{log.timestamp}</td>
                  <td className="p-2 border text-xs max-w-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.meta, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {logs.length > perPage && (
            <div className="flex gap-2 mt-4 justify-center">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Prev</button>
              <span>Page {page} of {Math.ceil(logs.length / perPage)}</span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.min(Math.ceil(logs.length / perPage), p + 1))}
                disabled={page === Math.ceil(logs.length / perPage)}
              >Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}