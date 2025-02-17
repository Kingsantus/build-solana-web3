"use client";

import React, { useState } from "react";
import CreateMint from "./CreateMint";
import CreateTokenAccount from "./CreateTokenAccount";
import MintToken from "./MintToken";

interface DashboardProps {
    mintAddr: string | null;
    setMintAddr: (addr: string | null) => void;
}

export default function Dashboard({ mintAddr, setMintAddr }: DashboardProps) {
    const [accAddr, setAccAddr] = useState(null);
    return (
        <main className="min-h-screen bg-gray-900 text-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"></div>
            <CreateMint onMintCreated={setMintAddr} />
            <br></br>
            <CreateTokenAccount mintAddr={mintAddr} onAccountCreated={setAccAddr} />
            <br></br>
            <MintToken mintAddr={mintAddr} accAddr={accAddr} />
            <div className="mt-8"></div>
        </main>
    )
}