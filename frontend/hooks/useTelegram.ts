import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegram() {
    const [user, setUser] = useState<any>(null);
    const [initData, setInitData] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
            setUser(WebApp.initDataUnsafe.user);
            setInitData(WebApp.initData);
            WebApp.ready();
            WebApp.expand();
        }
    }, []);

    return { user, initData, webApp: WebApp };
}
