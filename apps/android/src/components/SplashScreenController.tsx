import useAppContext from '@/context/AppContext';
import { getAppData } from '@/api/services/app';
import { supabase } from '@/api/clients/supabase';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
import RootNavigator from './RootNavigator';


SplashScreen.setOptions({
    duration: 500,
    fade: true,
});

export default function SplashScreenController() {
    const [loading, setLoading] = useState(true);
    const { addSession, addAppData } = useAppContext();

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!error && session?.user) {
                    addSession(session.user);

                    // Let's find app data and add them into the state
                    const appData = await getAppData(session.user.id);

                    if (appData) {
                        addAppData(appData);
                    }
                } else {
                    addSession(null);
                }

            } catch (err) {
                const errMsg = err instanceof Error ? err?.message : "An error occurred during getting session.";

                ToastAndroid.show(errMsg, ToastAndroid.SHORT);
            } finally {
                setLoading(false);
            }
        }

        getSession();
    }, [addSession, addAppData])


    if (!loading) {
        SplashScreen.hideAsync()

        return (
            <RootNavigator />
        )
    }

    return null;
}