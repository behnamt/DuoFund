import { ICFStored } from '@DuFund/core/dist/@types/CF.types';
import React, { useCallback } from 'react';
import { useOrbitDB } from '../../context/OrbitDB';
import { useAsync, AsyncState } from 'react-async';

const ProjectListings = (): React.ReactElement => {
  const { DB } = useOrbitDB();

  const getAllProjects = useCallback(async (): Promise<ICFStored[]> => DB!.get(''), []);

  const { data, isPending }: AsyncState<ICFStored[]> = useAsync({
    promiseFn: getAllProjects,
    onResolve: (data) => console.log(data),
  });

  return (
    <div>
      ProjectListings
      <div>{!isPending && data?.map((item) => <div key={item.id}>{item.name}</div>)}</div>
      <div>{isPending && <span>Loading</span>}</div>
    </div>
  );
};

export default ProjectListings;
