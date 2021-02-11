import React, { useState, useContext, useEffect } from 'react';
import { useWeb3 } from './Web3';
import DuFundRegistryFacade from '@DuFund/core/dist/classes/DuFundFacade';

interface IDuFundContext {
  duFundRegistryFacade: DuFundRegistryFacade | null;
}

const DuFundContext = React.createContext<IDuFundContext>({
  duFundRegistryFacade: null,
});

const useDuFund = (): IDuFundContext => useContext(DuFundContext);

const useDuFundProvider = (): IDuFundContext => {
  const [duFundRegistryFacade, setDuFundRegistryFacade] = useState<DuFundRegistryFacade | null>(null);
  const { web3Instance, account } = useWeb3();

  useEffect((): void => {
    if (account && web3Instance) {
      setDuFundRegistryFacade(
        new DuFundRegistryFacade(web3Instance, account, process.env.REACT_APP_DU_FUND_REGISTRY_CONTRACT_ADDRESS || ''),
      );
    }
  }, [account]);

  return {
    duFundRegistryFacade,
  };
};

const DuFundProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const duFundRegistryFacade = useDuFundProvider();

  return <DuFundContext.Provider value={duFundRegistryFacade}>{children}</DuFundContext.Provider>;
};

export { DuFundProvider, useDuFund };
