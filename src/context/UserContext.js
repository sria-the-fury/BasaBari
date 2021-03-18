import React, {useState, createContext, useContext} from 'react';
import {FirebaseContext} from "./FirebaseContext";


export const UserContext = createContext([{}, p => {}]);

export const UserProvider =  (props) => {
    const firebase = useContext(FirebaseContext);

    const currentUser = firebase.getCurrentUser();

    const hasUserWithName = () => {
        if(currentUser && currentUser.uid && currentUser.photoURL && currentUser.displayName) return true;
        else if(currentUser && currentUser.uid && !currentUser.photoURL && !currentUser.displayName) return false;
        else return null;
    };


    const [state, setState] = useState({
        isLoggedIn: hasUserWithName(),
        profilePhotoUrl: currentUser ? currentUser.photoURL : null,
        userName: currentUser ? currentUser.displayName : null,
        userPhoneNumber: currentUser ? currentUser.phoneNumber : null

    });


    return (<UserContext.Provider value={[state, setState]}>{props.children}</UserContext.Provider>)
}
