import Web3 from 'web3';
import IPFS, { Buffer, CID } from 'ipfs';
import ipfsClient from 'ipfs-http-client';

import { IpfsConfigInterface } from '../@types/IpfsConfig.types';
import { IpfsTreeItemInterface } from '../@types/Ipfs.types';

let ipfsNode: IPFS;

// run a node locally, e.g. in browser
// https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/FAQ.md#how-to-enable-webrtc-support-for-js-ipfs-in-the-browser

async function startNode(): Promise<IPFS> {
  ipfsNode = await IPFS.create({
    EXPERIMENTAL: {
      pubsub: true, // required, enables pubsub
    },
    config: {
      Addresses: {
        Swarm: [
          '/ip4/127.0.0.1/tcp/9090/wss/p2p-webrtc-star',
          // These are public webrtc-star servers
          // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        ],
      },
    },
  });

  return ipfsNode;
}

function stopNode(): Promise<void> {
  return ipfsNode.stop();
}
// connect to a http node
function connectNode(config: IpfsConfigInterface): void {
  ipfsNode = ipfsClient(config);
}

async function add(content: string | string[]): Promise<string[]> {
  const addResult = ipfsNode.add(content);
  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const result of addResult) {
    results.push(result);
  }

  return results;
}

async function read(fileContent: string): Promise<string> {
  const chunks: string[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of fileContent) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString();
}

async function getContent(cid: string): Promise<string> {
  const content: string = await ipfsNode.cat(cid);

  return read(content);
}

async function getContentFromDir(folderCid: string | CID, filename: string): Promise<string> {
  if (typeof folderCid !== 'string') {
    // eslint-disable-next-line no-param-reassign
    folderCid = folderCid.toString();
  }

  // eslint-disable-next-line no-restricted-syntax
  for await (const file of ipfsNode.ls(folderCid)) {
    if (file.name === filename) {
      return getContent(file.cid);
    }
  }

  return '';
}

async function ls(
  folderCid: string | CID | Buffer,
  visitor?: (file: IpfsTreeItemInterface) => void,
): Promise<IpfsTreeItemInterface[]> {
  const files = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const file of ipfsNode.ls(folderCid)) {
    if (visitor) {
      await visitor(file);
    }

    files.push(file);
  }

  return files;
}

function hex2hash(cidAsHex: string): CID {
  const bytes = Web3.utils.hexToBytes(cidAsHex);
  const cid = new CID(Buffer.from(bytes));

  return cid;
}

/**
 * strips the first 2 bytes of that cid
 * https://nodejs.org/api/buffer.html#buffer_buffers_and_typedarrays
 */
function v0CidToBytes32(cid: CID | null): Buffer {
  if (cid) {
    return Buffer.from(cid.bytes.slice(2)); // chopping off the [18,32] header
  }

  return Buffer.alloc(32, 0);
}

function bytes32ToV0Cid(hex: string): CID {
  const cidBytes = Buffer.from(Web3.utils.hexToBytes(hex));

  // add the v0 cid header section back again
  return new CID(Buffer.concat([Buffer.from([18, 32]), cidBytes]));
}

function publish(name: string, message: string, from: string): void {
  if (ipfsNode) {
    const data = Buffer.from(
      JSON.stringify({
        from,
        content: message,
      }),
    );

    ipfsNode.pubsub.publish(name, data, (err: string) => {
      if (err) {
        console.debug('error publishing: ', err);
      } else {
        console.debug('successfully published message');
      }
    });
  }
}

function subscribe(name: string, address: string, callback: (object: any) => void): void {
  if (ipfsNode) {
    console.debug('SUBSCRIBING TO');

    ipfsNode.pubsub.subscribe(name, (msg: any) => {
      try {
        const content = JSON.parse(msg.data.toString('utf-8'));
        const seqno = msg.seqno.toString('utf-8');
        // if (content.from !== address){
        callback({ ...content, seqno });
        // }
      } catch {
        console.debug('ERROR');
      }
    });
  }
}

function unsubscribe(name: string): void {
  if (ipfsNode) {
    ipfsNode.pubsub.unsubscribe(name);
  }
}

export {
  add,
  connectNode,
  getContent,
  getContentFromDir,
  hex2hash,
  ls,
  read,
  startNode,
  stopNode,
  ipfsNode,
  v0CidToBytes32,
  bytes32ToV0Cid,
  publish,
  subscribe,
  unsubscribe,
};
