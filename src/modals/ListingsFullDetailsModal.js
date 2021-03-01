import React from "react";
import { View, Modal, Pressable, ScrollView, StatusBar } from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";

export const ListingsFullDetailsModal = (props) => {
    const {listingsData} = props;
    const {modalVisible, modalHide} = props;
    return (
        <Container>
            <StatusBar barStyle={'dark-content'} backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide()
                }}
            >
                <ModalView>
                    <ModalHeader>
                        <Icon name={'close-circle'} type={'ionicon'} size={40} color={'white'} onPress={() => modalHide()}/>
                        <TextComponent bold medium color={'white'}>LISTING DETAILS</TextComponent>
                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{paddingHorizontal: 10, paddingVertical: 10}}>
                            <TextComponent medium justify>
                                My Listings {listingsData.address} --->
                                {listingsData.postedBy}
                            </TextComponent>


                        </View>
                    </ScrollView>



                </ModalView>
            </Modal>
        </Container>
    );
};

const StatusBarAndTopHeaderBGColor = 'red';
const Container = styled.View`

`;

const ModalView = styled.View`
backgroundColor: white;
borderRadius: 20px;
alignItems: center;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height:100%;

`;

const ModalHeader = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};
 flexDirection: row;
 width: 100%
 alignItems: center;
 paddingHorizontal: 32px;
 paddingVertical: 12px;
 justifyContent: space-between;


`;


