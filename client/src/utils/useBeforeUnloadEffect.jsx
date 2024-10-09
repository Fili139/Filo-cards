import { useEffect } from 'react';

import { handleBeforeUnload } from './utils'

export const useBeforeUnloadEffect = () => {
    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
    
        return () => { window.removeEventListener("beforeunload", handleBeforeUnload) };
    }, []);
};