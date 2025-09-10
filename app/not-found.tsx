import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | SKRBL AI',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-white/20 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-300 mb-8">
              The page you're looking for seems to have wandered off into the digital void. 
              Don't worry, even our AI agents get lost sometimes!
            </p>
          </div>
          
          <div className="space-y-4">
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              Go Home
            </a>
            
            <div className="text-sm text-gray-400">
              Or try visiting our{' '}
              <a href="/sports" className="text-purple-400 hover:text-purple-300 underline">
                AI Skill Smith
              </a>
              {' '}or{' '}
              <a href="/features" className="text-purple-400 hover:text-purple-300 underline">
                Features
              </a>
              {' '}pages.
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}