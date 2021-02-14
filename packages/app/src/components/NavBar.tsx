import { Button, HStack } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
const NavBar = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();

  const tryToConnect = (): void => {
    enqueueSnackbar('', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
      },
      // eslint-disable-next-line
      content: (key, message) => <Button>ABABA</Button>,
    });
  };

  return (
    <HStack h="100%" spacing="24px" align="center">
      <Link to="/">Home</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/">Home</Link>
      <Button style={{ marginInlineStart: 'auto' }} onClick={tryToConnect} />
    </HStack>
  );
};

export default NavBar;
