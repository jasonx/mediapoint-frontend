export interface IEmailVerification {
  expires: string;
  hash: string;
  id: string;
  signature: string;
}
