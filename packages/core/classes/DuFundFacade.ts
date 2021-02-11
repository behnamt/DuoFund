import Web3 from 'web3';
import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem, toWei } from 'web3-utils';
import DuFundJSON from '@DuFund/contracts/build/contracts/DuFund.json';
import { ICFStored, ICFStoring } from '../@types/CF.types';
import { DBInstance } from '../services/orbitDB';

const convertMillisecondsToSeconds = (date: number) => Math.floor(date / 1000);

class DuFundFacade {
  public contract!: Contract;

  private readonly web3: Web3;
  private readonly account: string;

  constructor(web3: Web3, _account: string, contractAddress: string) {
    this.web3 = web3;
    this.account = _account;
    this.contract = this.contractInstance(_account, contractAddress);
  }

  private contractInstance(account: string, contractAddress: string): Contract {
    return new this.web3.eth.Contract(DuFundJSON.abi as AbiItem[], contractAddress, {
      from: account,
    });
  }

  public async CFList(): Promise<ICFStored[]> {
    if (!DBInstance) {
      throw 'Orbit db is not initialized';
    }

    return DBInstance.get('');
  }

  public async createCF(payload: ICFStoring): Promise<void> {
    const id = this.contract.methods.getTokenID().call();

    const {expiryDate, etherTarget, etherPerToken, ...rest} = payload;
    
    if (!DBInstance) {
      throw 'Orbit db is not initialized';
    }

    const target = toWei(etherTarget, 'ether');
    const weiPerToken = toWei(etherPerToken, 'ether');

    const hash = await DBInstance.put({
      id,
      creator: this.account,
      creationDate: convertMillisecondsToSeconds(Date.now()),
      expiryDate: convertMillisecondsToSeconds(expiryDate),
      target,
      weiPerToken,
      ...rest
    });

    const estimateGas = await this.contract.methods
      .createCF(
        id,
        hash,
        target,
        convertMillisecondsToSeconds(payload.expiryDate),
        weiPerToken,
      )
      .estimateGas({ gas: 2500000 });

    await this.contract.methods
      .createCF(
        id,
        hash,
        target,
        convertMillisecondsToSeconds(payload.expiryDate),
        weiPerToken,
      )
      .send({ gas: estimateGas + 1 });
  }
}

export default DuFundFacade;
