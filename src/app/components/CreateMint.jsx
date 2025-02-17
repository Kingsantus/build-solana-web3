"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useState } from "react";
import { toast } from "react-toastify";
import ExternalLinkIcon from "./externalLinkIcon";
import React from "react";


export default function CreateMint({ onMintCreated }) {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [mintTx, setMintTx] = useState("");
    const [mintAddress, setMintAddress] = useState(null);

    const connectionErr = () => {
        if (!publicKey || !connection) {
            toast.error("Please connect your wallet ");
            return true;
        }
        return false;
    };

    // what handles the process
    const createMint = async (e) => {
        e.preventDefault();
        if (connectionErr()) return;
        try {
            if (!publicKey) {
                console.error("Public key is null, Ensure wallet is connected");
                return;
            }
            const tokenMint = web3.Keypair.generate();
            const lamports = await token.getMinimumBalanceForRentExemptAccount(connection);
            const transaction = new web3.Transaction().add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: tokenMint.publicKey,
                    space: token.MINT_SIZE,
                    lamports,
                    programId: token.TOKEN_PROGRAM_ID,
                }),
                token.createInitializeMintInstruction(
                    tokenMint.publicKey,
                    6,
                    publicKey,
                    null,
                    token.TOKEN_PROGRAM_ID
                )
            );
            const signature = await sendTransaction(transaction, connection, {
                signers: [tokenMint],
            });

            setMintTx(signature);
            setMintAddress(tokenMint.publicKey);
            toast.success("Mint created successfully");
            onMintCreated(tokenMint.publicKey);
        } catch (err) {
            toast.error("Error creating Token Mint");
            console.error("Mint Error", err);
        }
    }

    const mintOutputs = [
        {
            title: "Token Mint Address:",
            dependency: mintAddress ? mintAddress.toBase58() : null,
            href: mintAddress ? `https://explorer.solana.com/address/${mintAddress.toBase58()}?cluster=devnet` : "",
        },
        {
            title: "Mint Transaction Signature:",
            dependency: mintTx,
            href: mintTx ? `https://explorer.solana.com/tx/${mintTx}?cluster=devnet` : "",
        },
    ];
    return (
        <div>
            <form className="bg-gray-500 p-6 rounded-lg shadow-lg" onSubmit={createMint}>
                <div className="flex justify-between item-center mb-4">
                <h2 className="font-bold text-2xl text-[#fa6ece]">Create Token Mint</h2>
                <button className="disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#00ffff]" type="submit" disabled={!publicKey || !connection} >Submit</button>
                </div>
                <div className="text-sm border font-semibold bg-[#222524] border-gray-500 rounded-lg p-2">
                    <ul className="space-y-2">
                        {mintOutputs.map(({ title, dependency, href}) => (
                            <li key={title} className="flex justify-between items-center">
                                <span className="tracking-wider">{title}</span>
                                {dependency && (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex text-[#80ebff] italic hover:text-white transition-all duration-200">
                                        {" "}
                                        {dependency.toString().slice(0, 25)}...
                                        <ExternalLinkIcon className="w-4 h-4 ml-1" />
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </form>
        </div>
    )
}