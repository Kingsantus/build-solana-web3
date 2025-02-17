"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useState } from "react";
import { toast } from "react-toastify";
import ExternalLinkIcon from "./externalLinkIcon";
import React from "react";

export default function MintToken({ mintAddr, accAddr }) {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [tokensToMint, setTokensToMint] = useState();
    const [mintTokenTxsig, setMintTokenTxsig] = useState("");

    const connectionErr = () => {
        if (!publicKey || !connection) {
            toast.error("Please connect your wallet");
            return true;
        }
        return false;
    }

    const handleMintTokens = async (e) => {
        e.preventDefault();
        if (connectionErr()) return;
        
        if (!mintAddr || !accAddr) {
            toast.error("Mint and Token account must be created first");
            return;
        }

        try {
            const transaction = new web3.Transaction();
            const mintTokenInstruction = token.createMintToInstruction(mintAddr, accAddr, publicKey, tokensToMint * 1e6);
            transaction.add(mintTokenInstruction);
            const signature = await sendTransaction(transaction, connection);
            setMintTokenTxsig(signature);
            toast.success("Tokens minted successfully!"); 
        } catch (error) {
            toast.error("Error minting tokens");
            console.log("Error minting tokens", error);
        }
    }
    return (
        <form action="" onSubmit={handleMintTokens} className="bg-gray-500 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between item-center mb-4">
                <h2 className="font-bold text-2xl text-[#fa6ece]">Mint Tokens</h2>
                <button className="disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#00ffff]" type="submit" disabled={!publicKey || !connection} >Mint</button>
                <div className="mb-4">
                    <label className="italic text-sm">Amount to Mint</label>
                    <input 
                    type="number"
                    placeholder="Number of tokens"
                    value={tokensToMint}
                    className="mt-1 text-[#222524] py-1 w-full bg-transparent outline-none border-b border-white"
                    onChange={(e) => setTokensToMint(Number(e.target.value))}
                    />
                </div>
                {mintTokenTxsig && (
                    <div className="text-sm font-semibold bg-[#222524] border border-gray-500">
                        <a href={`https://explorer.solana.com/tx/${mintTokenTxsig}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="flex">
                        {mintTokenTxsig.toString().slice(0, 25)}...
                        <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                )}
            </div>
        </form>
    )

}