// src/modules/firebase/firebase-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
} from 'fs';
import { basename, extname, join } from 'path';
import { FirebaseDistributionService } from './firebase-distribution.service';
import { BetaTesterEntity } from '@/utils/typeorm/entities/beta.testers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedBuildEntity } from '@/utils/typeorm/entities/processed-build.entity';
import { sha256File } from '@/utils/helpers';

@Injectable()
export class FirebaseCronService {
  private readonly logger = new Logger(FirebaseCronService.name);
  private releasesDir = join(process.cwd(), 'releases');
  private archiveDir = join(process.cwd(), 'releases_archive');

  constructor(
    private readonly fad: FirebaseDistributionService,
    @InjectRepository(ProcessedBuildEntity)
    private readonly processedRepo: Repository<ProcessedBuildEntity>,

    @InjectRepository(BetaTesterEntity)
    private readonly betaTesterRepo: Repository<BetaTesterEntity>,
  ) {
    if (!existsSync(this.archiveDir))
      mkdirSync(this.archiveDir, { recursive: true });
  }

  // @Cron(CronExpression.EVERY_5_SECONDS)
  async scanForReleases() {
    try {
      const betaTesters = await this.betaTesterRepo.find({ select: ['email'] });
      if (betaTesters.length === 0) return;

      const files = readdirSync(this.releasesDir)
        .filter((f) => f.endsWith('.apk') || f.endsWith('.aab'))
        .map((f) => join(this.releasesDir, f));

      for (const filePath of files) {
        try {
          if (statSync(filePath).size === 0) continue;

          const hash = await sha256File(filePath);

          const existing = await this.processedRepo.findOne({
            where: { hash },
          });

          if (existing && existing.status === 'done') {
            this.logger.log(`File ${filePath} already uploaded — skipping.`);
            continue;
          }

          // Read release notes from .txt first
          const notesFile = join(
            this.releasesDir,
            basename(filePath, extname(filePath)) + '.txt',
          );

          // Read release notes from .txt
          let releaseNotes = `Auto-upload from cron: ${basename(filePath)}`;
          if (existsSync(notesFile)) {
            releaseNotes = readFileSync(notesFile, 'utf-8');
          }

          // Atomically claim the file
          try {
            await this.processedRepo.insert({
              hash,
              filename: basename(filePath),
              status: 'processing',
              releaseNotes,
            });
          } catch {
            this.logger.log(
              `File with hash ${hash} already processing/processed — skipping.`,
            );
            continue;
          }

          const emails = betaTesters.map((t) => t.email);

          const result = await this.fad.uploadAndDistribute(filePath, {
            releaseNotes,
            emails,
            groupIds: ['v1testers'],
          });

          const releaseInfo = await this.fad.getReleaseInfo(result.releaseName);

          await this.processedRepo.update(
            { hash },
            {
              status: 'done',
              releaseName: releaseInfo.name,
              downloadUrl: releaseInfo.binaryDownloadUri ?? null,
            },
          );

          renameSync(filePath, join(this.archiveDir, basename(filePath)));

          this.logger.log(`Processed and archived ${filePath}`);
        } catch (err) {
          this.logger.error(`Error processing ${filePath}`, err);
          try {
            const hash = await sha256File(filePath);
            await this.processedRepo.update({ hash }, { status: 'failed' });
          } catch (_) {}
        }
      }
    } catch (err) {
      this.logger.error('Error scanning folder', err);
    }
  }
}
