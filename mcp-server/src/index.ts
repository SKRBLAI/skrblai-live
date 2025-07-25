import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// import { logger } from './utils/logger';
// import { validateEnv } from './utils/validation';
// import { errorHandler } from './middleware/errorHandler';
// import { authMiddleware } from './middleware/auth';

// Route imports
// import { healthRoutes } from './routes/health';
// import { orchestrationRoutes } from './routes/orchestration';
// import { queueRoutes } from './routes/queue';
// import { workflowRoutes } from './routes/workflow';
// import { webhookRoutes } from './routes/webhooks';

// Service imports
// import { OrchestrationService } from './services/orchestrationService';
// import { QueueService } from './services/queueService';
// import { WorkflowService } from './services/workflowService';

// Load environment variables
dotenv.config();

// Validate environment
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(compression());
app.use(limiter);
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Initialize services
const orchestrationService = new OrchestrationService();
const queueService = new QueueService();
const workflowService = new WorkflowService();

// Make services available in request context
app.use((req, res, next) => {
  req.services = {
    orchestration: orchestrationService,
    queue: queueService,
    workflow: workflowService,
  };
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/orchestration', authMiddleware, orchestrationRoutes);
app.use('/api/queue', authMiddleware, queueRoutes);
app.use('/api/workflow', authMiddleware, workflowRoutes);
app.use('/webhooks', webhookRoutes); // No auth for webhooks (they have their own validation)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SKRBL AI MCP Server',
    version: '1.0.0',
    description: 'Master Control Program orchestration server',
    status: 'operational',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    requestId: req.id,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`🚀 MCP Server started on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 CORS origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
});

// Handle shutdown signals
const gracefulShutdown = async (signal: string) => {
  logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('📱 HTTP server closed');
    
    try {
      // Close services
      await queueService.close();
      await workflowService.close();
      await orchestrationService.close();
      
      logger.info('✅ All services closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('🔥 Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app };