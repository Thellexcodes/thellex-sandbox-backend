import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { UserSecurityEntity } from '@/utils/typeorm/entities/user/user.security.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(UserSecurityEntity)
    private userSecurityRepo: Repository<UserSecurityEntity>,
    @InjectRepository(DeviceEntity)
    private deviceRepo: Repository<DeviceEntity>,
  ) {}

  // Set reusable PIN
  async setUserPin(userId: string, pin: string) {
    const hashed = await bcrypt.hash(pin, 10);
    let userSec = await this.userSecurityRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!userSec) {
      userSec = this.userSecurityRepo.create({
        user: { id: userId },
        hasPin: true,
        pinHash: hashed,
      });
    } else {
      userSec.hasPin = true;
      userSec.pinHash = hashed;
    }

    await this.userSecurityRepo.save(userSec);
  }

  // Verify PIN
  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const userSec = await this.userSecurityRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!userSec || !userSec.hasPin || !userSec.pinHash) return false;
    return bcrypt.compare(pin, userSec.pinHash);
  }

  // Enable biometric for device
  async enableBiometric(deviceId: string) {
    const device = await this.deviceRepo.findOne({ where: { deviceId } });
    if (!device) return false;

    device.hasBiometric = true;
    device.biometricEnabled = true;
    await this.deviceRepo.save(device);
    return true;
  }

  // Check available security methods for a device
  async getDeviceSecurityMethods(userId: string, deviceId: string) {
    const device = await this.deviceRepo.findOne({ where: { deviceId } });
    const userSec = await this.userSecurityRepo.findOne({
      where: { user: { id: userId } },
    });

    return {
      hasBiometric: device?.hasBiometric && device?.biometricEnabled,
      hasPin: userSec?.hasPin ?? false,
    };
  }
}
