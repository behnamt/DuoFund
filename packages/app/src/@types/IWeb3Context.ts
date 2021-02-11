import Web3 from 'web3';
import { Account } from 'web3-core';

export interface IWeb3Context {
  isBrowserWallet: boolean;
  isPending: boolean;
  web3Instance: Web3 | null;
  account: string | null;
  connect: (account?: Account | string) => void;
  disconnect: () => void;
  encryptionPublicKey: string | null;
}
