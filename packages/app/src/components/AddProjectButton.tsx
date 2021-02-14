import React from 'react';
import { useSnackbar } from 'notistack';
import { Box, Button, Text } from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3';
import { useHistory } from 'react-router-dom';

const LoginSnackMessage = (): React.ReactElement => {
  return (
    <Box>
      <Text fontSize="md">You will be asked to login with your </Text>
    </Box>
  );
};

const AddProjectButton = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();
  const { account, web3Instance } = useWeb3();
  const { push } = useHistory();

  const tryToConnect = (): void => {
    enqueueSnackbar('', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
      },
      // eslint-disable-next-line
      content: LoginSnackMessage,
    });
  };

  const login = (): void => {
    console.log(web3Instance);

    if (web3Instance && !account) {
      tryToConnect();
    } else if (web3Instance && account) {
      push('/create');
    } else if (!web3Instance) {
      console.log('walletconnect');
    }
  };

  return <Button style={{ marginInlineStart: 'auto' }} onClick={login} />;
};

export default AddProjectButton;
