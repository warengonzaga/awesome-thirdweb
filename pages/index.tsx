import { useAddress, useContract, Web3Button, useClaimedNFTSupply, useUnclaimedNFTSupply, ThirdwebNftMedia, useContractMetadata, useNFTs } from "@thirdweb-dev/react";
import { ClaimCondition, ClaimOptions, SignedPayload721WithQuantitySignature } from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useState, useEffect, useRef } from "react";
import { type } from "os";
import { id, _toEscapedUtf8String } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { HexColor } from "@thirdweb-dev/sdk/dist/declarations/src/core/schema/shared";

const signatureDropAddress = "0x96262268e1725D35771BA70dab8f75dE2B6FDa31";  {/*your new signature-drop contract address*/}

const Home: NextPage = () => {

  const address = useAddress();


  {/*connection with your signature-drop contract*/}
  const { contract: signatureDrop } = useContract(
    signatureDropAddress,
    "signature-drop"
  );


  //  conecting to NFTs - use this to display contract's metadata and your nfts
  const{data: nfts, isLoading} = useNFTs(signatureDrop);
  const{data: metadata, isLoading: loadingMetadata} = useContractMetadata(signatureDrop);


  //  hook for alerts DApp displays to the users..next to the blinking triangle
  //  located in both claim functions and increaseMintQuantity/decreaseMintQuantity...
  //  rendered in the --- return --- user alerts-messages display
  const[userAlert, setAlert] = useState('WALLET CONNECTED!..READY TO MINT 1 TANK..');


  //  hook for DApp sounds toggle
  //  initial variable state is true
  //  state toggles on soundButton click via changeValueForSoundHook function
  //  if statements in mint functions and qt functions are toggling sound on and off
  const[isSoundOn, setSound] = useState(true);

  //  initial state is "ON" for the state of the sound analogue with the hook above
  //  sound buttons are calling the changeValueForSoundHook func
  //  inside that func setWord conditionally changes between "ON" and "OFF"
  const[onOrOffWord, setWord] = useState("ON");


   //  Loader for claimed supply and unclaimed supply from your signature-drop contract
  const { data: unclaimedSupply } = useUnclaimedNFTSupply(signatureDrop);
  const { data: claimedSupply } = useClaimedNFTSupply(signatureDrop);


  //  useEffect for minted event - top card -images are blinking - trigger is new mint < = > unlaimedSupply change
  //  original animate arg ([{opacity: 0}, {opacity: 1}, {opacity: 0}], {duration: 4000, iterations: 3 })
    useEffect(() => {
      setTimeout(() => {
        document.getElementById("card1")?.animate([{opacity: 0.2}, {opacity: 1}], {duration: 1500, iterations: 6 });
        document.getElementById("card2")?.animate([{opacity: 0.2}, {opacity: 1}], {duration: 1500, iterations: 6 }); 
      }, 3000);
    }, [claimedSupply?.toNumber()])


    //  hook for css 4 dots at the page bottom animation..triggers only once at DApp mount
    useEffect(() => {
      document.getElementById("dot1")?.animate([{opacity: 1}, {opacity: 0.1}], {duration: 4000, iterations: Infinity });
      setTimeout(() => {
        document.getElementById("dot2")?.animate([{opacity: 1}, {opacity: 0.1}], {duration: 4000, iterations: Infinity });
        setTimeout(() => {
          document.getElementById("dot3")?.animate([{opacity: 1}, {opacity: 0.1}], {duration: 4000, iterations: Infinity });
          setTimeout(() => {
            document.getElementById("dot4")?.animate([{opacity: 1}, {opacity: 0.1}], {duration: 4000, iterations: Infinity });
          }, 1000)
        }, 1000)
      }, 1000)
    },[])

    //  fade-in effect for quantity buttons block - trigger is address state/change
    useEffect(() => { 
        document.getElementById("quantityAddressTrue")?.animate([{opacity: 0}, {opacity: 1}], {duration: 6000, iterations: 1 });
        document.getElementById("quantityAddressFalse")?.animate([{opacity: 0}, {opacity: 1}], {duration: 6000, iterations: 1 });
        document.getElementById("soundControl")?.animate([{opacity: 0}, {opacity: 1}], {duration: 6000, iterations: 1 });
        document.getElementById("soundControlNoAddress")?.animate([{opacity: 0}, {opacity: 1}], {duration: 6000, iterations: 1    
        });
    },[address])


  //  old code for accessing user input for mint quantity
  {/*
  var finalMintQuantity : number = 0;
  function changeMintQuantity(){
    const userInput = document.getElementById("userInput") as HTMLInputElement | null;
    if ((userInput != null)){
      finalMintQuantity = Number(userInput.value);
      console.log("changed to " + finalMintQuantity);
      setAlert(`Success!...ready.to.mint_${finalMintQuantity}_tanks(s)...`);
    }else{
      console.log(finalMintQuantity);
      setAlert(`oops!...browser.glitch...please.choose.again...`);
      return; 
    }
  }
*/}


 //  variable mintQuantity - will hold user input for quantity - default value == 1
  const[mintQuantity , editMintQuantity] = useState(1);


  //  deprecated function for setting up mintQuantity
  function setMintQuantity(){
    const userInput = document.getElementById("userInput") as HTMLInputElement | null;
    if(userInput == null){
      setAlert(`oops!...browser.glitch...please.choose.again...`);
      return;
    }else{
      let tempVar : number = Number(userInput.value);
      if((Number.isInteger(tempVar)) && (0 < tempVar) && (tempVar <= 5)){
        editMintQuantity(tempVar);
        console.log("quantity is now: " + mintQuantity);
        setAlert(`all.good!...quantity.set.to.${tempVar}...ready.to.mint.some.tanks...pick.one.mint.button...`);
      }else{
        setAlert(`oops!...can't.mint.${tempVar}.tank(s)...pick.a.whole.number.between.0.and.6...`);
        editMintQuantity(0);
        return;
      }
    }
  }


  //  reset mintQuantity to 0 - deprecated
  function resetMintQuantity(){
    editMintQuantity(0);
    setAlert(`reset.done!...quantity.set.to.0...pick.a.new.whole.number.between.0.and.6...`);
  }

 
  //  called with the + button - if condition 5 because max mint qt you allow is 5 per txn
  //  5 matches with 5 per txn in drop claim conditions set through thirdweb dashboard
  function increaseMintQuantity(){
    if(isSoundOn){
    const shutterSound = new Audio("/finger.wav");
    shutterSound.play();
    }
    if(mintQuantity < 5){
      let plusVar : number = mintQuantity;
      plusVar = plusVar + 1;
      editMintQuantity(plusVar);
      setAlert(`READY TO MINT ${plusVar} TANKS..PICK ONE MINT BUTTON..`);
    }else{
      setAlert("MAX QUANTITY PER TRANSACTION IS 5..READY TO MINT 5 TANKS..");
      return;
    }
  }


  //  called with the minus button - in if > 1 to avoid setting qt to 0
  function decreaseMintQuantity(){
    if(isSoundOn){
    const shutterSoundDec = new Audio("/finger.wav");
    shutterSoundDec.play();
    }
    if(mintQuantity > 1){
      let minusVar : number = mintQuantity;
      minusVar = minusVar - 1;
      editMintQuantity(minusVar);
      setAlert(`READY TO MINT ${minusVar} TANK(S)..PICK ONE MINT BUTTON..`);
    }else{
      setAlert("MIN QUANTITY PER TRANSACTION IS 1..READY TO MINT 1 TANK..");
      return;
    }
  }


  //  deprecated - on address disconect resets mintQuantity and userAlert
  function resetQtAndAlert(){
    editMintQuantity(1);
    setAlert('wallet.connected...ready.to.mint.1.Tank...reset.quantity.or.pick.one.mint.button...');
    return;
  }


  //  standard claim function - uses parameters set in the thirdweb dashboard/contract/claim conditions
  //  we are passing the mint quantity set by the user as mintQuantity variable
  async function claim() {

    //  grabs the sound from the public folder and plays it
    //  if condition is true else no sound is played
    //  same logic in all places where sound should be played in qty and mint functions
    if(isSoundOn){
    const claimSound = new Audio("/finger.wav");
    claimSound.play();
    }

    //  disable quantity buttons while claiming/minting NFTs
    document.getElementById("minusButton")?.setAttribute("disabled", "");
    document.getElementById("plusButton")?.setAttribute("disabled", "");

    try {
      //  below, input/hardcode price from claim Conditions/thirdweb dashboard and chain currencu..ETH..MATIC..etc..
      setAlert(`MINTING ${mintQuantity} TANK(S) FOR ${(0.001*mintQuantity).toFixed(4)} ETH..PLEASE WAIT..`);
      const tx = await signatureDrop?.claim(mintQuantity);
      setAlert(`SUCCESS!..${mintQuantity} WOTIFY TANK(S) MINTED!`);
      editMintQuantity(1);
      //  display OpenSea info -- where to find newly minted NFTs
      setTimeout(() => {
        setAlert("VIEW NEW TANKS ON OPENSEA..LOG IN WITH SAME ADDRESS..");
      },8000);

      if(isSoundOn){
      const endClaimSound = new Audio("/spaceship.wav");
      endClaimSound.play();
      }

      document.getElementById("minusButton")?.removeAttribute("disabled");
      document.getElementById("plusButton")?.removeAttribute("disabled");
            
    } catch (error: any) {
      console.log(error?.message);
      setAlert(`FAILED TXN!..REJECTED BY USER, SHORT FUNDS, SOLD OUT..RETRY?`);
      if(isSoundOn){
      const endClaimSound2 = new Audio("/fail.wav");
      endClaimSound2.play();
      }

      document.getElementById("minusButton")?.removeAttribute("disabled");
      document.getElementById("plusButton")?.removeAttribute("disabled");
    }
  }


  //  claim with signature
  //  makes an API call to /api/generate-mint-signature and checks if user/wallet has an NFT from specified collection
  //  if user has NFT generates signature for minting with mintQuantity and price we define in the API
  //  else returns alert - key not found at user alerts.. - and exits
  async function claimWithSignature() {

    document.getElementById("minusButton")?.setAttribute("disabled", "");
    document.getElementById("plusButton")?.setAttribute("disabled", "");

    if(isSoundOn){
    const claimSoundSig = new Audio("/finger.wav");
    claimSoundSig.play();
    }
    setAlert(`PREMIUM KEY CHECK..`);
   
    const signedPayloadReq = await fetch(`/api/generate-mint-signature`, {
      method: "POST",
      body: JSON.stringify({
        address: address, mintQuantity: mintQuantity,
      }),
    });       {/*added mintQuantity to request - passing mintQuantity with user address to API*/}

    console.log(signedPayloadReq);

    if (signedPayloadReq.status === 400) {
      setAlert('KEY NOT FOUND!..USE REGULAR MINT OR MINT THE KEY FIRST..');
      if(isSoundOn){
      const endClaimSoundSig2 = new Audio("/fail.wav");
      endClaimSoundSig2.play();
      }

      document.getElementById("minusButton")?.removeAttribute("disabled");
      document.getElementById("plusButton")?.removeAttribute("disabled");

      return;
    } else {
      try {
        if(isSoundOn){
        const keyFoundSound = new Audio("/key.wav");
        keyFoundSound.play();
        }
        setAlert(`KEY FOUND!..MINTING ${mintQuantity} TANK(S) FOR ${(0.0005*mintQuantity).toFixed(4)} ETH..PLEASE WAIT..`);
        const signedPayload =
          (await signedPayloadReq.json()) as SignedPayload721WithQuantitySignature;

        console.log(signedPayload);

        const nft = await signatureDrop?.signature.mint(signedPayload);

        setAlert(`SUCCESS!..${mintQuantity} WOTIFY TANK(S) MINTED WITH DISCOUNT!`);
        editMintQuantity(1);
        //  display OpenSea info -- where to find new NFTs
        setTimeout(() => {
          setAlert("VIEW NEW TANKS ON OPENSEA..LOG IN WITH SAME ADDRESS..");
        },8000);

        if(isSoundOn){
        const endClaimSoundSig = new Audio("/spaceship.wav");
        endClaimSoundSig.play();
        }

       document.getElementById("minusButton")?.removeAttribute("disabled");
       document.getElementById("plusButton")?.removeAttribute("disabled");
        
      } catch (error: any) {
        console.log(error?.message);
        setAlert(`FAILED TXN!..REJECTED BY USER, SHORT FUNDS, SOLD OUT..RETRY?`);
        if(isSoundOn){
        const endClaimSoundSig3 = new Audio("/fail.wav");
        endClaimSoundSig3.play();
        }

        document.getElementById("minusButton")?.removeAttribute("disabled");
        document.getElementById("plusButton")?.removeAttribute("disabled");
      }
    }
  
  }


  //  toggles sound on the soundButton click
  //  toggles isSoundOn var between true aand false
  //  side effect -- sets "ON" or "OFF" for rendering inside the sound control div
  function changeValueForSoundHook(){
    const claimSoundToggler = new Audio("/finger.wav");
    claimSoundToggler.play();
    setSound(!isSoundOn)
    
    document.getElementById("soundText1")?.animate([{opacity: 0}, {opacity: 1}], {duration: 600, iterations: 3 });
    document.getElementById("soundText2")?.animate([{opacity: 0}, {opacity: 1}], {duration: 600, iterations: 3 }); 
    
    if(!isSoundOn){
      setWord("ON");
    }else{
      setWord("OFF");
    }
    return;
  }


  {/*...........MINTER............*/}

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>Wotify Minting DApp</h1>    {/*title*/}
      {/*description*/}
      <p className={styles.describe}>     
        <b>Wotify Premium Key</b> is a free-to-mint community and benefits key that gives you a 50% minting discount for  Wotify 
         collection and more benefits and discounts in future collections.{" "}
        <a href="https://linktr.ee/wotify_nfts" target="_blank" rel="noreferrer">Mint the Key</a>{" "}first or mint a 
         Tank using the regular mint button.
      </p>


      {/*new - metadata and nfts - display drop logo example*/}
      {/*<img src={metadata?.image} width="20" />*/}


      {/*sound buttons/box/block - toggles DApp sounds on and off*/}
      {
      address?(
      <div className={styles.soundControl} id="soundControl">
      <span className={styles.soundBoxText} id="soundText1">{onOrOffWord}{" "}🎧</span>
      <button className={styles.soundButton} onClick={() => changeValueForSoundHook()} id="soundButton">⬤</button>
      <span className={styles.soundBoxText} id="soundText2">🎧{" "}{onOrOffWord}</span>
      </div>):(
        <div id="soundControlNoAddress">
          <span className={styles.soundBoxWelcome}>COMING ★ SOON</span>
          {/*<img src={metadata?.image} alt="collection logo image/gif" width={15}></img>  --  collection logo*/}
        </div>
      )
      }
      

    {/*walllet address, messages to the user and claimed so far aka contract metadata*/}
    <div className={styles.contractAndAppData}>
      {/*if user connected show address - otherwise show message*/}
        {
          address?(
            <code>CONNECTED WALLET : {address}</code>
          ):(
            <code>CONNECTED WALLET : WAITING..CONNECT YOUR WALLET..</code>
          )
        }
      
      {/*user alerts-messages display*/}
      {/*if there is address display messages, if not render welcome message*/}
      <div>
      {
        address?(
            <p><span className={styles.blinker}>▶</span><code>{userAlert}</code></p>
        ):(
            <p><span className={styles.blinker}>▶</span><code>WELCOME!..CONNECT YOUR WALLET TO START MINTING..</code></p>
        )
      }     
      </div>

      {/*my version of "claimed so far" */}
      {/*if there is metadata show data else show loading metadata message*/}   
        {
          claimedSupply && unclaimedSupply ? (
              <code>
              TANKS MINTED SO FAR :<span className={styles.claimedSoFarNumber}>{" "}{claimedSupply.toNumber()}{" | "} 
              {claimedSupply.toNumber() + unclaimedSupply.toNumber()}</span>
              </code>
          ):(
              <code>
              TANKS MINTED SO FAR :<span className={styles.claimedSoFarNumber}>{" "}LOADING CONTRACT DATA..</span>
              </code>
          )
        }
    </div>

   
      {/*input box -- deprecated version of quantity box with input field
      {
      address?(
      <div className={styles.quantityContainer}>
      <label><code>enter mint quantity:</code></label>
      <br/><br/>
      <button className={styles.mainButton} type="submit" onClick={() => setMintQuantity()}>S</button>
      <input id="userInput" type="number" name="userInput" min="1" max="5" autoFocus/>
      <button className={styles.mainButton} type="reset" onClick={() => resetMintQuantity()}>R</button>
      </div>
      ):(<div className={styles.quantityContainerNoAddress}>
        <code>...waiting for the wallet address to load the <b>MINT QUANTITY SECTION</b>...</code>

      </div>)}*/}


      {/*set mint quantity box - new version*/}
      {/*cleaner because user do not type anything*/}
      {/*if address show whole and functional block - if not disable both buttons*/}
      {
      address?(
      <div className={styles.quantityContainer} id="quantityAddressTrue">
        <span className={styles.quantityBoxText}>QUANTITY</span>
        <button className={styles.mainButton} onClick={() => decreaseMintQuantity()} id="minusButton">-</button>
        <span className={styles.quantityNumber}>{mintQuantity}</span>
        <button className={styles.mainButton} onClick={() => increaseMintQuantity()} id="plusButton">+</button>
        <span className={styles.quantityBoxText}>QUANTITY</span>
      </div>):(
        <div className={styles.quantityContainer} id="quantityAddressFalse">
        <span className={styles.quantityBoxText}>OFF</span>
        <button className={styles.mainButton} disabled>-</button>
        <span className={styles.quantityNumber}>Qty</span>
        <button className={styles.mainButton} disabled>+</button>
        <span className={styles.quantityBoxText}>OFF</span>
      </div>
      )
      } 


      {/*first mint card/box - standard mint*/}
      <div className={styles.nftBoxGrid}>
        <div className={styles.optionSelectBox}>
          <img src={`/blue_tank.png`} alt="wotify tank" className={styles.cardImg}/>
          
          {/*title or sold out state if claimedSupply.toNumber() == 0*/}
          {
            unclaimedSupply?.toNumber() == 0?(
              <p className={styles.soldOutText}>SOLD OUT ▶ BUY A TANK ON <a href="https://opensea.io/Wotify-NFTs" className= 
               {styles.linkBelowButton} target="_blank" rel="noreferrer">OPENSEA</a></p>
            ):(
              <h2 className={styles.selectBoxTitle}>Mint</h2>
            )
          }

          {/*new mint detector*/}
          {/*blinks after useEffect detects change of the claimedSupply variable*/}
          <p className={styles.mintDetectorText}>
            new mint
            <img src="/blue_bulb3.png" alt="blue light bilb" width={28} id="card1" className={styles.mintAlertImage}></img>
            detector
          </p>
          
          <p className={styles.selectBoxDescription}>
             Tank price 0.05 ETH | 5 Tanks per transaction | unlimited Tanks per address | max supply 30k | Ethereum
          </p>

          <Web3Button
            contractAddress={signatureDropAddress}
            action={() => claim()}
            colorMode="light"
          >
            MINT
          </Web3Button>

          {/*if uclaimedSupply == 0 show "sold out" text*/}
          {
            unclaimedSupply?.toNumber() == 0?(
              <p className={styles.soldOutText}>SOLD OUT ▶ BUY A TANK ON <a href="https://opensea.io/Wotify-NFTs" className= 
               {styles.linkBelowButton} target="_blank" rel="noreferrer">OPENSEA</a>
              </p>
            ):(
              <p className={styles.priceBelowButton}>
                Total mint amount : {(mintQuantity * 0.001).toFixed(4)} ETH + fee 
              </p>
            )
          } 
        </div>

        {/*second mint card/box - mint with signature*/}
        <div className={styles.optionSelectBox}>
          <img
            src={`/blue_tank_wkey.png`}
            alt="signature-mint"
            className={styles.cardImg}
          />

          {/*title or sold out state if claimedSupply.toNumber() == 0*/}
          {
            unclaimedSupply?.toNumber() == 0?(
              <p className={styles.soldOutText}>SOLD OUT ▶ BUY A TANK ON <a href="https://opensea.io/Wotify-NFTs" className= 
               {styles.linkBelowButton} target="_blank" rel="noreferrer">OPENSEA</a>
              </p>
            ):(
              <h2 className={styles.selectBoxTitle}>Mint With Key</h2>
            )
          }

          {/*new mint detector*/}
          <p className={styles.mintDetectorText}>
            new mint
            <img src="/blue_bulb3.png" alt="blue light bulb" width={28} id="card2" className={styles.mintAlertImage} ></img>
            detector
          </p>
      
          <p className={styles.selectBoxDescription}>
          <b>- 50%</b> | Tank price 0.025 ETH | 5 Tanks per transaction | unlimited Tanks per address | max supply 30k | Ethereum
          </p>

          <Web3Button
            contractAddress={signatureDropAddress}
            action={() => claimWithSignature()}
            colorMode="light"
          >
            MINT WITH KEY
          </Web3Button>

          {/*if uclaimedSupply == 0 show "sold out" text*/}
          {
            unclaimedSupply?.toNumber() == 0?(
              <p className={styles.soldOutText}>SOLD OUT ▶ BUY A TANK ON <a href="https://opensea.io/Wotify-NFTs" className= 
               {styles.linkBelowButton} target="_blank" rel="noreferrer">OPENSEA</a>
              </p>
            ):(
              <p className={styles.priceBelowButton}>
                Total mint amount : {(mintQuantity * 0.0005).toFixed(4)} ETH + fee 
              </p>
            )
          }         
        </div>
      </div>
      
      
      {/*thirdweb link and small css animation - 4 blinking dots*/}
      <p className={styles.thirdwebLink}>
        powered by <a href="https://thirdweb.com/" target="_blank" rel="noreferrer">thirdweb</a><br/><br/>
        <span className={styles.dot1} id="dot1"></span>
        <span className={styles.dot2} id="dot2"></span>
        <span className={styles.dot3} id="dot3"></span>
        <span className={styles.dot4} id="dot4"></span>
      </p>

    </div>
  );
};

export default Home;
