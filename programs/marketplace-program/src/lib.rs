use anchor_lang::prelude::*;

pub mod mint;
use mint::*;

declare_id!("2sNPYKAW9rBRiyS1NrDb7bNCd7Zao6CHAxY1zmcLSqbD");


#[program]
pub mod marketplace_program {
    use super::*;
    pub fn mint(
        ctx: Context<MintNft>, 
        metadata_title: String, 
        metadata_symbol: String, 
        metadata_uri: String,
    ) -> Result<()> {
        mint::mint(
            ctx,
            metadata_title,
            metadata_symbol,
            metadata_uri,
        )
    }
}
