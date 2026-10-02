import 'tsconfig-paths/register';
import app from '@/app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import prisma from '@/config/prisma';

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('📦 Connected to PostgreSQL database successfully');

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📡 Healthcheck available at: http://localhost:${env.PORT}/api-v1/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        logger.info('Database connection closed');
        process.exit(0);
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
