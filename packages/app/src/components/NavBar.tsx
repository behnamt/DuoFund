import { HStack } from '@chakra-ui/react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AddProjectButton from './AddProjectButton';
const NavBar = (): React.ReactElement => {
  const { pathname } = useLocation();

  return (
    <HStack h="100%" spacing="24px" align="center">
      <Link to="/">Home</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/">Home</Link>
      {pathname !== '/create' && <AddProjectButton />}
    </HStack>
  );
};

export default NavBar;
