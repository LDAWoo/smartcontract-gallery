import * as anchor from '@project-serum/anchor'
import fs from 'mz/fs'
import * as dotenv from "dotenv";
import {create as ipfsHttpClient} from 'ipfs-http-client'
dotenv.config();

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecretKey = process.env.PROJECT_SECRET_KEY;

const auth = `Basic ${btoa(`${projectId}:${projectSecretKey}`)}`;

export async function createKeypairFromFile(
    filePath: string
): Promise<anchor.web3.Keypair>{
    const secrectKeystring = await fs.readFile(filePath, {encoding: 'utf8'});
    const secrectKey = Uint8Array.from(JSON.parse(secrectKeystring));
    return anchor.web3.Keypair.fromSecretKey(secrectKey);
}

export async function uploadMetaDataToIPFS(
    metadata: object
) {
    try {
        const client = ipfsHttpClient({
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https",
            apiPath: "/api/v0",
            headers: {
              authorization: auth,
              "Content-Type": "application/json"
            },
        });

        const metadataJson = JSON.stringify(metadata);
        const added = await client.add(metadataJson);
        const url = `https://cloudflare-ipfs.com/ipfs/${added.path}`;
        return url;
    } catch (error) {
        console.log(error);
        return null;
    }
}
