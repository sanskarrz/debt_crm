import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Callback, CallbackStatus } from '../database/entities/callback.entity';
import { Allocation } from '../database/entities/allocation.entity';
import { User } from '../database/entities/user.entity';
import { CreateCallbackDto } from './dto/create-callback.dto';
import { UpdateCallbackDto } from './dto/update-callback.dto';

@Injectable()
export class CallbacksService {
  constructor(
    @InjectRepository(Callback)
    private callbacksRepository: Repository<Callback>,
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createCallbackDto: CreateCallbackDto): Promise<Callback> {
    const callback = this.callbacksRepository.create(createCallbackDto);
    return this.callbacksRepository.save(callback);
  }

  async findAll(): Promise<Callback[]> {
    return this.callbacksRepository.find({
      relations: ['allocation', 'agent'],
      order: { callbackDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Callback> {
    return this.callbacksRepository.findOne({
      where: { id },
      relations: ['allocation', 'agent'],
    });
  }

  async findByAgent(agentId: string): Promise<Callback[]> {
    return this.callbacksRepository.find({
      where: { agentId },
      relations: ['allocation'],
      order: { callbackDate: 'ASC' },
    });
  }

  async findByAllocation(allocationId: string): Promise<Callback[]> {
    return this.callbacksRepository.find({
      where: { allocationId },
      relations: ['agent'],
      order: { callbackDate: 'ASC' },
    });
  }

  async findDueCallbacks(): Promise<Callback[]> {
    const now = new Date();
    return this.callbacksRepository.find({
      where: {
        status: CallbackStatus.SCHEDULED,
        callbackDate: { $lte: now } as any,
      },
      relations: ['allocation', 'agent'],
      order: { callbackDate: 'ASC' },
    });
  }

  async update(id: string, updateCallbackDto: UpdateCallbackDto): Promise<Callback> {
    await this.callbacksRepository.update(id, updateCallbackDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.callbacksRepository.delete(id);
  }

  async markCompleted(id: string): Promise<Callback> {
    await this.callbacksRepository.update(id, { status: CallbackStatus.COMPLETED });
    return this.findOne(id);
  }

  async markCancelled(id: string): Promise<Callback> {
    await this.callbacksRepository.update(id, { status: CallbackStatus.CANCELLED });
    return this.findOne(id);
  }

  async getCallbackStats(agentId?: string) {
    const where = agentId ? { agentId } : {};
    const callbacks = await this.callbacksRepository.find({ where });

    return {
      total: callbacks.length,
      scheduled: callbacks.filter(c => c.status === CallbackStatus.SCHEDULED).length,
      completed: callbacks.filter(c => c.status === CallbackStatus.COMPLETED).length,
      cancelled: callbacks.filter(c => c.status === CallbackStatus.CANCELLED).length,
    };
  }
}

