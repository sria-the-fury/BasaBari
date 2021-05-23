import React, {useState, createContext, useContext, useRef, useEffect} from 'react';
import {FirebaseContext} from "./FirebaseContext";
import {AppState} from "react-native";


export const UserContext = createContext([{}, p => {}]);

export const UserProvider =  (props) => {
    const firebase = useContext(FirebaseContext);

    const currentUser = firebase.getCurrentUser();
    const appState = useRef(AppState.currentState);
    // const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        AppState.addEventListener("change", _handleAppStateChange);

        return () => {
            AppState.removeEventListener("change", _handleAppStateChange);
        };
    }, [appState]);

    // console.log('currentUserType=>', currentUserType);

    const _handleAppStateChange = async (nextAppState) => {

        appState.current = nextAppState;
        // setAppStateVisible(appState.current);
        console.log('appState.current =>', appState.current);
        if (appState.current !== 'background' && state.isLoggedIn) {
            console.log('appState.current in =>', appState.current);
            const userInfo = await firebase.getUserInfo(currentUser?.uid);
            if(userInfo) setState({...state, userType: userInfo.userType});
            await firebase.userOnlineStatus(currentUser?.uid, true);
        } else if(appState.current === 'background' && currentUser){
            await firebase.userOnlineStatus(currentUser?.uid, false);
            console.log('appState.current b=>', appState.current);
        }

    };

    const hasUserWithName = () => {
        if(currentUser?.uid && currentUser?.photoURL && currentUser?.displayName) return true;
        else if(currentUser?.uid && (!currentUser?.photoURL || !currentUser?.displayName)) return false;
        else return null;
    };


    const [state, setState] = useState({
        userType: null,
        isLoggedIn: hasUserWithName(),
        profilePhotoUrl: currentUser?.photoURL ?? null,
        userName: currentUser?.displayName ?? null,
        userPhoneNumber: currentUser?.phoneNumber ?? null

    });


    return (<UserContext.Provider value={[state, setState]}>{props.children}</UserContext.Provider>)
}
