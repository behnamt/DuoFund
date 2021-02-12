import { Box, Container } from '@chakra-ui/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useIpfs } from '../context/IPFS';
import { useOrbitDB } from '../context/OrbitDB';
import NavBar from './NavBar';
import Navigation from './Navigation';

export const ContextAwareApp = (): React.ReactElement => {
  const { isPending: isIPFSPending, ipfs } = useIpfs();
  const { isPending: isDBPending, DB } = useOrbitDB();

  return !isIPFSPending && !!ipfs && !isDBPending && !!DB ? (
    <Box maxW={['100%', null, null, null, 1280]} mx="0" my="auto">
      <BrowserRouter>
        <NavBar />
        <Navigation />
      </BrowserRouter>
    </Box>
  ) : (
    <span>Loading...</span>
  );
};
