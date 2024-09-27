import { WagmiWalletAction } from './action';

export class WagmiActionQueue {
  private actions: WagmiWalletAction[];

  public constructor() {
    this.actions = [];
  }

  public addFirst(action: WagmiWalletAction): void {
    this.actions.unshift(action);
  }

  public addLast(action: WagmiWalletAction): void {
    this.actions.push(action);
  }

  public peek(): WagmiWalletAction | undefined {
    if (!this.actions.length) {
      return undefined;
    }

    const action = this.actions[0];
    return action;
  }

  public consume(): void {
    this.actions.shift();
  }

  public consumeOperation(operation: string): void {
    this.actions = this.actions.filter((a) => a.operation !== operation);
  }
}
