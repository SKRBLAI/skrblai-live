// Force static generation for this route
export const dynamic = 'force-static';
export const revalidate = false;

// Ensure this page has no server dependencies
export const runtime = 'nodejs';

export default function NotFound() {
  return (
    <html lang="en" className="dark overflow-x-hidden h-full">
      <head>
        <title>404 - Page Not Found | SKRBL AI</title>
        <meta name="description" content="The page you are looking for could not be found." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#0b1220" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: 100%; font-family: 'Inter', sans-serif; }
            body { 
              background: linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #312e81 100%);
              color: white;
              overflow-x: hidden;
            }
            .container { 
              min-height: 100vh; 
              display: grid; 
              place-items: center; 
              padding: 2rem;
            }
            .content { 
              max-width: 28rem; 
              text-align: center; 
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
            }
            .error-code { 
              font-size: 9rem; 
              font-weight: 700; 
              color: rgba(255, 255, 255, 0.2);
              margin-bottom: 1rem;
            }
            .title { 
              font-size: 3rem; 
              font-weight: 700; 
              margin-bottom: 1rem;
            }
            .description { 
              color: rgb(209, 213, 219);
              font-size: 1.125rem;
              line-height: 1.6;
            }
            .buttons { 
              display: flex; 
              justify-content: center; 
              gap: 0.75rem;
              flex-wrap: wrap;
            }
            .btn { 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.5rem; 
              border: 2px solid rgba(255, 255, 255, 0.2); 
              color: white; 
              text-decoration: none; 
              transition: all 0.3s ease;
              background: transparent;
              font-weight: 500;
            }
            .btn:hover { 
              background: rgba(255, 255, 255, 0.1);
              border-color: rgba(45, 212, 191, 0.5);
              transform: translateY(-2px);
            }
            .links { 
              font-size: 0.875rem; 
              color: rgb(156, 163, 175);
            }
            .links a { 
              color: rgb(168, 85, 247); 
              text-decoration: underline;
              margin: 0 0.5rem;
            }
            .links a:hover { 
              color: rgb(196, 181, 253); 
            }
            @media (max-width: 768px) {
              .error-code { font-size: 6rem; }
              .title { font-size: 2rem; }
              .content { gap: 1rem; }
            }
          `
        }} />
      </head>
      <body>
        <main className="container">
          <div className="content">
            <div className="error-code">404</div>
            <h1 className="title">Page not found</h1>
            <p className="description">
              The page you're looking for doesn't exist. Even our AI agents get lost sometimes!
            </p>
            
            <div className="buttons">
              <a className="btn" href="/">Home</a>
              <a className="btn" href="/sports">Sports</a>
            </div>
            
            <div className="links">
              Or try visiting our
              <a href="/features">Features</a>
              <a href="/academy">Academy</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}