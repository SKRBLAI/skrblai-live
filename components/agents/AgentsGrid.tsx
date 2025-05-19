'use client';
import AgentConstellation from './AgentConstellation';

export default function AgentsGrid() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-blue">
          Meet the Agents of SKRBL AI
        </h1>
        <p className="text-xl text-teal-300">
          A League of Digital Superheroes, Ready to Serve.
        </p>
      </div>
      {/* Cosmic Agent Constellation */}
      <AgentConstellation />
    </div>
  );
}
        </motion.div>
        {/* Mobile fallback: stack agents below Percy */}
        <div className="md:hidden mt-12 flex flex-wrap justify-center gap-4 z-10">
          {agents.filter(a => !a.isPercy).map((agent, i) => (
            <AgentCard
              key={agent.name}
              name={agent.name}
              isPercy={false}
              gender={getGender(i)}
              role={agent.role}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
