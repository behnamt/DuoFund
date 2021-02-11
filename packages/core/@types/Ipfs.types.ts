import { CID } from 'ipfs';

export interface IPFSFileItemInterface {
  depth: number;
  name: string;
  path: string;
  size: number;
  message: string;
  cid: CID;
  type: EIPFSFileTypeNumber | EIPFSFileTypeString;
  mode: string;
  sender: string;
  mtime: { secs: number; nsecs: number };
}

export interface IpfsTreeItemInterface extends IPFSFileItemInterface {
  children: IpfsTreeItemInterface[];
}

export enum EIPFSFileTypeNumber {
  FILE = 0,
  DIRECTORY = 1,
}

export enum EIPFSFileTypeString {
  FILE = 'file',
  DIRECTORY = 'dir',
}
