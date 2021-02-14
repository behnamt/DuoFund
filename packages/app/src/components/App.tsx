import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { SnackbarProvider } from 'notistack';
import { Web3Provider } from '../context/Web3';
import { DuFundProvider } from '../context/DuFund';
import { IpfsProvider } from '../context/IPFS';
import { OrbitDBProvider } from '../context/OrbitDB';
import { ContextAwareApp } from './ContextAwarApp';
import theme from '../theme';

const Root = (): React.ReactElement => (
  <React.StrictMode>
    <Web3Provider>
      <DuFundProvider>
        <IpfsProvider>
          <OrbitDBProvider>
            <SnackbarProvider maxSnack={3}>
              <ChakraProvider theme={theme}>
                <ContextAwareApp />
              </ChakraProvider>
            </SnackbarProvider>
          </OrbitDBProvider>
        </IpfsProvider>
      </DuFundProvider>
    </Web3Provider>
  </React.StrictMode>
);

export default Root;
