import { useEffect, useState } from 'react';

export function useTelegram() {
    const [user, setUser] = useState<any>(null);
    const [initData, setInitData] = useState<string>('');
    const [webApp, setWebApp] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const app = (window as any).Telegram?.WebApp;
            if (app) {
                app.ready();
                app.expand();
                setWebApp(app);
                if (app.initDataUnsafe?.user) {
                    setUser(app.initDataUnsafe.user);
                    setInitData(app.initData);
                }
            }
        }
    }, []);

    return { user, initData, webApp };
}
