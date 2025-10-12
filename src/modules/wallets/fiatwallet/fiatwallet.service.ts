import { Injectable, Logger } from '@nestjs/common';
import { AbstractFiatwalletService } from './abstracts/abstract.fiatwalletService';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { Repository } from 'typeorm';
import { UserService } from '@/modules/users/user.service';

@Injectable()
export class FiatwalletService extends AbstractFiatwalletService {
  private readonly logger = new Logger(FiatwalletService.name);

  constructor(
    @InjectRepository(FiatWalletProfileEntity)
    private readonly fiatwWalletRepo: Repository<FiatWalletProfileEntity>,

    private schedulerRegistry: SchedulerRegistry,

    private userService: UserService,
  ) {
    super();
  }

  getUserFiatWalletProfile(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletByCountry(userId: string, country: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletByTicker(userId: string, ticker: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getAllFiatWallets(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  suspendFiatWallet(walletId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  suspendFiatWallets(walletIds: string[]): Promise<any> {
    throw new Error('Method not implemented.');
  }

  /**
   * Manually start a one-time cron job for creating fiat wallet profile.
   * Once executed, the job stops and is deleted from memory.
   */
  startCreateProfileJob(userId: string, payload: any) {
    const jobName = `createProfileJob-${userId}-${Date.now()}`;

    const job = new CronJob('* * * * * *', async () => {
      console.log(`Running one-time cron job for ${userId}...`);

      try {
        // Your actual logic goes here
        console.log(
          `Creating fiat wallet profile for user: ${userId}`,
          payload,
        );

        // const options = dynamicQuery<UserEntity>('findOne', args);
        // const user = await findOneDynamic(this.fiatwWalletRepo, options);
        const user = await this.userService.findOne({
          id: userId,
        });

        console.log(user);

        // const profile = new FiatWalletProfileEntity();
        // profile.user = user

        // e.g., await this.someService.createProfile(userId, payload);
      } catch (error) {
        console.error('Error running create profile job:', error);
      } finally {
        // Stop and remove the job to save memory
        job.stop();
        this.schedulerRegistry.deleteCronJob(jobName);
        console.log(`Job ${jobName} stopped and deleted.`);
      }
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    console.log(`Job ${jobName} started.`);
  }

  /**
   * Manually start a one-time cron job for creating fiat wallet.
   * Once executed, the job stops and deletes itself.
   */
  startCreateWalletJob(userId: string, payload: any) {
    const jobName = `createWalletJob-${userId}-${Date.now()}`;

    const job = new CronJob('* * * * * *', async () => {
      console.log(`Running one-time cron job for ${userId}...`);

      try {
        // Your wallet creation logic here
        console.log(`Creating fiat wallet for user: ${userId}`, payload);
        // e.g., await this.someService.createWallet(userId, payload);
      } catch (error) {
        console.error('Error running create wallet job:', error);
      } finally {
        job.stop();
        this.schedulerRegistry.deleteCronJob(jobName);
        console.log(`Job ${jobName} stopped and deleted.`);
      }
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    console.log(`Job ${jobName} started.`);
  }

  /**
   * Stop all running jobs manually (optional)
   */
  stopAllJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((job, name) => {
      job.stop();
      this.schedulerRegistry.deleteCronJob(name);
      console.log(`Stopped and removed ${name}`);
    });
  }
}
