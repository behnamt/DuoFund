import React, { useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { IWeb3Context } from '../@types/IWeb3Context';

const web3Context = React.createContext<IWeb3Context>({
  isBrowserWallet: false,
  isPending: false,
  web3Instance: null,
  account: null,
  connect: () => null,
  disconnect: () => null,
  createAndConnectWalletConnectProvider: () => null,
  encryptionPublicKey: null,
});

const useWeb3 = (): IWeb3Context => useContext(web3Context);

const useWeb3Provider = (): IWeb3Context => {
  const [provider, setProvider] = useState<any>(null);
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
      const key = await provider.request({
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

  const getBrowserWalletAccount = async (_provider: any = provider): Promise<string[]> => {
    return _provider.request({ method: 'eth_requestAccounts' });
  };

  const connect = async (_provider: any = provider): Promise<void> => {
    try {
      setIsPending(true);
      if (_provider) {
        const web3: Web3 = new Web3(_provider);
        _provider.enable();
        setWeb3Instance(web3);
        _provider.on('accountsChanged', handleAccountsChanged);
        const accounts = await getBrowserWalletAccount(_provider);
        setBrowserWalletPublicKey(accounts[0]);
        handleAccountsChanged(accounts);
      }
      setIsPending(false);
    } catch (error) {
      console.debug(error);
    }
  };

  const createAndConnectWalletConnectProvider = (): void => {
    const provider_ = new WalletConnectProvider({
      infuraId: process.env.REACT_APP_INFURA_KEY,
    });
    connect(provider_);

    setProvider(provider_);
  };

  const disconnect = async (): Promise<void> => {
    setAccount(null);
  };

  useEffect((): void => {
    if (window.ethereum) {
      setProvider(window.ethereum);
      setIsBrowserWallet(true);
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
    createAndConnectWalletConnectProvider,
  };
};

const Web3Provider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const web3 = useWeb3Provider();

  return <web3Context.Provider value={web3}>{children}</web3Context.Provider>;
};

export { Web3Provider, useWeb3 };
