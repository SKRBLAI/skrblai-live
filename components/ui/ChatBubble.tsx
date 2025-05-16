import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  type: 'user' | 'assistant';
  isLoading?: boolean;
}

function ChatBubble({ message, type, isLoading }: ChatBubbleProps) {
  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={bubbleVariants}
      className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          relative max-w-[80%] p-4 rounded-2xl
          ${type === 'user' 
            ? 'bg-electric-blue/20 text-white ml-auto' 
            : 'bg-dark-purple/30 text-gray-100'}
          backdrop-blur-md border border-white/10
          shadow-lg shadow-black/20
        `}
      >
        {type === 'assistant' && (
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-electric-blue flex items-center justify-center">
            🤖
          </div>
        )}
        <motion.div 
          variants={textVariants} 
          className="relative"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          ) : (
            message
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ChatBubble;
