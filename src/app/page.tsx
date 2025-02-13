"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import CreateWallet from "./components/createWallet";
import bs58 from "bs58";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";


export default function Home() {
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const {publicKey} = useWallet();

  const wallet = () => {
    const create = CreateWallet();

    const addressu = create.publicKey.toString();
    console.log(addressu);
    setAddress(addressu);
    const privateKeyu = bs58.encode(create.secretKey)
    console.log(privateKeyu);
    setPrivateKey(privateKeyu);
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
  <div className="w-1/2 max-w-md bg-white shadow-lg rounded-lg p-6">
    {publicKey ? (
      <>
      <div className="flex flex-col gap-2">
      <WalletMultiButton />   
        {address && privateKey ? <>
          <p className="mt-2 break-words">Your New Address: {address}</p>
          <p className="mt-2 break-words">Your Private Key: {privateKey}</p>
          <span>Do not share your private key</span>
        </> : <>
        <button onClick={wallet} className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
          Create Wallet
        </button>
        </>}
        
      </div>
        
      </>
    ) : (
      <div className="flex justify-center">
        <WalletMultiButton />
      </div>
    )}
  </div>
</div>
  )
}