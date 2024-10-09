import { useState } from "react";

export const useOfflineState = () => {
    
    const [botHand, setBotHand] = useState([]);

    return {
        botHand,
        setBotHand
    };
};