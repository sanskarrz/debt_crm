import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DncNumber } from '../database/entities/dnc-number.entity';
import { User } from '../database/entities/user.entity';
import { CreateDncNumberDto } from './dto/create-dnc-number.dto';
import { UpdateDncNumberDto } from './dto/update-dnc-number.dto';

@Injectable()
export class DncService {
  constructor(
    @InjectRepository(DncNumber)
    private dncRepository: Repository<DncNumber>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createDncNumberDto: CreateDncNumberDto): Promise<DncNumber> {
    const dncNumber = this.dncRepository.create(createDncNumberDto);
    return this.dncRepository.save(dncNumber);
  }

  async findAll(): Promise<DncNumber[]> {
    return this.dncRepository.find({
      relations: ['addedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DncNumber> {
    return this.dncRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<DncNumber | null> {
    return this.dncRepository.findOne({
      where: { phoneNumber },
      relations: ['addedBy'],
    });
  }

  async isDncNumber(phoneNumber: string): Promise<boolean> {
    const dncNumber = await this.dncRepository.findOne({
      where: { phoneNumber },
    });
    return !!dncNumber;
  }

  async update(id: string, updateDncNumberDto: UpdateDncNumberDto): Promise<DncNumber> {
    await this.dncRepository.update(id, updateDncNumberDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.dncRepository.delete(id);
  }

  async removeByPhoneNumber(phoneNumber: string): Promise<void> {
    await this.dncRepository.delete({ phoneNumber });
  }

  async bulkAdd(phoneNumbers: string[], reason: string, addedById: string): Promise<DncNumber[]> {
    const dncNumbers = phoneNumbers.map(phoneNumber => 
      this.dncRepository.create({
        phoneNumber,
        reason,
        addedById,
      })
    );
    return this.dncRepository.save(dncNumbers);
  }

  async getDncStats() {
    const total = await this.dncRepository.count();
    const recent = await this.dncRepository.count({
      where: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } as any,
      },
    });

    return {
      total,
      recent,
      thisWeek: recent,
    };
  }
}

