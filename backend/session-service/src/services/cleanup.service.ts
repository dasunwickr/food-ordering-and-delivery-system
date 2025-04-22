import { SessionModel } from '../model/session.model';
import redis from '../config/redis';
import logger from '../utils/logger';

/**
 * Service to clean up expired sessions from both MongoDB and Redis
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    
    const currentDate = new Date();
    const expiredSessions = await SessionModel.find({
      expiresAt: { $lt: currentDate }
    });
    
    if (expiredSessions.length === 0) {
      logger.info('No expired sessions to clean up');
      return;
    }

    
    const sessionIds = expiredSessions.map(session => session.sessionId);
    
   
    const deleteResult = await SessionModel.deleteMany({
      expiresAt: { $lt: currentDate }
    });
    
    
    if (sessionIds.length > 0) {
      const pipeline = redis.pipeline();
      sessionIds.forEach(id => {
        pipeline.del(id);
      });
      await pipeline.exec();
    }

    logger.info(`Cleaned up ${deleteResult.deletedCount} expired sessions`);
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
  }
};