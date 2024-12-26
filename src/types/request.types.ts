import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Response } from 'express';

interface UserSession {
  id: string;
  cookie: Cookie;
}

interface Cookie {
  path: string;
  _expires: Date;
  originalMaxAge: number;
  httpOnly: boolean;
}

export interface CustomRequest extends Request {
  user?: UserEntity;
  sessionId?: string;
  session?: UserSession;
}

export interface CustomResponse extends Response {}
