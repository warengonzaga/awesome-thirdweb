import { MagicConnector } from "@thirdweb-dev/react/dist/declarations/src/evm/connectors/magic";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function generateMintSignature(
  req: NextApiRequest,
  res: NextApiResponse
  ) {
  // De-construct body from request
  // same for mintQuantity we added
  const { address } = JSON.parse(req.body);
  const { mintQuantity } = JSON.parse(req.body);

  // Get the Early Access NFT Edition Drop contract
  // key blockchain as argument
  // better variable name should be goerlySDKOne because of line 37..
  // getContract argument is your key contract's address
  const polygonSDK = new ThirdwebSDK("goerli");                
  const earlyAccessNfts = await polygonSDK.getContract(
    "0x722EC5d7b9cE6Efc5f627dA9C55fdD86b40D8Ddd",
    'edition-drop'
  );            

  // Check to see if the wallet address has an early access NFT
  const numTokensInCollection = await earlyAccessNfts.getTotalCount();
  let userHasToken = false;
  // Check each token in the Edition Drop
  for (let i = 0; i < numTokensInCollection.toNumber(); i++) {
    // See if they have the token
    const balance = await earlyAccessNfts.balanceOf(address, i);
    if (balance.toNumber() > 0) {
      userHasToken = true;
      break;
    }
  }

  // Now use the SDK on Goerli to get the signature drop
  const goerliSDK = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY as string,
    "goerli"
  );
  const signatureDrop = await goerliSDK.getContract(
    "0x96262268e1725D35771BA70dab8f75dE2B6FDa31",
    'signature-drop'
  );    // my signature drop address - wotify

  // If the user has an early access NFT, generate a mint signature
  if (userHasToken) {
    const mintSignature = await signatureDrop.signature.generate({
      to: address, // Can only be minted by the address we checked earlier
      price: "0.0005", // Free or less then original price set in the dashboard-claim phase
      mintStartTime: new Date(0), // now
      quantity: mintQuantity, // embeding my quantity in signature
    });

    res.status(200).json(mintSignature);
  } else {
    res.status(400).json({
      message: "User don't have Wotify Premium Key.",
    }); // my no-key-wallet message - deprecated - not showing
  }
}
