import { startNode } from '../services/IpfsService';
import OrbitDB from 'orbit-db';

const main = async (): Promise<void> => {
  const ipfs = await startNode();
  const orbitdb = await OrbitDB.createInstance(ipfs);

  const options = {
    // Setup write access
    accessController: {
      write: ['*'],
    },
    indexBy: 'name',
  };

  const db = await orbitdb.docs('dufund-database', options);
  console.log(`DB created with address: ${db.address.toString()}`);
};

main();
