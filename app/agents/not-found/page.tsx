import Link from 'next/link';
import { ChevronLeft, Search, Users } from 'lucide-react';

export default function AgentNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-600/30 blur-xl animate-pulse"></div>
          <div className="absolute inset-[4px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
              <Search className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-white mb-4">Agent Not Found</h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          The agent you're looking for doesn't exist or may have been moved. 
          Let's get you back to the right place.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/agents"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Users className="w-5 h-5" />
            View All Agents
          </Link>
          
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Popular Agents */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Agents</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/agents/percy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Percy AI Concierge
            </Link>
            <Link href="/agents/skillsmith" className="text-purple-400 hover:text-purple-300 transition-colors">
              SkillSmith Sports
            </Link>
            <Link href="/agents/branding" className="text-pink-400 hover:text-pink-300 transition-colors">
              Brand Alexander
            </Link>
            <Link href="/agents/contentcreation" className="text-green-400 hover:text-green-300 transition-colors">
              Content Creation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}