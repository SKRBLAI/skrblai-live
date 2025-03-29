'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';
import Image from 'next/image';

const agents = [
  {
    name: 'Web3 Walter',
    role: 'The Wise Mentor',
    description: 'Guides through Web3 concepts with wisdom and patience.',
    image: '/images/agents/web3-walter.png',
    color: 'from-blue-500 to-purple-500'
  },
  {
    name: 'Crypto Chris',
    role: 'The Natural Leader',
    description: 'Makes cryptocurrency concepts exciting and accessible.',
    image: '/images/agents/crypto-chris.png',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'NFT Nate',
    role: 'The Creative Spirit',
    description: 'Teaches about NFTs with boundless energy.',
    image: '/images/agents/nft-nate.png',
    color: 'from-green-500 to-teal-500'
  },
  {
    name: 'Blockchain Bella',
    role: 'The Tech Expert',
    description: 'Explains blockchain technology with intelligence and wit.',
    image: '/images/agents/blockchain-bella.png',
    color: 'from-pink-500 to-purple-500'
  },
  {
    name: 'DeFi Daisy',
    role: 'The Financial Guru',
    description: 'Teaches DeFi with confidence and resourcefulness.',
    image: '/images/agents/defi-daisy.png',
    color: 'from-red-500 to-pink-500'
  }
];

const AgentGrid = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins bg-gradient-to-r from-electric-blue to-teal bg-clip-text text-transparent">
            Meet Your AI Team
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-inter">
            Our specialized AI agents work together to power your business
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <motion.div
              key={agent.name}
              variants={scaleIn}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-electric-blue/50 transition-all duration-300">
                <div className={`relative h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br ${agent.color}`}>
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <h3 className="text-2xl font-semibold mb-2 font-poppins text-electric-blue">
                  {agent.name}
                </h3>
                <p className="text-teal mb-4 font-medium">
                  {agent.role}
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {agent.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AgentGrid;
