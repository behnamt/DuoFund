import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { useAsync, AsyncState } from 'react-async';
import DocumentStore from 'orbit-db-docstore';
import { ICFStored } from '@DuFund/core/dist/@types/CF.types';
import { useIpfs } from './IPFS';
import { connect, createInstance } from '@DuFund/core/dist/services/orbitDB';

interface IOrbitDBContext {
  DB: DocumentStore<ICFStored> | null;
  isPending: boolean;
}

const orbitDBContext = React.createContext<IOrbitDBContext>({
  DB: null,
  isPending: false,
});

const useOrbitDB = (): IOrbitDBContext => useContext(orbitDBContext);

const useOrbitDBProvider = (): IOrbitDBContext => {
  const [DB, setDB] = useState<DocumentStore<ICFStored> | null>(null);

  const { ipfs } = useIpfs();

  const { run: connectToDB, isPending }: AsyncState<DocumentStore<ICFStored>> = useAsync({
    deferFn: useCallback(async () => {
      await createInstance();

      const database = await connect(process.env.REACT_APP_ORBIT_DB_INSTANCE!);
      await database.load();

      return database;
    }, []),
    onResolve: (db) => setDB(db),
  });

  useEffect(() => {
    if (ipfs) {
      connectToDB();
    }
  }, [ipfs]);

  return {
    DB,
    isPending,
  };
};

const OrbitDBProvider = ({ children }: any): ReactElement => {
  const orbitDB = useOrbitDBProvider();

  return <orbitDBContext.Provider value={orbitDB}>{children}</orbitDBContext.Provider>;
};

export { OrbitDBProvider, useOrbitDB };
