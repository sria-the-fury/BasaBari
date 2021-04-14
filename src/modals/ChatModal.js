import React from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {Avatar} from "react-native-paper";
import {Colors} from "../components/utilities/Colors";

export const ChatModal = (props) => {
    const {modalVisible, modalHide, message, ToUserInfo, IncludeListing} = props;

    const firstName = ToUserInfo.userName.split(' ');

    return (
        <Container>
            {/*<StatusBar barStyle={'dark-content'} backgroundColor={StatusBarAndTopHeaderBGColor}/>*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide(false)
                }}
            >
                <ModalView>
                    <ModalHeader style={{backgroundColor: Colors.primaryBody}}>
                        <Icon name={'chevron-down-outline'} type={'ionicon'} size={35} color={ 'white'} onPress={() => modalHide(false)}/>

                        <NameAndAvatar>
                            <Avatar.Image size={40} source={{uri: ToUserInfo.profilePhotoUrl}}/>
                            <TextComponent bold medium color={'white'}>  {firstName[0]}</TextComponent>

                        </NameAndAvatar>

                        <ListingInfo>
                            <Icon name={'home'} type={'ionicon'} size={10} color={'white'}/>
                            <TextComponent tiny color={'white'} multiline={true}>  {IncludeListing.address}, {IncludeListing.location.city}</TextComponent>
                        </ListingInfo>

                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{paddingHorizontal: 10, paddingVertical: 10}}>
                            <TextComponent medium justify multiline={true}>
                                This is Chat Mo0dal
                            </TextComponent>
                        </View>
                    </ScrollView>



                </ModalView>
            </Modal>
        </Container>
    );
};

const StatusBarAndTopHeaderBGColor = '#d0ff00';
const Container = styled.View`

`;

const ModalView = styled.View`
backgroundColor: white;
alignItems: center;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height:100%;

`;

const ModalHeader = styled.View`
height:50px;
width:100%;
flexDirection: row;
alignItems: center;
paddingVertical:10px;
paddingHorizontal:20px;
justifyContent: space-between;
`;

const ListingInfo = styled.View`
flexDirection: row;
width: 45%;
alignItems: center;
justifyContent: flex-end;
`

const NameAndAvatar = styled.View`
marginLeft: 20px;
flexDirection: row;
alignItems: center;
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

