import React from 'react';
import { useIpfs } from '../context/IPFS';
import { useOrbitDB } from '../context/OrbitDB';

export const ContextAwareApp = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isPending: isIPFSPending, ipfs } = useIpfs();
  const { isPending: isDBPending, DB } = useOrbitDB();

  return !isIPFSPending && !!ipfs && !isDBPending && !!DB ? <>{children}</> : <span>Loading...</span>;
};
