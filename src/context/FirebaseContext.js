import React, {createContext} from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import _ from "lodash";
import {Alert, ToastAndroid} from "react-native";

export const FirebaseContext = createContext(undefined);


const Firebase = {

    getCurrentUser: () => {
        return auth().currentUser;
    },

    createUser: async (userName, userType) => {

        try {

            const uid = Firebase.getCurrentUser().uid;
            const {displayName, photoURL} = Firebase.getCurrentUser();
            const phoneNumber = Firebase.getCurrentUser().phoneNumber;


            await firestore().collection('users').doc(uid).set({
                userName: userName.trim(),
                phoneNumber: phoneNumber,
                createAt: new Date(),
                usersSettings:{
                    onlineStatus: true,
                    getNotification: true
                },
                userType
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

    getListingName: async (listingId) => {
        try {
            const listing = await firestore().collection('listings').doc(listingId).get();

            if(listing.exists){

                return listing.data().address;
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
                        address: listingData.address.trim(),
                        postedTime: new Date(),
                        userId: currentUserUID,
                        roomNumbers: listingData.roomNumbers,
                        facilities: listingData.facilities,
                        rentPerMonth: listingData.rentPerMonth.replace(/[^0-9]/g, ''),
                        forBachelor: listingData.forBachelor,
                        forFamily: listingData.forFamily,
                        moreDetails: listingData.moreDetails.trim(),
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

            if(currentUserName === userName) return true;



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
                    const imageRef = storage().ref(`listingImages/${listingId}`).child(imageId);
                    await imageRef.delete();

                });
            }

            if(newImages.length !== 0) {

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
                forBachelor: updateForBachelor,
                forFamily: updateForFamily
            });

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

    updateListingLocation: async (updatedLocation, listingId) => {
        try {
            await firestore().collection('listings').doc(listingId).update({
                location: updatedLocation
            });

        } catch (e) {
            console.log(e.message+'@updateListingMoreDetails');

        }

    },




    //remove functions go here

    removeListing: async (listingId, storageImages, messages, notifications) => {
        try{
            //remove this listings images when remove the listings
            _.each(storageImages, async (image) => {
                const imageRef = storage().ref(`listingImages/${listingId}`).child(image.imageId);
                await imageRef.delete();
            });
            await firestore().collection('listings').doc(listingId).delete();

            _.each(messages, async (message) => await firestore().collection('messages').doc(message.id).delete());
            _.each(notifications, async (notification) => await firestore().collection('notifications').doc(notification.id).delete());

        }catch (e) {
            console.log(e.message+'@removeListing');
        }
    },


    //messaging functions

    sendMessage: async (listingOwnerId, interestedTenantId, message, sharedImages, listingId, messageId) => {

        try {

            const isSendMessage =  await firestore().collection('messages').doc(messageId).set({
                messages: firestore.FieldValue.arrayUnion({ message, sentAt: new Date(), senderId: interestedTenantId, id: uuidv4(), read: false}),
                listingOwnerId,
                interestedTenantId,
                sharedImages,
                listingId,
                createdAt: new Date(),
                updatedAt: new Date()

            });

            await firestore().collection('listings').doc(listingId).set(
                {
                    interestedTenantId: firestore.FieldValue.arrayUnion(interestedTenantId)
                }, {merge: true})


        }catch (e){
            ToastAndroid.show(e.message+"@sendingMessage", ToastAndroid.LONG);
        }

    },

    sendMessageAtMessageScreen: async  (messageId, currentUserId, message) => {

        try{
            await firestore().collection('messages').doc(messageId).update({
                messages: firestore.FieldValue.arrayUnion({ message, sentAt: new Date(), senderId: currentUserId, id: uuidv4(), read: false}),
                updatedAt: new Date()
            });

        } catch (e) {
            ToastAndroid.show(e.message+'@ sent from message', ToastAndroid.LONG);
        }

    },

    readMessages: async (messages, messageId, read) =>{

        try{
            const readMessages = _.filter(messages, {read: true});
            const unreadMessages = _.filter(messages, {read: false});

            const readUnreadMessages = _.each(unreadMessages, (message) => {
                return _.assign(message, {read: true, readAt: _.now()})
            });

            const combineMessages = _.concat(readMessages, readUnreadMessages);

            if(messages.length === combineMessages.length) {
                await firestore().collection('messages').doc(messageId).update({
                    messages: combineMessages
                });
            }

        } catch (e) {
            ToastAndroid.show(e.message+'@ read from message', ToastAndroid.LONG);
        }
    },

    createNotification: async (notifyTo, notifyFrom, read, messageId, listingId, content) => {
        try{
            await firestore().collection('notifications').add({
                notifyAt: _.now(),
                notifyFrom,
                notifyTo,
                read,
                messageId,
                listingId,
                content,
                type: 'message'
            });

        }
        catch (e) {
            console.log(e.message);

        }
    },


    readNotifications: async (notifications, read) => {
        try{
            _.each(notifications, async (notification) => await firestore().collection('notifications').doc(notification.id).update({read}))

        }
        catch (e) {
            console.log(e.message);
        }
    },

    deleteMessage: async (messageId, listingId, interestedTenantId, deleteNotifications) => {
        try{
            // await firestore().collection('notifications').doc().delete(); later try to delete all read notifications
            await firestore().collection('listings').doc(listingId).update(
                {
                    interestedTenantId: firestore.FieldValue.arrayRemove(interestedTenantId)
                });

            await firestore().collection('messages').doc(messageId).delete();
            _.each(deleteNotifications, async (notification) => await firestore().collection('notifications').doc(notification.id).delete());

        } catch (e){
            ToastAndroid.show(e.message+' @deleting message', ToastAndroid.SHORT);
        }

    },
    userOnlineStatus: async (userId, onlineStatus) => {
        try{
            await firestore().collection('users').doc(userId).set({
                isOnline: onlineStatus,
                lastSeen: _.now()

            }, {merge: true});
        } catch (e) {
            Alert.alert('Caution', e.message, [{
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            }]);
            console.log(e.message+' at online');

        }

    },
    userSettingsUpdate: async (userId, updateValue, updateType) => {
        try{
            if(updateType === 'ONLINE_STATUS'){
                await firestore().collection('users').doc(userId).update({
                    'usersSettings.onlineStatus': updateValue

                });
            }
            if(updateType === 'GET_NOTIFICATION'){
                await firestore().collection('users').doc(userId).update({
                    'usersSettings.getNotification' : updateValue

                });
            }


        } catch (e) {
            console.log(e.message);
        }
    }



}


export const FirebaseProvider = (props) => {

    return <FirebaseContext.Provider value={Firebase}>{props.children}</FirebaseContext.Provider>

}
