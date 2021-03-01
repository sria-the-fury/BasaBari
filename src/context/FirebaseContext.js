import React, {createContext} from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

export const FirebaseContext = createContext(undefined);


const Firebase = {

    getCurrentUser: () => {
        return auth().currentUser;
    },

    createUser: async (user) => {

        try {
            await auth().createUserWithEmailAndPassword(user.email, user.password);

            const uid = Firebase.getCurrentUser().uid;



            let profilePhotoUrl = 'default';


            await firestore().collection('users').doc(uid).set({
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                createAt: new Date(),
                profilePhotoUrl
            });


            await Firebase.getCurrentUser().updateProfile({
                displayName: user.userName,
                photoURL: profilePhotoUrl,

            });

            if(user.profileImageUri){
                profilePhotoUrl = await Firebase.uploadProfilePhoto(user.profileImageUri);

            }


            delete user.password

            return{...user, profilePhotoUrl, uid}

        }catch (error) {
            console.log("Error @createUser : ", error.message);

        }

    },

    uploadProfilePhoto: async (uri) => {
        const uid = Firebase.getCurrentUser().uid;


        try {
            const photo = await Firebase.getBlob(uri);

            const imageRef = storage().ref("profilePhotos").child(uid);

            await imageRef.put(photo);

            const url = await  imageRef.getDownloadURL();

            await firestore().collection('users').doc(uid).update({
                profilePhotoUrl: url
            });
            await Firebase.getCurrentUser().updateProfile({
                photoURL: url
            })


        }catch (error) {

        }

    },

    getBlob: async (uri) => {

        return await new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();

            xhr.onload = () => {
                resolve(xhr.response);

            }

            xhr.onerror = () => {
                reject(new TypeError("Network Request Failed."))

            }

            xhr.responseType ='blob';
            xhr.open("GET", uri, true);
            xhr.send(null);

        });

    },

    getUserInfo: async (uid) => {

        try {
            const user = await firestore().collection('users').doc(uid).get();



            if(user.exists){

                return user.data();
            }

        }catch (error) {
            console.log('Error @getUserInfo : ', error);
        }

    },

    loggedOut: async () => {
        try {
            await auth().signOut();

            return true;

        }catch (error) {
            console.log('Error @signOut : ', error);

        }
        return false;
    },

    signIn: async (email, password) => {

        return auth().signInWithEmailAndPassword(email, password);

    },

    //update related functions
    updateEmail: async (email) => {
        try {
            const currentUser = Firebase.getCurrentUser();

            await currentUser.updateEmail(email);
            await firestore().collection('users').doc(currentUser.uid).update({
                email: email
            });


            return true;


        } catch (e) {
            console.log(e.message);

        }

        return false;

    },

    updatePassword: async (password) => {

        try {
            await Firebase.getCurrentUser().updatePassword(password);

            return true;
        } catch (error) {
            console.log(error.message+'@updatePassWord');

        }
        return false;
    },

    updateProfileInfo: async (updatedInfo) => {

        try {
            const uid = Firebase.getCurrentUser().uid;
            await Firebase.getCurrentUser().updateProfile({
                displayName: updatedInfo.updateUserName,

            });

            await firestore().collection('users').doc(uid).update({
                userName: updatedInfo.updateUserName,
                phoneNumber: updatedInfo.updatePhoneNumber
            });

            if(updatedInfo.updateProfileImageUri){
                await Firebase.uploadProfilePhoto(updatedInfo.updateProfileImageUri);
            }

            return true;

        } catch (error) {
            console.log(error.message+'@updateProfileInfo')

        }
    }


}


export const FirebaseProvider = (props) => {

    return <FirebaseContext.Provider value={Firebase}>{props.children}</FirebaseContext.Provider>

}
