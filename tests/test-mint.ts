import {
	MPL_TOKEN_METADATA_PROGRAM_ID,
	findMasterEditionPda,
	findMetadataPda,
	mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { MarketplaceProgram } from "../target/types/marketplace_program";

import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { uploadMetaDataToIPFS } from "./utils";

describe("mint-nft", async() => {

  const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace
		.MarketplaceProgram as Program<MarketplaceProgram>;

	const signer = provider.wallet;

	const umi = createUmi("https://api.devnet.solana.com")
		.use(mplTokenMetadata());

    const mint = anchor.web3.Keypair.generate();

    // Derive the associated token address account for the mint
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      signer.publicKey
    );

    // derive the metadata account
    let metadataAccount = findMetadataPda(umi, {
      mint: publicKey(mint.publicKey),
    })[0];

    //derive the master edition pda
    let masterEditionAccount = findMasterEditionPda(umi, {
      mint: publicKey(mint.publicKey),
    })[0];

	const data = {
		"name": "Fox #6082",
		"symbol": "FOX",
		"description": "2000 nft fox",
		"seller_fee_basis_points": 0,
		"external_url": "",
		"image": "https://nftstorage.link/ipfs/bafkreie5bbdcqkxdws5sckt3s72mgf3ewe6y5ulwlp5ziuipb426futoja",
		"attributes": [
		  {
			"trait_type": "Eyes",
			"value": "Wink"
		  },
		  {
			"trait_type": "Outfit",
			"value": "Shirt Camo"
		  },
		],
		"properties": {
		  "creators": [
			{
			  "address": signer.publicKey,
			  "verified": true,
			  "share": 100
			}
		  ]
		}
	}
	
    it("mint", async() => {
		const uri = await uploadMetaDataToIPFS(data);
		console.log(uri);

		const metadata = {
			name: "Fox #6082",
			symbol: "FOX",
			uri: uri
		};
		console.log("Minting... ");
		
      	const tx = await program.methods
			.mint(
				metadata.name,
				metadata.symbol, 
				metadata.uri,
        	)
			.accounts({
				signer: signer.publicKey,
				mint: mint.publicKey,
				associatedTokenAccount,
				metadataAccount,
				masterEditionAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([mint])
			.rpc();

		console.log(
			`mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`
		);
		console.log(
			`minted nft: https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`
		);

		console.log(`
			MetadataUri: ${uri}
		`);
    });
});
