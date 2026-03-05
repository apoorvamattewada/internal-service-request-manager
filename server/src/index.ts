import 'dotenv/config';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import createApp from './app';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDatabase } = await import('./config/database');
        await disconnectDatabase();
        logger.info('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
      void shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      void shutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
