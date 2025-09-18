import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { DialerService } from './services/dialer.service';
import { AsteriskService } from './services/asterisk.service';
import { RedisService } from './services/redis.service';
import { DatabaseService } from './services/database.service';
import { PredictiveDialer } from './services/predictive-dialer.service';
import { ProgressiveDialer } from './services/progressive-dialer.service';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const redisService = new RedisService();
const databaseService = new DatabaseService();
const asteriskService = new AsteriskService();
const dialerService = new DialerService(redisService, databaseService, asteriskService);
const predictiveDialer = new PredictiveDialer(dialerService, databaseService, redisService);
const progressiveDialer = new ProgressiveDialer(dialerService, databaseService);

// API Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/call-next/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const result = await progressiveDialer.callNext(agentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/start-campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const result = await dialerService.startCampaign(campaignId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/stop-campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const result = await dialerService.stopCampaign(campaignId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/campaign-status/:campaignId', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const status = await dialerService.getCampaignStatus(campaignId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Initialize services
async function initialize() {
  try {
    await redisService.connect();
    await databaseService.connect();
    await asteriskService.connect();
    
    console.log('All services initialized successfully');
    
    // Start predictive dialer
    predictiveDialer.start();
    
    app.listen(PORT, () => {
      console.log(`Dialer service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down dialer service...');
  await redisService.disconnect();
  await databaseService.disconnect();
  await asteriskService.disconnect();
  process.exit(0);
});

initialize();

