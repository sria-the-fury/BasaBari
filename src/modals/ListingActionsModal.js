import React, {useContext, useState} from "react";
import {Modal} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {Colors} from "../components/utilities/Colors";
import {FirebaseContext} from "../context/FirebaseContext";
import {ListingsUpdateModal} from "./ListingsUpdateModal";

export const ListingActionsModal = (props) => {
    const {modalVisible, modalHide, headerColor, listingInfo} = props;

    const firebase = useContext(FirebaseContext);

    //remove listing

    const removeListing = async (id, images) => {
        try {
            await firebase.removeListing(id, images);
        } catch (error){
            alert(error.message);
        }finally {
            modalHide();
        }

    };

    //open updateModal
    const [openListingUpdateModal, setListingUpdateModal] = useState(false);

    const closeListingUpdateModal = () => {
        setListingUpdateModal(false);
    }

    return (

        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                modalHide()
            }}
        >
            <ModalView>
                <ModalHeader>

                    <SlideDownButton onPress={() => modalHide()}/>


                </ModalHeader>
                <ModalBody>
                    <DeleteButton onPress={() => removeListing(listingInfo.id, listingInfo.images)}>
                        <Icon name={'trash'} type={'ionicon'} size={25}
                              style={{marginRight: 5}} color={'white'}/>
                        <TextComponent bold color={'white'} semiLarge>DELETE</TextComponent>
                    </DeleteButton>
                    <EditButton onPress={() => setListingUpdateModal(true)}>
                        <Icon name={'mode-edit'} type={'md'} size={25}
                              style={{marginRight: 5}} color={'white'}/>
                        <TextComponent bold color={'white'} semiLarge>EDIT</TextComponent>
                    </EditButton>

                </ModalBody>



            </ModalView>
            <ListingsUpdateModal modalVisible={openListingUpdateModal} modalHide={closeListingUpdateModal}
                                 listingsData={listingInfo}
            />
        </Modal>

    );
};

const ModalView = styled.View`
backgroundColor: black;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
width:100%;

position: absolute;
bottom: 0;

`;

const ModalHeader = styled.View`
height:15px;
width:100%;


`;

const SlideDownButton = styled.TouchableOpacity`
backgroundColor: white;
alignSelf: center;
height: 15px;
width: 60px;
marginTop: -1px;
borderBottomLeftRadius: 20px;
borderBottomRightRadius: 20px;
`;

const Line = styled.View`
backgroundColor: grey;
height: 5px;
borderRadius: 2px;
`;

const ModalBody = styled.View`

flexDirection : row;
alignItems: center;
justifyContent: space-between;


`

const DeleteButton = styled.Pressable`
backgroundColor: red;
alignItems: center;
flexDirection: row;
alignSelf: center;
paddingHorizontal: 20px;
paddingVertical: 10px;

borderTopRightRadius: 20px;
`;

const EditButton = styled.Pressable`
backgroundColor: ${Colors.buttonPrimary};
alignItems: center;
flexDirection: row;
alignSelf: center;
paddingHorizontal: 20px;
paddingVertical: 10px;
borderTopLeftRadius: 20px;

`;





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
//         e
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

