import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3';

const CreateProject = (): React.ReactElement => {
  const { account } = useWeb3();
  const { replace } = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (!account) {
      enqueueSnackbar('You are not logged in yet.', { variant: 'warning', persist: false });
      replace('/');
    }
  }, []);

  return <div>Create</div>;
};

export default CreateProject;
