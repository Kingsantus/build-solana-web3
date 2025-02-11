"use client"

import { Keypair } from "@solana/web3.js"

export default function CreateWallet() {
    const create = Keypair.generate();

    return create;
}