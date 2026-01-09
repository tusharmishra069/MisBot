import { useEffect, useState } from 'react';

export function useTelegram() {
    const [user, setUser] = useState<any>(null);
    const [initData, setInitData] = useState<string>('');
    const [webApp, setWebApp] = useState<any>(null);

    useEffect(() => {
        console.log('[Telegram] Hook initializing...');
        console.log('[Telegram] Window type:', typeof window);

        if (typeof window !== 'undefined') {
            console.log('[Telegram] Telegram object:', (window as any).Telegram);
            const app = (window as any).Telegram?.WebApp;

            if (app) {
                console.log('[Telegram] WebApp found!');
                console.log('[Telegram] initData:', app.initData);
                console.log('[Telegram] initData length:', app.initData?.length);
                console.log('[Telegram] initDataUnsafe:', app.initDataUnsafe);

                app.ready();
                app.expand();
                setWebApp(app);

                // Always set initData if it exists, regardless of user object
                if (app.initData) {
                    console.log('[Telegram] ✅ Setting initData');
                    setInitData(app.initData);
                } else {
                    console.warn('[Telegram] ❌ No initData available');
                }

                if (app.initDataUnsafe?.user) {
                    console.log('[Telegram] ✅ User object found:', app.initDataUnsafe.user);
                    setUser(app.initDataUnsafe.user);
                } else {
                    console.warn('[Telegram] ⚠️ No user object in initDataUnsafe');
                }
            } else {
                console.error('[Telegram] ❌ WebApp not found! Not running in Telegram?');
            }
        }
    }, []);

    console.log('[Telegram] Current state - initData:', initData ? 'SET' : 'EMPTY', 'user:', user ? 'SET' : 'NULL');
    return { user, initData, webApp };
}
