import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log('Connected to Redis');
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    console.log('Disconnected from Redis');
  }

  async publish(channel: string, message: any): Promise<void> {
    await this.client.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.client.subscribe(channel, (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing Redis message:', error);
      }
    });
  }

  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.hSet(key, field, stringValue);
  }

  async hget(key: string, field: string): Promise<string | null> {
    const result = await this.client.hGet(key, field);
    return result || null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key);
  }

  async sadd(key: string, member: string): Promise<void> {
    await this.client.sAdd(key, member);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sIsMember(key, member);
    return result;
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.sMembers(key);
  }
}

