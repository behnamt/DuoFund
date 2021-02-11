import IPFS from 'ipfs';

export interface IpfsContextInterface {
  ipfs: IPFS | undefined;
  isPending: boolean;
}
