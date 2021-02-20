import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

type Ref = any;

interface ISnackMessageProps {
  id: number | string;
}

const StyledBox = styled(Box)`
  padding: 1rem;
  box-shadow: 2px 2px 10px grey;
  border-radius: 4px;
  background-color: white;
`;

const ConnectButton = styled(Button)`
  background-color: #ffa436;
  padding: 4px 10px;
  border-radius: 4px;
  margin-right: 1rem;
`;

const CancelButton = styled(Button)`
  padding: 4px 10px;
  border-radius: 4px;
  border: 2px gray solid;
`;

const SnackMessage = React.forwardRef((props: ISnackMessageProps, ref: Ref) => {
  const { closeSnackbar } = useSnackbar();
  const { connect } = useWeb3();

  const handleDismiss = (): void => {
    closeSnackbar(props.id);
  };

  const handleConnect = (): void => {
    connect();
    closeSnackbar(props.id);
  };

  return (
    <Box ref={ref}>
      <StyledBox>
        <Flex direction="column">
          <Text>You will be asked to connect your wallet to this website.</Text>
          <Text>Please confirm to continue.</Text>
          <Flex direction="row" justify="center">
            <ConnectButton onClick={handleConnect} mr={2}>
              Connect
            </ConnectButton>
            <CancelButton onClick={handleDismiss}>Cancel</CancelButton>
          </Flex>
        </Flex>
      </StyledBox>
    </Box>
  );
});

const AddProjectButton = (): React.ReactElement => {
  const [isLoginPending, setIsLoginPending] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();
  const { account, web3Instance, isBrowserWallet, connect, createAndConnectWalletConnectProvider } = useWeb3();
  const { push } = useHistory();

  const tryToConnect = (): void => {
    enqueueSnackbar('', {
      persist: true,
      content: (key: number | string) => <SnackMessage id={key} />,
    });
  };

  const login = (): void => {
    setIsLoginPending(true);
    if (isBrowserWallet && !account) {
      tryToConnect();
    } else if (web3Instance && account) {
      setIsLoginPending(false);
      push('/create');
    } else if (!web3Instance) {
      createAndConnectWalletConnectProvider();
    }
  };

  useEffect(() => {
    if (isLoginPending && account) {
      push('/create');
    }
  }, [account, isLoginPending]);

  return (
    <Button colorScheme="blackAlpha" style={{ marginInlineStart: 'auto' }} onClick={login}>
      Create a new project
    </Button>
  );
};

export default AddProjectButton;
