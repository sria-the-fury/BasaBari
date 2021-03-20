import React, {useState} from "react";
import {View, Modal, Pressable, ScrollView, StatusBar, FlatList, Linking, Text, TouchableOpacity} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Divider, Icon} from "react-native-elements";
import {ListingsUpdateModal} from "./ListingsUpdateModal";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";

export const ListingsFullDetailsModal = (props) => {
    const {listingsData, postedUserInfo, currentUserListings} = props;
    const {images, roomNumbers, facilities, forBachelor, forFamily, rentPerMonth, isNegotiable, moreDetails} = listingsData;
    const {modalVisible, modalHide} = props;



    const makeCall = async (number) => {
        await Linking.openURL('tel:'+number);
    }

    //open update modal
    const [openListingUpdateModal, setListingUpdateModal] = useState(false);

    const closeListingUpdateModal = () => {
        setListingUpdateModal(false);
    }

    return (
        <Container>
            <FocusedStatusbar barStyle="dark-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>
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
                    <ScrollView showsVerticalScrollIndicator={false} style={{marginVertical: 5, marginHorizontal: 10, marginBottom: 50}}>

                        <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                                  showsHorizontalScrollIndicator={false}/>

                        <AddressContainer>
                            <Icon name={'navigate'} type={'ionicon'} size={25} style={{marginRight: 5}} color={'blue'}/>
                            <TextComponent semiLarge bold style={{ flex:1,
                                flexWrap: 'wrap'}}>
                                {listingsData.address}
                            </TextComponent>
                        </AddressContainer>

                        <RoomsContainer>

                            <IconsAndRoomNumbers>
                                <View style={{backgroundColor: 'grey', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50}}>
                                    <TextComponent bold color={'white'}>{roomNumbers.bedRoom}</TextComponent>
                                </View>
                                <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                    <TextComponent> Bed Room</TextComponent>
                                </View>

                            </IconsAndRoomNumbers>

                            <IconsAndRoomNumbers>
                                <View style={{backgroundColor: 'grey', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50}}>
                                    <TextComponent bold color={'white'}>{roomNumbers.dinning}</TextComponent>
                                </View>
                                <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                    <TextComponent> Dinning</TextComponent>
                                </View>
                            </IconsAndRoomNumbers>

                            <IconsAndRoomNumbers>
                                <View style={{backgroundColor: 'grey', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50}}>
                                    <TextComponent bold color={'white'}>{roomNumbers.washRoom}</TextComponent>
                                </View>
                                <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                    <TextComponent> Washroom</TextComponent>
                                </View>
                            </IconsAndRoomNumbers>

                        </RoomsContainer>

                        { facilities.hasBalcony || facilities.isFireSafety || facilities.hasCCTV || facilities.isNearToMainRoad ?
                            <FacilitiesContainer horizontal showsHorizontalScrollIndicator={false} centerContent>
                                {facilities.hasBalcony ?
                                    <Facilities>
                                        <TextComponent bold color={'white'}>Balcony</TextComponent>
                                    </Facilities>: null }

                                {facilities.hasCCTV ?
                                    <Facilities>
                                        <TextComponent bold color={'white'}>CCTV</TextComponent>
                                    </Facilities>: null }
                                {facilities.isFireSafety ?
                                    <Facilities>
                                        <TextComponent bold color={'white'}>Fire Safety</TextComponent>
                                    </Facilities>: null }

                                {facilities.isNearToMainRoad ?
                                    <Facilities>
                                        <TextComponent bold color={'white'}>Near to Main Road</TextComponent>
                                    </Facilities>: null }



                            </FacilitiesContainer> : null
                        }

                        <RentAndNegotiableContainer>
                            <TextComponent bold semiLarge color={'white'}>RENT/MONTH </TextComponent>

                            <ContainerFlexRow>
                                { rentPerMonth ?
                                    <RentContainer>
                                        <TextComponent bold color={'white'}>{rentPerMonth}TK</TextComponent>

                                    </RentContainer> : null
                                }

                                { isNegotiable ?
                                    <RentContainer>
                                        <TextComponent bold color={'white'}>Negotiable</TextComponent>

                                    </RentContainer> : null
                                }

                            </ContainerFlexRow>

                        </RentAndNegotiableContainer>

                        <RentAvailableFor>
                            { forFamily ?
                                <RentType >
                                    <TextComponent medium bold color={'white'}>FAMILY</TextComponent>
                                </RentType> : null
                            }

                            { forBachelor ?
                                <RentType>
                                    <TextComponent medium bold color={'white'}>BACHELOR</TextComponent>
                                </RentType> : null
                            }


                        </RentAvailableFor>

                        <MoreDetailsContainer>
                            <TextComponent semiLarge>More Details</TextComponent>
                            <Divider backgroundColor={'blue'}/>

                            <ListingDetails>
                                <TextComponent medium>{moreDetails}</TextComponent>
                            </ListingDetails>

                        </MoreDetailsContainer>


                    </ScrollView>

                    { currentUserListings ?
                        <EditListingButton onPress={() => setListingUpdateModal(true)}>
                            <TextComponent bold medium color={'white'}>EDIT LISTING</TextComponent>
                        </EditListingButton>
                        :
                        <ContactContainer onPress={()=>makeCall(postedUserInfo.phoneNumber)}>
                            <TextComponent bold medium color={'white'}>CONTACT WITH LANDLORD</TextComponent>
                        </ContactContainer>
                    }



                </ModalView>
            </Modal>
            <ListingsUpdateModal modalVisible={openListingUpdateModal} modalHide={closeListingUpdateModal}
            listingsData={listingsData}
            />
        </Container>
    );
};

const renderImage= (image) => {

    return(
        <View style={{marginHorizontal:15}}>
            <ListingsImagesContainer source={{uri: image.imageUrl}}/>

        </View>
    )

};

const ListingsImagesContainer = styled.Image`
height: 250px;
width: 250px;
borderRadius: 10px;

`;

const StatusBarAndTopHeaderBGColor = 'red';
const Container = styled.SafeAreaView`

`;

const AddressContainer = styled.View`
 paddingVertical: 10px;
  flexDirection: row;
   alignItems: center;

`

const ModalView = styled.View`
backgroundColor: white;
height:100%;

`;

const ModalHeader = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};
 flexDirection: row;
 width: 100%
 alignItems: center;
 paddingHorizontal: 20px;
 paddingVertical: 12px;
 justifyContent: space-between;

`;

const RoomsContainer = styled.View`
alignItems: center;
justifyContent: space-between;
flexDirection: row;

`

const IconsAndRoomNumbers = styled.View`
alignItems: center;
flexDirection: row;
backgroundColor: white;
borderWidth: 1px;

borderColor: rgba(0, 0, 0, 0.1);
borderRadius: 50px;

`;

const FacilitiesContainer = styled.ScrollView`
marginVertical: 30px;
flexDirection: row;

`;

const Facilities = styled.View`
backgroundColor: #632b9b;
paddingHorizontal: 10px;
paddingVertical: 5px;
borderRadius: 15px;
marginHorizontal: 5px;


`;

const RentAndNegotiableContainer = styled.View`
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal: 10px;
backgroundColor: #d80499;
paddingVertical: 10px;
marginBottom: 10px;
borderRadius: 5px;


`;

const RentContainer = styled.View`
backgroundColor: #d80499;
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 20px;
marginHorizontal: 5px;
borderColor: white;
borderWidth: 2px;

`;

const ContactContainer = styled.TouchableOpacity`
position: absolute;
 bottom:0;
 borderTopLeftRadius: 10px;
 borderTopRightRadius: 10px;
 paddingVertical: 15px;
  alignSelf: center;
 paddingHorizontal: 20px;
  backgroundColor: red;
`;

const EditListingButton = styled.TouchableOpacity`
position: absolute;
 bottom:0;
 alignSelf: center;
 borderTopLeftRadius: 10px;
 borderTopRightRadius: 10px;
 paddingVertical: 15px;
 paddingHorizontal: 20px;
  backgroundColor: red;
`

const ContainerFlexRow = styled.View`
flexDirection: row;
alignItems: center;
`;

const RentAvailableFor = styled.View`
alignItems:center;
flexDirection: row;
marginVertical: 20px;
 justifyContent: center;
`;

const RentType = styled.View`
marginRight: 10px;
backgroundColor: #9c45c1;
 paddingVertical: 10px;
 paddingHorizontal: 20px;
  borderRadius: 30px;


`;

const MoreDetailsContainer = styled.View`


`

const ListingDetails = styled.View`
marginTop: 10px;
backgroundColor: lavender;
paddingHorizontal: 5px;
paddingVertical: 5px;
borderRadius: 5px;

`;


