import { Flex } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = (): React.ReactElement => {
  return (
    <Flex w="100%" h="60px" borderBottom="1px" borderColor="gray.200" bg="white" position="sticky" top="0">
      <Link to="/">Home</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/">Home</Link>
    </Flex>
  );
};

export default NavBar;
