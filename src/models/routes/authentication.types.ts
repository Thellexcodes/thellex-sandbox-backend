type HttpMethod = 'GET' | 'POST' | 'PUT';

interface IGenerateYCSignature {
  method: HttpMethod;
  path: string;
  publicKey: string;
  secretKey: string;
  body?: Record<string, any> | string;
}
