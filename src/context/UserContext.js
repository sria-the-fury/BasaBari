import React, {useState, createContext, useContext, useRef, useEffect} from 'react';
import {FirebaseContext} from "./FirebaseContext";
import {AppState} from "react-native";
import firestore from "@react-native-firebase/firestore";


export const UserContext = createContext([{}, p => {}]);

export const UserProvider =  (props) => {
    const firebase = useContext(FirebaseContext);

    const currentUser = firebase.getCurrentUser();

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const [currentUserType, setCurrentUserType] = useState(null);

    useEffect(() => {
        AppState.addEventListener("change", _handleAppStateChange);

        return () => {
            AppState.removeEventListener("change", _handleAppStateChange);
        };
    }, [appState]);

    // console.log('currentUserType=>', currentUserType);

    const _handleAppStateChange = async (nextAppState) => {
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        if (appState.current === 'active' && state.isLoggedIn) {
            const userInfo = await firebase.getUserInfo(currentUser.uid);
            if(userInfo) {
                setState({...state, userType: userInfo.userType});
                setCurrentUserType(state.userType)
            }
            await firebase.userOnlineStatus(currentUser?.uid, true);
        } else if(appState.current !== 'active' && currentUser){
            await firebase.userOnlineStatus(currentUser?.uid, false);
        }

    };

    const hasUserWithName = () => {
        if(currentUser?.uid && currentUser?.photoURL && currentUser?.displayName) return true;
        else if(currentUser?.uid && (!currentUser?.photoURL || !currentUser?.displayName)) return false;
        else return null;
    };


    const [state, setState] = useState({
        userType: currentUserType,
        isLoggedIn: hasUserWithName(),
        profilePhotoUrl: currentUser?.photoURL ?? null,
        userName: currentUser?.displayName ?? null,
        userPhoneNumber: currentUser?.phoneNumber ?? null

    });


    return (<UserContext.Provider value={[state, setState]}>{props.children}</UserContext.Provider>)
}
