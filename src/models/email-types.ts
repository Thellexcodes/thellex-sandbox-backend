export type TransportTypes = 'noreply' | 'support' | 'ceo';
export interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
  transport: TransportTypes;
}
