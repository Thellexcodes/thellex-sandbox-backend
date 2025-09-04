import { Injectable, Logger } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { Repository } from 'typeorm';
import { isDev } from '@/utils/helpers';

//[x] handle errors with enums
@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);
  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepo: Repository<DeviceEntity>,
  ) {}

  async saveFcmToken(
    user: UserEntity,
    createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceEntity> {
    const { fcmToken, deviceId, platform, deviceModel, osVersion } =
      createDeviceDto;

    if (!fcmToken || !deviceId) {
      this.logger.error(
        `Invalid FCM token or deviceId: ${fcmToken}, ${deviceId}`,
      );
    }

    // Check for existing device with same userId and deviceId
    let device = await this.deviceRepo.findOne({
      where: { user: { id: user.id }, deviceId },
    });

    if (device) {
      // Update existing device
      device.fcmToken = fcmToken;
      device.platform = platform;
      device.deviceModel = deviceModel;
      device.osVersion = osVersion;

      isDev &&
        this.logger.log(
          `Updating FCM token for user ${user.id}, device ${deviceId}`,
        );
    } else {
      // Create new device
      device = this.deviceRepo.create({
        fcmToken,
        deviceId,
        platform,
        deviceModel,
        osVersion,
        user,
      });

      isDev &&
        this.logger.log(
          `Creating new device for user ${user.id}, device ${deviceId}`,
        );
    }

    try {
      return await this.deviceRepo.save(device);
    } catch (error) {
      this.logger.error(
        `Failed to save device for user ${user.id}: ${error.message}`,
      );
    }
  }

  async removeFcmToken(userId: string, deviceId: string): Promise<void> {
    const device = await this.deviceRepo.findOne({
      where: { user: { id: userId }, deviceId },
    });
    if (!device) {
      this.logger.warn(
        `Device not found for user ${userId}, device ${deviceId}`,
      );
      return;
    }

    this.logger.log(
      `Removing FCM token for user ${userId}, device ${deviceId}`,
    );
    await this.deviceRepo.delete({ user: { id: userId }, deviceId });
  }

  async getUserDeviceTokens(userId: string): Promise<string[]> {
    const devices = await this.deviceRepo.find({
      where: { user: { id: userId } },
    });
    this.logger.log(`Retrieved ${devices.length} devices for user ${userId}`);
    return devices.map((device) => device.fcmToken);
  }

  // async sendNotificationToUser(
  //   userId: string,
  //   title: string,
  //   body: string,
  //   data?: Record<string, string>,
  // ): Promise<void> {
  //   const tokens = await this.getUserDeviceTokens(userId);
  //   if (!tokens.length) {
  //     this.logger.warn(`No devices found for user ${userId}`);
  //     return;
  //   }

  //   const message = {
  //     notification: { title, body },
  //     data: data || {},
  //     tokens,
  //   };

  //   try {
  //     this.logger.log(
  //       `Sending notification to user ${userId} on ${tokens.length} devices`,
  //     );
  //     await admin.messaging().sendMulticast(message);
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to send notification to user ${userId}: ${error.message}`,
  //     );
  //     throw new BadRequestException(TransactionError.UNKNOWN_ERROR);
  //   }
  // }
}
