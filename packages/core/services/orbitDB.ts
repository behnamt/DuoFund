import OrbitDB from 'orbit-db';
import DocumentStore from 'orbit-db-docstore';
import { ICFStored } from '../@types/CF.types';
import { ipfsNode } from './IpfsService';

let orbitDBInstance: OrbitDB;
let DBInstance: DocumentStore<ICFStored>;

async function createInstance(): Promise<OrbitDB> {
  orbitDBInstance = await OrbitDB.createInstance(ipfsNode);

  return orbitDBInstance;
}

async function connect(instanceAddress: string): Promise<DocumentStore<ICFStored>> {
  DBInstance = await orbitDBInstance.docs(instanceAddress, {
    accessController: {
      write: ['*'],
    },
    indexBy: 'id',
  } as any);

  return DBInstance;
}

export { orbitDBInstance, DBInstance, createInstance, connect };
