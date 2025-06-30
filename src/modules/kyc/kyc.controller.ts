import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { KycService } from './kyc.service';
import { BasicTierKycDto, KycResponseDto } from './dto/kyc-data.dto';

@ApiTags('Kyc')
@Controller('kyc')
@ApiBearerAuth('access-token')
export class kycController {
  constructor(private readonly kycService: KycService) {}

  @Post('basic')
  @UseGuards(AuthGuard)
  @ApiBody({ type: BasicTierKycDto, description: 'Basic KYC information' })
  @ApiOkResponse({ type: KycResponseDto })
  async createBasicTierKyc(
    @Body() basicKycDto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    // const user = req.user;
    // const basicKanyanyanyanyanyanyanyanyycRes = await this.kycService.createBasicKyc(basicKycDto, user);

    const data = {
      isVerified: true,
      currentTier: {
        name: 'basic',
        target: 'First-Time Users',
        description: 'Users verified with NIN and BVN.',
        transactionLimits: {
          dailyCreditLimit: 50000,
          dailyDebitLimit: 50000,
          singleDebitLimit: 50000,
        },
        txnFee: {
          min: 1,
          max: 300,
          feePercentage: 2.5,
        },
        requirements: [
          'ID Type',
          'Additional ID Type',
          'First Name',
          'Middle Name',
          'Last Name',
          'Phone Number',
          'Date of Birth',
          'NIN (National ID Number)',
          'BVN (Bank Verification Number)',
        ],
      },
      nextTier: {
        name: 'personal',
        target: 'Verified Individuals',
        description:
          'Users with face and address verification — ideal for POS/crypto usage.',
        transactionLimits: {
          dailyCreditLimit: 500000,
          dailyDebitLimit: 500000,
          singleDebitLimit: 100000,
        },
        txnFees: {},
        requirements: ['Face Verification', 'Residential Address'],
      },
    };

    console.log('hitting');

    responseHandler(data, res, req);
  }
}
