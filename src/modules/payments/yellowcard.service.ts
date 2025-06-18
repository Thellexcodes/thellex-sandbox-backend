import { HttpService } from '@/middleware/http.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YellowCardService {
  constructor(httpService: HttpService) {}
}
