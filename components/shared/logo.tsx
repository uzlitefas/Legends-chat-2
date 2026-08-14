"use client";

import Image from 'next/image';
import { useState } from 'react';

type LogoType = {
    loaded: boolean;
};

export default function Logo() {
    const [loaded, setLoaded] = useState(false);

    return (
        <div 
            className={`relative gap-2 flex items-center justify-center p-2 transition-all duration-1000 ease-out ${
                loaded
                    ? "opacity-100 -translate-x-0"
                    : "opacity-0 translate-x-30"
            }`}
        >
            <div className="relative w-10 h-10 drop-shadow-md">
                <Image
                    src="/shared/lc-logo.png"
                    alt="Legends-chat Logo"
                    fill
                    onLoad={() => setLoaded(true)}
                    className="object-contain rounded-xl"
                    priority
                />
            </div>
            <div>
                <h1 className="text-orange-500 font-extrabold tracking-wider drop-shadow-md">
                    Legends Chat
                </h1>
            </div>
        </div>
    );
}