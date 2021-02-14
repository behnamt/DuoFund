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
    <Box>
      <BrowserRouter>
        <Box
          w="100%"
          boxShadow="sm"
          h="60px"
          borderBottom="1px"
          borderColor="gray.200"
          bg="white"
          position="sticky"
          top="0"
        >
          <Box maxW={['100%', null, null, null, 1280]} px={['1rem', null, null, null, 0]} m="0 auto" h="100%">
            <NavBar />
          </Box>
        </Box>
        <Box maxW={['100%', null, null, null, 1280]} m="0 auto" px={['1rem', null, null, null, 0]}>
          <Navigation />
        </Box>
      </BrowserRouter>
    </Box>
  ) : (
    <span>Loading...</span>
  );
};
