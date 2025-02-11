"use client";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
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
    <main className="flex items-center flex-col gap-8 justify-center min-h-screen">
      <div className="border hover::border-slate-900 rounded flex flex-col gap-8">
        <WalletMultiButton style={{}} />
      
        <WalletDisconnectButton style={{}} />
      </div>
      {publicKey ? <>
        <button onClick={wallet} className="bg-blue-500 py-6">Create Wallet</button>
        <p>{address}</p>
        <br />
        <p>{privateKey}</p>
      </> : <p>Create Wallet!</p>}
      
    </main>
  )
}