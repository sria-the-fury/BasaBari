import React, {useState, createContext} from 'react';
import auth from "@react-native-firebase/auth";


export const UserContext = createContext([{}, p => {}]);

export const UserProvider =  (props) => {
    const [state, setState] = useState({
        // userName: '',
        // email: '',
        // password: '',
        // uid: '',
        isLoggedIn: auth().currentUser,
        // profilePhotoUrl: 'default'
    });

    return (<UserContext.Provider value={[state, setState]}>{props.children}</UserContext.Provider>)
}
