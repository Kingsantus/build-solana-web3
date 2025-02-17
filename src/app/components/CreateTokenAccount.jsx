"use client";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ExternalLinkIcon from "./externalLinkIcon";
import React from "react";


export default function CreateTokenAccount({ mintAddr, onAccountCreated }) {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [accTx, setAccTx] = useState("");
    const [accAddr, setAccAddr] = useState(null);

    const connectionErr = () => {
        if (!publicKey || !connection) {
            toast.error("Please connect your wallet");
            return true;
        }
        return false;
    }

    const createAccount = async (e) => {
        e.preventDefault();
        if (connectionErr()) return;
        
        if (!mintAddr) {
            toast.error("Please create a mint first");
            console.log("no token")
            return;
        }
        try {
            if (!publicKey) {
                console.error("Public Key is null, Ensure wallet is connected.");
                return;
            }

            const tokenAccount = web3.Keypair.generate();
            const space = token.ACCOUNT_SIZE;
            const lamports = await connection.getMinimumBalanceForRentExemption(space);
            const transaction = new web3.Transaction().add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: tokenAccount.publicKey,
                    space,
                    lamports,
                    programId: token.TOKEN_PROGRAM_ID,
                }),
                token.createInitializeAccountInstruction(
                    tokenAccount.publicKey,
                    mintAddr,
                    publicKey,
                    token.TOKEN_PROGRAM_ID
                )
            );
            const signature = await sendTransaction(transaction, connection, {
                signers: [tokenAccount],
            });
            setAccTx(signature);
            setAccAddr(tokenAccount.publicKey);
            toast.success("Token Account created successfully!");
            onAccountCreated(tokenAccount.publicKey);
        } catch (error) {
            toast.error("Error creating Token Account");
            console.error("Account creation error", error);
        }
    } ;

    const accOutputs = [
        {
            title: "Token Account Address:",
            dependency: accAddr,
            href: accAddr ? `https://explorer.solana.com/address/${accAddr.toBase58()}?cluster=devnet` : "",
        },
        {
            title: "Account Transaction Signature:",
            dependency: accTx,
            href: accTx ? `https://explorer.solana.com/tx/${accTx}?cluster=devnet` : "",
        },
    ];
    return (
        <form action="" onSubmit={createAccount} className="bg-gray-500 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between item-center mb-4">
                <h2 className="font-bold text-2xl text-[#fa6ece]">Create Token Account</h2>
                <button className="disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#00ffff]" type="submit" disabled={!publicKey || !connection} >Submit</button>
                </div>
                <div className="text-sm border font-semibold bg-[#222524] border-gray-500 rounded-lg p-2">
                    <ul className="space-y-2">
                        {accOutputs.map(({ title, dependency, href}) => (
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
    )
}