import React, {createContext} from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import _ from "lodash";
import {ToastAndroid} from "react-native";

export const FirebaseContext = createContext(undefined);


const Firebase = {

    getCurrentUser: () => {
        return auth().currentUser;
    },

    createUser: async (userName) => {

        try {

            const uid = Firebase.getCurrentUser().uid;
            const {displayName, photoURL} = Firebase.getCurrentUser();
            const phoneNumber = Firebase.getCurrentUser().phoneNumber;


            await firestore().collection('users').doc(uid).set({
                userName: userName.trim(),
                phoneNumber: phoneNumber,
                createAt: new Date(),
            }, {merge: true});


            await Firebase.getCurrentUser().updateProfile({
                displayName: userName

            });

            return (displayName !== null && photoURL !== null);


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

            await firestore().collection('users').doc(uid).set({
                profilePhotoUrl: url
            }, {merge: true});
            await Firebase.getCurrentUser().updateProfile({
                photoURL: url
            })


        }catch (error) {
            console.log(error.message+'@uploadingProfileImage');

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

    //signIn with Phone

    signInWithPhoneNumber: async (phoneNumber) => {
        try {
            return await auth().signInWithPhoneNumber(phoneNumber,true);

        } catch (error) {
            console.log(error.message);
            ToastAndroid.show(error.message, ToastAndroid.LONG);

        }

    },


    //adding Data to Cloud Firestore

    addListing: async (listingData) => {

        try {
            const currentUserUID = Firebase.getCurrentUser().uid;
            const listingId = uuidv4()


            const isListingImagesUploaded = await Firebase.uploadingListingImages(listingData.listingImages,listingId);
            if(isListingImagesUploaded){
                await firestore().collection('listings').doc(listingId).set(
                    {
                        address: listingData.address,
                        postedTime: new Date(),
                        userId: currentUserUID,
                        roomNumbers: listingData.roomNumbers,
                        facilities: listingData.facilities,
                        rentPerMonth: listingData.rentPerMonth.replace(/[^0-9]/g, ''),
                        availableForBachelor: listingData.forBachelor,
                        forFamily: listingData.forFamily,
                        moreDetails: listingData.moreDetails,
                        listingId: listingId,
                        isNegotiable: listingData.isNegotiable,
                        images: [],
                        location: listingData.location


                    }
                );

            }

            return true;

        } catch (error) {
            console.log(error.message+`@addListing`);

        }
        return false

    },

    uploadingListingImages: async (images, listingId) => {

        try {
            let imagesUrlArray = []
            _.each(images,  async (image) => {
                const photo = await Firebase.getBlob(image.imageUri);

                const imageRef = storage().ref(`listingImages/${listingId}`).child(image.imageId);

                await imageRef.put(photo);

                const url = await  imageRef.getDownloadURL();

                imagesUrlArray.push({
                    imageId: image.imageId,
                    imageUrl: url
                });

                if(imagesUrlArray.length === images.length){

                    await firestore().collection('listings').doc(listingId).update({
                        images: imagesUrlArray
                    });
                }

            });

            return true;


        } catch (e) {
            console.log(e.message+'@uploading Listing Images');

        }
        return false;

    },

    //update related functions

    updateUserProfileName: async (userName) => {
        try {
            const uid = Firebase.getCurrentUser().uid;
            const currentUserName = Firebase.getCurrentUser().displayName;
            await Firebase.getCurrentUser().updateProfile({
                displayName: userName,

            });

            await firestore().collection('users').doc(uid).update({
                userName: userName,
            });

            if(currentUserName === userName)
                return true;



        } catch (e) {
            console.log(e.message+'@updateProfileName');
        }
    },


    updateFavoriteListing: async (listingId, favoriteUserId, updateType) => {
        try{
            if(updateType === 'REMOVE'){
                await firestore().collection('listings').doc(listingId).set({
                    usersInFav: firestore.FieldValue.arrayRemove(favoriteUserId)
                }, {merge: true});
            }
            else {
                await firestore().collection('listings').doc(listingId).set({
                    usersInFav: firestore.FieldValue.arrayUnion(favoriteUserId)
                }, {merge: true});
            }

        } catch (e) {
            console.log(e.message+'@updateFavorite');
        }

    },

    //listings update separate functions

    updateListingImages : async (newImages, removedImageId, getImagesAfterRemove, listingId) => {

        try {
            if(getImagesAfterRemove.length !== 0){
                await firestore().collection('listings').doc(listingId).update({
                    images: getImagesAfterRemove

                });
            }


            if(removedImageId.length !== 0){
                _.each(removedImageId, async (imageId) => {
                    console.log('imageId=>', imageId);
                    const imageRef = storage().ref(`listingImages/${listingId}`).child(imageId);
                    await imageRef.delete();

                });
            }

            if(newImages.length !== 0) {
                console.log('new images');
                _.each(newImages,  async (image) => {
                    const photo = await Firebase.getBlob(image.imageUrl);

                    const imageRef = storage().ref(`listingImages/${listingId}`).child(image.imageId);

                    await imageRef.put(photo);

                    const url = await  imageRef.getDownloadURL();

                    await firestore().collection('listings').doc(listingId).update({
                        images: firestore.FieldValue.arrayUnion({imageId: image.imageId, imageUrl: url})
                    });

                });

            }


        } catch (e) {
            console.log(e.message+'@updateListingImage');

        }
    },

    updateListingAddress: async (updateAddress,listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                address: updateAddress
            });

        } catch (e) {
            console.log(e.message+'@updateListingAddress');

        }
    },

    updateListingFacilities: async (updateFacilities,listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                facilities: updateFacilities
            });

        } catch (e) {
            console.log(e.message+'@updateListingFacilities');

        }
    },

    updateListingRoomNumbers: async (updateRoomNumbers,listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                roomNumbers: updateRoomNumbers
            });

        } catch (e) {
            console.log(e.message+'@updateListingRoomNumbers');

        }
    },

    updateListingRentType: async (updateForBachelor, updateForFamily ,listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                availableForBachelor: updateForFamily,
                forFamily: updateForFamily
            } );

        } catch (e) {
            console.log(e.message+'@updateListingRentType');

        }
    },

    updateListingRent: async (updateRentPerMonth, listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                rentPerMonth: updateRentPerMonth.replace(/[^0-9]/g, '')
            });

        } catch (e) {
            console.log(e.message+'@updateListingRent');

        }
    },
    updateListingRentNegotiable: async (updateIsNegotiable, listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                isNegotiable: updateIsNegotiable
            });

        } catch (e) {
            console.log(e.message+'@updateListingRentNegotiable');

        }
    },

    updateListingMoreDetails: async (updateMoreDetails, listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                moreDetails: updateMoreDetails
            });

        } catch (e) {
            console.log(e.message+'@updateListingMoreDetails');

        }
    },




    //remove functions go here

    removeListing: async (listingId, storageImages) => {
        try{
            await firestore().collection('listings').doc(listingId).delete();
            //remove this listings images when remove the listings
            _.each(storageImages, async (image) => {
                const imageRef = storage().ref(`listingImages/${listingId}`).child(image.imageId);
                await imageRef.delete();
            });


        }catch (e) {
            console.log(e.message+'@removeListing');

        }
    }


}


export const FirebaseProvider = (props) => {

    return <FirebaseContext.Provider value={Firebase}>{props.children}</FirebaseContext.Provider>

}
