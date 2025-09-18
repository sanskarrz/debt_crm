import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allocation, AllocationStatus } from '../database/entities/allocation.entity';
import { Campaign } from '../database/entities/campaign.entity';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { UploadAllocationsDto } from './dto/upload-allocations.dto';
import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async create(createAllocationDto: CreateAllocationDto): Promise<Allocation> {
    const allocation = this.allocationsRepository.create(createAllocationDto);
    return this.allocationsRepository.save(allocation);
  }

  async findAll(campaignId?: string): Promise<Allocation[]> {
    const where = campaignId ? { campaignId } : {};
    return this.allocationsRepository.find({
      where,
      relations: ['campaign', 'callAttempts'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Allocation> {
    return this.allocationsRepository.findOne({
      where: { id },
      relations: ['campaign', 'callAttempts', 'callbacks'],
    });
  }

  async update(id: string, updateAllocationDto: UpdateAllocationDto): Promise<Allocation> {
    await this.allocationsRepository.update(id, updateAllocationDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.allocationsRepository.delete(id);
  }

  async uploadAllocations(file: Express.Multer.File, campaignId: string): Promise<{ success: number; errors: any[] }> {
    const campaign = await this.campaignsRepository.findOne({ where: { id: campaignId } });
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    const allocations: Omit<CreateAllocationDto, 'campaignId'>[] = [];
    const errors: any[] = [];

    try {
      if (file.mimetype === 'text/csv') {
        await this.parseCsvFile(file.buffer, allocations, errors);
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.mimetype === 'application/vnd.ms-excel') {
        await this.parseExcelFile(file.buffer, allocations, errors);
      } else {
        throw new BadRequestException('Unsupported file format');
      }

      // Add campaignId to all allocations
      const allocationsWithCampaign = allocations.map(allocation => ({
        ...allocation,
        campaignId,
      }));

      // Save allocations in batches
      const batchSize = 1000;
      let successCount = 0;

      for (let i = 0; i < allocationsWithCampaign.length; i += batchSize) {
        const batch = allocationsWithCampaign.slice(i, i + batchSize);
        try {
          await this.allocationsRepository.save(batch);
          successCount += batch.length;
        } catch (error) {
          errors.push({ batch: i, error: error.message });
        }
      }

      return { success: successCount, errors };
    } catch (error) {
      throw new BadRequestException(`File processing error: ${error.message}`);
    }
  }

  private async parseCsvFile(buffer: Buffer, allocations: Omit<CreateAllocationDto, 'campaignId'>[], errors: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            const allocation = this.mapRowToAllocation(row);
            if (allocation) {
              allocations.push(allocation);
            }
          } catch (error) {
            errors.push({ row, error: error.message });
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });
  }

  private async parseExcelFile(buffer: Buffer, allocations: Omit<CreateAllocationDto, 'campaignId'>[], errors: any[]): Promise<void> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any, index: number) => {
        try {
          const allocation = this.mapRowToAllocation(row);
          if (allocation) {
            allocations.push(allocation);
          }
        } catch (error) {
          errors.push({ row: index + 1, error: error.message });
        }
      });
    } catch (error) {
      throw new Error(`Excel parsing error: ${error.message}`);
    }
  }

  private mapRowToAllocation(row: any): Omit<CreateAllocationDto, 'campaignId'> | null {
    const requiredFields = ['debtorName', 'phoneNumber', 'amountDue'];
    const missingFields = requiredFields.filter(field => !row[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return {
      debtorName: row.debtorName || row['Debtor Name'] || row['debtor_name'],
      phoneNumber: row.phoneNumber || row['Phone Number'] || row['phone_number'],
      amountDue: parseFloat(row.amountDue || row['Amount Due'] || row['amount_due']),
      accountNumber: row.accountNumber || row['Account Number'] || row['account_number'],
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString() : null,
      lastPaymentDate: row.lastPaymentDate ? new Date(row.lastPaymentDate).toISOString() : null,
      lastPaymentAmount: row.lastPaymentAmount ? parseFloat(row.lastPaymentAmount) : null,
      priority: row.priority || row['Priority'] || 'medium',
      notes: row.notes || row['Notes'] || row['notes'],
    };
  }

  async getNextAllocation(agentId: string, campaignId: string): Promise<Allocation | null> {
    return this.allocationsRepository.findOne({
      where: {
        campaignId,
        status: AllocationStatus.PENDING,
      },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  async updateStatus(id: string, status: AllocationStatus): Promise<Allocation> {
    await this.allocationsRepository.update(id, { status });
    return this.findOne(id);
  }
}

