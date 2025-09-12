import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type BuildStatus = 'processing' | 'done' | 'failed';

@Entity('processed_builds')
export class ProcessedBuildEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128 })
  hash: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  filename?: string; // original filename for reference

  @Column({ type: 'varchar', length: 512, nullable: true })
  releaseName?: string;

  @Column({ type: 'text', nullable: true })
  releaseNotes?: string; // <-- new column for release notes

  @Column({ type: 'varchar', length: 1024, nullable: true })
  downloadUrl?: string;

  @Column({ type: 'varchar', length: 32, default: 'processing' })
  status: BuildStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
