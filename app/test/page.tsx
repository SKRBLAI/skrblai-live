export default function TestPage() {
  return (
    <div style={{ 
      padding: '50px', 
      fontSize: '24px',
      backgroundColor: '#0a0a0a',
      color: '#00ff88',
      minHeight: '100vh'
    }}>
      <h1>✅ Next.js is Working!</h1>
      <p>If you see this, the dev server is running correctly.</p>
      <hr style={{ margin: '20px 0', borderColor: '#00ff88' }} />
      <h2>Quick Checks:</h2>
      <ul>
        <li>✅ Server started</li>
        <li>✅ Page rendered</li>
        <li>✅ TypeScript compiled</li>
      </ul>
      <hr style={{ margin: '20px 0', borderColor: '#00ff88' }} />
      <p><a href="/" style={{ color: '#00ff88' }}>← Back to Homepage</a></p>
    </div>
  );
}
