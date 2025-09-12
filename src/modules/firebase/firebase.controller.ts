// src/firebase/firebase.controller.ts
import { Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseDistributionService } from './firebase-distribution.service';
import { VersionedController101 } from '../controller/base.controller';
import { ApiTags } from '@nestjs/swagger';

// @ApiTags('Firebase')
@VersionedController101('app-distribution')
export class FirebaseController {
  constructor(private readonly fad: FirebaseDistributionService) {}

  // multipart/form-data: file + optional JSON fields
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // async upload(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body('emails') emailsCsv?: string,
  //   @Body('groupIds') groupIdsCsv?: string,
  //   @Body('releaseNotes') releaseNotes?: string,
  // ) {
  //   if (!file) {
  //     return { error: 'Missing file (field: "file")' };
  //   }
  //   const emails = emailsCsv
  //     ? emailsCsv
  //         .split(',')
  //         .map((s) => s.trim())
  //         .filter(Boolean)
  //     : undefined;
  //   const groupIds = groupIdsCsv
  //     ? groupIdsCsv
  //         .split(',')
  //         .map((s) => s.trim())
  //         .filter(Boolean)
  //     : undefined;

  //   const result = await this.fad.uploadAndDistribute(file.path, {
  //     emails,
  //     groupIds,
  //     releaseNotes,
  //   });
  //   return { ok: true, ...result };
  // }
}
