import { InstantData } from '../model';

export type PermitType = 'default' | 'smart-approve';

export interface PermitData {
  type: PermitType;
  transaction: string;
  expiresAt: InstantData;
  chainId: string;
  tokenAddress: string;
  actorAddress: string;
  maxAmount: string | undefined;
}

export class PermitCache {
  private permit: PermitData | undefined;

  public storePermit(permit: PermitData): void {
    this.permit = permit;
  }

  public getPermit(): PermitData | undefined {
    return this.permit;
  }

  public invalidatePermit(): void {
    this.permit = undefined;
  }
}
