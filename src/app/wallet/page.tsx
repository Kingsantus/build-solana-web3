"use client";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react"

const connection = new Connection("https://api.devnet.solana.com");

export default function Checker() {
    const [isLoading, setIsLoading] = useState(false);
    const { publicKey, sendTransaction} = useWallet();
    const [tokens, setTokens] = useState<{ mint: string; balance: string }[]>([]);
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [solBalance, setSolBalance] = useState(0);

    useEffect(() => {
        const get = async () => {
            try {
                await getSolBalance();
                await getSPLToken();
            } catch (error) {
                console.error("Error fetching balances:", error);
            }
        }
        get();
    }, [publicKey]);

    const getSolBalance = async () => {
        if (!publicKey) return;

        const balance = await connection.getBalance(publicKey);
        if (balance) {
            setSolBalance(balance / LAMPORTS_PER_SOL);
        }
    }

    const solAirdrop = async () => {
        if (!publicKey) return;
        const signature = await connection.requestAirdrop(publicKey,LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
        });
        alert(`Airdrop confirmed ${signature}`);
    }

    const sendSol = async () => {
        if (!publicKey) return;

        try {
        
        setIsLoading(true);

    
        const recipientPubKey = new PublicKey(recipientAddress);
    
        const tx = new Transaction();
    
        tx.add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: +amount * 1e9,
            })
        );
    
        tx.feePayer = publicKey;
    
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        
        tx.recentBlockhash = blockhash;

        const signature = await sendTransaction(tx, connection);

        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
        });

        alert(`Transaction confirmed: ${signature}`);
        } catch (err) {
            alert(`Error: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getSPLToken = async () => {
        if (!publicKey) return;
    
        const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID
        });

        const tokens = await Promise.all(userTokenAccounts.value.map((account) => {
            const token = account.account.data.parsed.info;
            return {
                mint: token.mint,
                balance: token.tokenAmount.uiAmountString,
            }
        }))

        setTokens(tokens);
    };

    const sendSPL = async (mint: string) => {
        if (!publicKey) return;

        try {
        
        setIsLoading(true);

    
        const recipientPubKey = new PublicKey(recipientAddress);
    
        const tx = new Transaction();
        const mintPubKey = new PublicKey(mint);

        const userTokenAccount = await getAssociatedTokenAddress(mintPubKey, publicKey);

        const toTokenAccount = await getAssociatedTokenAddress(mintPubKey, recipientPubKey);

        const checkATA = await connection.getAccountInfo(toTokenAccount);

        if (!checkATA) {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    toTokenAccount,
                    recipientPubKey,
                    mintPubKey,
                )
            )
        }

        const decimalNum = await getTokenDecimals(mintPubKey);

        const amountBigInt = Math.pow(+amount, decimalNum)

    
        tx.add(
            createTransferInstruction(
                userTokenAccount,
                toTokenAccount,
                publicKey,
                amountBigInt,
            ),
        );
    
        tx.feePayer = publicKey;
    
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        
        tx.recentBlockhash = blockhash;

        const signature = await sendTransaction(tx, connection);

        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
        });

        alert(`Transaction confirmed: ${signature}`);
        } catch (err) {
            alert(`Error: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getTokenDecimals = async (mint: PublicKey) => {
        const info = await connection.getParsedAccountInfo(mint);

        if (!info.value) {
            throw Error("Failed to fetch Decimal");
        }

        return (info.value.data as ParsedAccountData).parsed.info.decimal
    }
    

    return (
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl mb-4 font-bold">Solana Wallet</h1>
                <WalletMultiButton className="text-white bg-blue-500 font-bold py-2 px-4 rounded hover:bg-blue-700" />
                {publicKey && (
                    <div className="mt-4">
                        <p className="text-gray-700">
                            Connected Wallet: {publicKey.toBase58()}
                        </p>
                        <button onClick={solAirdrop} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
                            Sol Airdrop
                        </button>
                        <h2 className="text-xl font-bold mt-4">Your Token</h2>
                        <ul className="mt-2">
                            <li className="text-green-700">
                                Solana (SOL): {solBalance}
                                {selectedToken === "SOL" ? (
                                    <div className="mt-2 flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Recipient Address"
                                        className="border rounded px-2 py-1 mr-2 border-gray-300 w-60"
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Amount"
                                        className="border rounded px-2 py-1 mr-2 border-gray-300 w-24"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <button
                                        onClick={sendSol}
                                        disabled={isLoading || !recipientAddress || !amount}
                                        className={`font-bold py-1 px-2 rounded text-white ${
                                            isLoading || !recipientAddress || !amount
                                                ? "bg-green-300 cursor-not-allowed"
                                                : "bg-green-500 hover:bg-green-700"
                                        }`}
                                    >
                                        Confirm Send
                                    </button>
                                    <button
                                        className={`ml-2 font-bold py-1 px-2 rounded text-white ${
                                            isLoading ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-700"
                                        }`}
                                        disabled={isLoading}
                                        onClick={() => setSelectedToken(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                
                                ): (
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2 item-end" onClick={() => setSelectedToken("SOL")}>Send</button>
                                )}
                            </li>
                            {tokens.map((token, index) => (
                                <li key={index} className="text-gray-700">
                                    {token.mint}, Balance: {token.balance}

                                    {selectedToken === token.mint ? (
                                        <div className="mt-2">
                                            <input
                                            type="text"
                                            placeholder="Recipient Address"
                                            className="border rounded px-2 py-1 mr-2 border-gray-300"
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)} />
                                            <input
                                            type="text"
                                            placeholder="Amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="border rounded px-2 py-1 mr-2 border-gray-300" />
                                            <button onClick={() => sendSPL(token.mint)} className="bg-green-500 hover:bg-green-700 font-bold py-1 px-2 rounded text-white">Confirm Send</button>
                                            <button onClick={() => setSelectedToken(null)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">Cancel</button>
                                        </div>
                                    ) : (
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2 item-end" onClick={() => setSelectedToken(token.mint)}>Send</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}