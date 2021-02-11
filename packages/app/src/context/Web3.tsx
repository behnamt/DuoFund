import React, { useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import { IWeb3Context } from '../@types/IWeb3Context';

//eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let ethereum: any;

const web3Context = React.createContext<IWeb3Context>({
  isBrowserWallet: false,
  isPending: false,
  web3Instance: null,
  account: null,
  connect: () => null,
  disconnect: () => null,
  encryptionPublicKey: null,
});

const useWeb3 = (): IWeb3Context => useContext(web3Context);

const useWeb3Provider = (): IWeb3Context => {
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isBrowserWallet, setIsBrowserWallet] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [encryptionPublicKey, setEncryptionPublicKey] = useState<string>('');

  const handleAccountsChanged = async (accounts: string[]): Promise<void> => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
      console.debug('account changed: %s', accounts[0]);
    }
  };

  const setBrowserWalletPublicKey = async (address: string): Promise<void> => {
    if (!web3Instance) {
      console.error('where is web3 instance?');
    }
    try {
      const key = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [address], // you must have access to the specified account
      });
      setEncryptionPublicKey(key);
    } catch (error) {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
      } else {
        console.error(error);
      }
    }
  };

  const getBrowserWalletAccount = async (): Promise<string[]> => {
    return window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const connect = async (): Promise<void> => {
    if (isBrowserWallet) {
      try {
        setIsPending(true);
        const accounts = await getBrowserWalletAccount();
        setBrowserWalletPublicKey(accounts[0]);
        handleAccountsChanged(accounts);
        setIsPending(false);
      } catch (error) {
        console.debug(error);
      }
    }
  };

  const disconnect = async (): Promise<void> => {
    setAccount(null);
  };

  useEffect((): void => {
    if (window.ethereum) {
      const web3: Web3 = new Web3(ethereum);
      window.ethereum.enable();
      setIsBrowserWallet(true);
      setWeb3Instance(web3);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    } else {
      const web3: Web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.REACT_APP_ETHEREUM_NODE || ''));
      setWeb3Instance(web3);
    }
  }, []);

  return {
    isBrowserWallet,
    isPending,
    web3Instance,
    account,
    connect,
    disconnect,
    encryptionPublicKey,
  };
};

const Web3Provider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const web3 = useWeb3Provider();

  return <web3Context.Provider value={web3}>{children}</web3Context.Provider>;
};

export { Web3Provider, useWeb3 };
