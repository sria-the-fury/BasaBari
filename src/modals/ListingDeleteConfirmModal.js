import React, {useContext, useState,useEffect} from "react";
import {View, Modal, Pressable, ScrollView, StyleSheet, Vibration, ToastAndroid} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {Colors} from "../components/utilities/Colors";
import {FirebaseContext} from "../context/FirebaseContext";
import firestore from "@react-native-firebase/firestore";

export const ListingDeleteConfirmModal = (props) => {
    const {modalVisible, modalHide, listingName, actionProps, navigation} = props;
    const firebase = useContext(FirebaseContext);

    const [messages, setMessages] = useState(null);
    const [notifications, setNotifications] = useState(null);

    useEffect(() => {
        const thisListingMessages = firestore().collection('messages').where('listingId', '==', actionProps.itemId).onSnapshot(
            docs=> {
                let data=[]
                if(docs) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id
                        })
                    });
                    if(data.length > 0 ) setMessages(data);
                }
            });

        const thisListingNotifications = firestore().collection('notifications').where('listingId', '==', actionProps.itemId).onSnapshot(
            docs=> {
                let data=[]
                if(docs) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id
                        })
                    });
                    if(data.length > 0 )  setNotifications(data);
                }
            });

        return () => thisListingMessages() || thisListingNotifications();
    }, []);



    //remove listing
    const removeListing = async (id, images) => {
        // console.log('images => ', images);

        Vibration.vibrate(30);
        modalHide(false);
        if(navigation) navigation.goBack();
        try {
            if(images) await firebase.removeListing(id, images, messages, notifications);
            ToastAndroid.show('Listing Deleted', ToastAndroid.LONG);
        } catch (error){
            alert(error.message);
        }finally {
            modalHide(false);
        }

    };
    return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide(false)
                }}
            >
                <ModalCenter>
                    <ModalView>
                        <ModalTitle>
                            <TextComponent bold semiLarge color={Colors.deleteButtonColor}>Delete</TextComponent>
                        </ModalTitle>
                        <ModalBody>
                            <TextComponent mediumPro color={'black'} numberOfLines={3}>Are you sure to delete
                                <TextComponent mediumPro color={'grey'}> {listingName} </TextComponent>
                                 listing?
                            </TextComponent>
                        </ModalBody>
                        <ModalAction>
                            <ModalActionButton style={{backgroundColor: Colors.deleteButtonColor}} onPress={() => removeListing(actionProps.itemId, actionProps.images)}>
                                <Icon name={'trash'} type={'ionicon'}
                                      size={15} color={'white'}/>
                                <TextComponent medium color={'white'}>DELETE</TextComponent>
                            </ModalActionButton>
                            <ModalActionButton style={{backgroundColor: 'grey'}} onPress={() => modalHide(false)}>
                                <Icon name={'close-circle'} type={'ionicon'}
                                      size={15} color={'white'}/>
                                <TextComponent medium color={'white'}>CLOSE</TextComponent>
                            </ModalActionButton>


                        </ModalAction>

                    </ModalView>

                </ModalCenter>


            </Modal>
    );
};

const ModalCenter = styled.View`
  flex: 1;
  justifyContent: center;
  alignItems: center;
`
const ModalView = styled.View`
backgroundColor: white;
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 5px;
shadowColor: #000;
justifyContent: center;
shadowOpacity: 0.25;
shadowRadius: 4px;
maxWidth: 280px;
backgroundColor: lavender;
width: 100%;
elevation: 5;

`;

const ModalTitle = styled.View`
paddingVertical: 5px;

`
const ModalBody = styled.View`
paddingVertical: 5px;

`

const ModalAction = styled.View`
paddingVertical: 5px;
flexDirection: row;
alignItems: center;
justifyContent: space-between;

`;
const ModalActionButton = styled.TouchableOpacity`
flexDirection: row;
alignItems: center;
padding: 5px;
borderRadius: 5px;
`


// const styles = StyleSheet.create({
//     centeredView: {
//         flex: 1,
//         justifyContent: "center",
//     },
//     modalView: {
//         margin: 20,
//         backgroundColor: "white",
//         borderRadius: 20,
//         padding: 35,
//         alignItems: "center",
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 2
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//
//     },
//     button: {
//         borderRadius: 20,
//         padding: 10,
//         elevation: 2
//     },
//     buttonOpen: {
//         backgroundColor: "#F194FF",
//     },
//     buttonClose: {
//         backgroundColor: "#2196F3",
//     },
//     textStyle: {
//         color: "white",
//         fontWeight: "bold",
//         textAlign: "center"
//     },
//     modalText: {
//         marginBottom: 15,
//         textAlign: "center"
//     }
// });

