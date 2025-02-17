"use client";

import React, { useState } from "react";
import Dashboard from "./Dashboard";

export default function ParentComponent() {
    const [mintAddr, setMintAddr] = useState(null);

    return <Dashboard mintAddr={mintAddr} setMintAddr={setMintAddr} />;
}