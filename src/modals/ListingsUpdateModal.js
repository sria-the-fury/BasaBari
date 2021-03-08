import React, {useContext, useState} from "react";
import {View, Modal, ScrollView, FlatList, Image} from "react-native";
import {Divider} from "react-native-elements";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {FirebaseContext} from "../context/FirebaseContext";
import ImagePicker from "react-native-customized-image-picker";
import {v4 as uuidv4} from "uuid";
import _ from "lodash";
import {CustomCheckbox} from "../components/custom-checkbox/CustomCheckbox";

export const ListingsUpdateModal = (props) => {
    const {modalVisible, modalHide, listingsData} = props;
    const {images, address, roomNumbers, facilities, forBachelor, forFamily, rentPerMonth, isNegotiable, moreDetails, id} = listingsData;


    const firebase = useContext(FirebaseContext);

    const [updateFacilities, setUpdateFacilities] = useState({
        isFireSafety: facilities.isFireSafety,
        hasBalcony: facilities.hasBalcony,
        isNearToMainRoad: facilities.isNearToMainRoad,
        hasCCTV: facilities.hasCCTV
    });

    const [updateRoomNumbers, setUpdateRoomNumbers] = useState({
        dinning: roomNumbers.dinning,
        bedRoom: roomNumbers.bedRoom,
        washRoom: roomNumbers.washRoom
    })

    const [updateForBachelor, setUpdateForBachelor] = useState(forBachelor);
    const [updateForFamily, setUpdateForFamily] = useState(forFamily);
    const [updateAddress, setUpdateAddress] = useState(address);
    const [updateMoreDetails, setUpdateMoreDetails] = useState(moreDetails);
    const [updateRentPerMonth, setUpdateRentPerMonth] = useState(rentPerMonth);
    const [loading, setLoading] = useState(false);
    const [updateIsNegotiable, setUpdateNegotiable] = useState(isNegotiable);


    const [listingImages, setListingImages] = useState(images);

    const [getImagesAfterRemove, setImagesAfterRemoved] = useState([]);
    const [removedImageId, setRemovedImageId] = useState([]);

    //for checked Function

    const setMaxUpload = () => {
        let maxImage = 5;
        if((listingImages && listingImages.length > 0) && (listingImages && listingImages.length < 5)){
            return maxImage - listingImages.length;
        } else return maxImage;
    }

    const pickImage = () => {
        ImagePicker.openPicker({
            multiple: true,
            compressQuality: 80,
            minCompressSize: 120,
            maxSize: setMaxUpload(),
            imageLoader: 'UNIVERSAL'
        }).then(images => {


            if(images.length === 1){
                setListingImages( [...listingImages, {imageId: uuidv4(),
                    imageUrl: images[0].path}]);
            }
            else if((images.length > 1) && (listingImages.length >= 1)) {

                let imageData=[];

                _.each(images, (image) => {

                    imageData.push({
                        imageId: uuidv4(),
                        imageUrl: image.path

                    });
                    if(imageData.length !== 0){
                        let mergeArray = listingImages.concat(imageData);
                        setListingImages(mergeArray);
                    }

                });


            }
            else if(listingImages.length === 0 ) {
                let imageData=[];
                _.each(images, (image) => {
                    imageData.push ({
                        imageId: uuidv4(),
                        imageUrl: image.path
                    })

                });

                setListingImages(...listingImages, imageData)
            }


        });
    }


    const removeAllImagesOnce = () => {
        ImagePicker.clean()
            .then(() => {

            })
            .catch(e => {
                console.log(e);
            });

    };

    const removeImageFromArray = (id) =>{
        let clonedListingImage = _.clone(listingImages);
        let clonePreviousImage = _.clone(images);
        _.remove(clonePreviousImage, {imageId: id});
        setRemovedImageId([...removedImageId, id]);



        setImagesAfterRemoved(clonePreviousImage);

        _.remove(clonedListingImage, {imageId: id});
        setListingImages(clonedListingImage);


    };

    const renderImage= (image) => {

        return(
            <ListingImageMainContainer >


                <ListingsImagesContainer source={{uri: image.imageUrl}}/>
                <View style={{top: 0,position:'absolute' }}>
                    <Icon
                        name={'close-circle'}
                        type='ionicon'
                        color={'rgba(232,0,0,0.7)'} size={25} onPress={() => removeImageFromArray(image.imageId)}
                    />
                </View>

            </ListingImageMainContainer>
        )

    };


    const disableUpdateIfSameValue = () => {
        const differenceImages = _.isEqual(listingImages, images);
        const isAddressSame = address === updateAddress,
            isFacilitiesSame = _.isEqual(facilities, updateFacilities),
            isSameRoom = _.isEqual(roomNumbers, updateRoomNumbers),
            isSameBachelor = forBachelor === updateForBachelor,
            isSameFamily = forFamily === updateForFamily,
            isSameRent = rentPerMonth === updateRentPerMonth,
            isSameNegotiable = isNegotiable === updateIsNegotiable,
            isSameDesc = moreDetails === updateMoreDetails;
        // console.log('differenceImages=>', differenceImages);
        // console.log('isAddressSame=>', isAddressSame);
        // console.log('isFacilitiesSame=>', isFacilitiesSame);
        // console.log('isSameRoom=>', isSameRoom);
        // console.log('roomNumbers=>', roomNumbers);
        // console.log('updateRoomNumbers=>', updateRoomNumbers);
        // console.log('isSameBachelor=>', isSameBachelor);


        return (differenceImages && isAddressSame && isFacilitiesSame && isSameBachelor && isSameDesc && isSameFamily && isSameRent && isSameNegotiable && isSameRoom);

    }

    const disableUpdate = () => {

        return ((updateForBachelor === false && updateForFamily === false) ||  listingImages.length < 3 || (updateRentPerMonth === 0 || updateRentPerMonth ==='') || updateMoreDetails === '' || updateAddress === '' ||
            ((updateRoomNumbers.washRoom === 0 || updateRoomNumbers.washRoom === '') || (updateRoomNumbers.dinning === 0 || updateRoomNumbers.dinning === '') || (updateRoomNumbers.bedRoom === 0 || updateRoomNumbers.bedRoom === '')));
    }

    // console.log('disableUpdateIfSameValue=>', disableUpdateIfSameValue());


    //update method
    const updateListing = async (listingId) => {
        setLoading(true)
        try {
            const isNewImages = _.difference(listingImages, images),
                differenceImages = _.isEqual(listingImages, images);

            if((isNewImages.length !== 0) && !differenceImages) await  firebase.updateListingImages(isNewImages,removedImageId, getImagesAfterRemove, listingId);

            if(address !== updateAddress) await firebase.updateListingAddress(updateAddress,listingId);

            if(!(_.isEqual(facilities, updateFacilities))) await firebase.updateListingFacilities(updateFacilities,listingId);

            if(!(_.isEqual(roomNumbers, updateRoomNumbers))) await firebase.updateListingRoomNumbers(updateRoomNumbers,listingId);

            if((forBachelor !== updateForBachelor) || (forFamily !== updateForFamily)) await firebase.updateListingRentType(updateForBachelor, updateForFamily ,listingId);

            if(rentPerMonth !== updateRentPerMonth) await firebase.updateListingRent(updateRentPerMonth ,listingId);

            if(isNegotiable !== updateIsNegotiable) await firebase.updateListingRentNegotiable(updateIsNegotiable ,listingId);

            if(moreDetails === updateMoreDetails) await firebase.updateListingMoreDetails(updateMoreDetails ,listingId);

        }catch (e) {

        } finally {
            setListingImages(images);

            console.log('_isEqual=>', _.isEqual(roomNumbers, updateRoomNumbers));

            setImagesAfterRemoved([]);
            setRemovedImageId([]);

            removeAllImagesOnce();


            setLoading(false);
            modalHide();


        }

    };


    const closeModalAndUpdateState = () => {

        //
        setListingImages(images);
        setUpdateFacilities(prev=>({
            ...prev,
            hasBalcony: facilities.hasBalcony,
            isNearToMainRoad: facilities.isNearToMainRoad,
            hasCCTV: facilities.hasCCTV,
            isFireSafety: facilities.isFireSafety
        }))

        setUpdateRoomNumbers({
            dinning: roomNumbers.dinning,
            bedRoom: roomNumbers.bedRoom,
            washRoom: roomNumbers.washRoom
        });

        setUpdateForBachelor(forBachelor);
        setUpdateForFamily(forFamily);
        setUpdateAddress(address);
        setUpdateMoreDetails(moreDetails);
        setUpdateRentPerMonth(rentPerMonth);
        setUpdateNegotiable(isNegotiable);
        setImagesAfterRemoved([]);
        setRemovedImageId([]);

        removeAllImagesOnce();
        modalHide();

    }


    return (
        <Container>
            {/*<FocusedStatusbar barStyle="dark-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    closeModalAndUpdateState()
                }}
            >
                <ModalView>
                    <ModalHeader>
                        <Icon name={'chevron-down-circle'} type={'ionicon'} size={40} color={'white'} onPress={() => closeModalAndUpdateState()}/>

                        <UpdateListingButton disabled={disableUpdateIfSameValue() || disableUpdate() || loading} onPress={() => updateListing(id)}>
                            { loading ? <Loading/> :
                                <TextComponent bold medium color={disableUpdateIfSameValue() || disableUpdate() ? 'grey':'white'}>UPDATE LISTING</TextComponent>
                            }
                        </UpdateListingButton>
                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal: 10}}>
                        <BodyView>

                            <View style={{flexDirection: "row", alignItems: "center", justifyContent: 'space-between'}}>
                                <View style={{flexDirection: "row", alignItems: "center"}}>
                                    <Icon raised name={'add-photo-alternate'} type={'md'} size={20} onPress={() => pickImage()} disabled={listingImages && listingImages.length === 5}/>
                                    <TextComponent bold color={listingImages && listingImages.length === 5 ? 'grey': 'black'}>
                                        Select Image: {listingImages ? listingImages.length : 0} of 5 (Min: 3)
                                    </TextComponent>
                                </View>


                                <Icon raised name={'image-not-supported'} type={'material'} color={'red'}
                                      size={20} onPress={() => removeAllImagesOnce()} disabled={listingImages && listingImages.length === 0}/>

                            </View>


                            {listingImages && listingImages.length ? <FlatList data={listingImages} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                                                                               showsHorizontalScrollIndicator={false}/>
                                :
                                <ImagePreviewPlace>
                                    <TextComponent center>No Image selected yet</TextComponent>
                                </ImagePreviewPlace>}

                        </BodyView>

                        <FormViewContainer showsVerticalScrollIndicator={false}>


                            <LabelAndInputWrapper>
                                <Icon
                                    name='location-outline'
                                    type='ionicon'
                                    color='#1c3787' size={30}
                                />

                                <TextInput placeholder={'Shyamoli Block A, Road #5, Habiganj'} autoCapitalize={'words'} dataDetectorTypes={'address'}
                                           multiline={true} onChangeText={(address) => setUpdateAddress(address)} defaultValue={address}
                                           autoCorrect={false} />

                            </LabelAndInputWrapper>



                            <FacilitiesContainer>


                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <TextComponent semiLarge bold>FACILITIES</TextComponent>
                                    <TextComponent semiLarge bold>ROOMS</TextComponent>
                                </View>

                                <Divider style={{ backgroundColor: 'blue' }} />

                                <CheckBoxAndRoomWrapper>
                                    <CheckBoxWrapper>

                                        <CustomCheckbox title={'Fire Safety'} textSize={18}
                                                        checkedIcon={<Icon
                                                            name={updateFacilities.isFireSafety ? 'checkbox' : 'square-outline'}
                                                            type='ionicon'
                                                            color={updateFacilities.isFireSafety ? 'green' : 'black'} size={30}
                                                            onPress={() => setUpdateFacilities(prev => ({...prev,
                                                                isFireSafety: !updateFacilities.isFireSafety
                                                            }))}
                                                        />}

                                                        checked={updateFacilities.isFireSafety}

                                        />



                                        <CustomCheckbox title={'Balcony'} textSize={18}
                                                        checkedIcon={<Icon
                                                            name={updateFacilities.hasBalcony ? 'checkbox' : 'square-outline'}
                                                            type='ionicon'
                                                            color={updateFacilities.hasBalcony ? 'green' : 'black'} size={30}
                                                            onPress={() => setUpdateFacilities(prev => ({...prev,
                                                                hasBalcony: !updateFacilities.hasBalcony
                                                            }))}
                                                        />}

                                                        checked={updateFacilities.hasBalcony}

                                        />


                                        <CustomCheckbox title={'Near Main Road'} textSize={18}
                                                        checkedIcon={<Icon
                                                            name={updateFacilities.isNearToMainRoad ? 'checkbox' : 'square-outline'}
                                                            type='ionicon'
                                                            color={updateFacilities.isNearToMainRoad ? 'green' : 'black'} size={30}
                                                            onPress={() => setUpdateFacilities(prev => ({...prev,
                                                                isNearToMainRoad: !updateFacilities.isNearToMainRoad
                                                            }))}
                                                        />}

                                                        checked={updateFacilities.isNearToMainRoad}

                                        />


                                        <CustomCheckbox title={'CCTV'} textSize={18}
                                                        checkedIcon={<Icon
                                                            name={updateFacilities.hasCCTV ? 'checkbox' : 'square-outline'}
                                                            type='ionicon'
                                                            color={updateFacilities.hasCCTV ? 'green' : 'black'} size={30}
                                                            onPress={() => setUpdateFacilities(prev => ({...prev,
                                                                hasCCTV: !updateFacilities.hasCCTV
                                                            }))}
                                                        />}

                                                        checked={updateFacilities.hasCCTV}

                                        />

                                    </CheckBoxWrapper>

                                    <RoomInputWrapper>

                                        <RoomLabelAndInputWrapper>
                                            <Icon
                                                name='bed-outline'
                                                type='ionicon'
                                                color='#1c3787' size={30}
                                            />

                                            <RoomInput placeholder={'Bed room'} keyboardType={'numeric'} maxLength={1} defaultValue={roomNumbers.bedRoom}
                                                       onChangeText={(bedRoom) => setUpdateRoomNumbers(prev => ({...prev, bedRoom: bedRoom}))}
                                                       autoCorrect={false} autoComplete={false}/>

                                        </RoomLabelAndInputWrapper>


                                        <RoomLabelAndInputWrapper>
                                            <Icon
                                                name='restaurant-outline'
                                                type='ionicon'
                                                color='#1c3787' size={30}
                                            />

                                            <RoomInput placeholder={'Dinning'} keyboardType={'numeric'} maxLength={1} defaultValue={roomNumbers.dinning}
                                                       onChangeText={(dinning) => setUpdateRoomNumbers(prev => ({...prev, dinning: dinning}))}
                                                       autoCorrect={false} />

                                        </RoomLabelAndInputWrapper>


                                        <RoomLabelAndInputWrapper>
                                            <Icon
                                                name='toilet'
                                                type='font-awesome-5'
                                                color='#1c3787' size={30}
                                            />

                                            <RoomInput placeholder={'Washroom'} keyboardType={'numeric'} maxLength={1} defaultValue={roomNumbers.washRoom}
                                                       onChangeText={(washRoom) => setUpdateRoomNumbers(prev => ({...prev, washRoom: washRoom}))}
                                                       autoCorrect={false} />

                                        </RoomLabelAndInputWrapper>

                                    </RoomInputWrapper>

                                </CheckBoxAndRoomWrapper>


                            </FacilitiesContainer>

                            <BachelorOrFamilyContainer>

                                <TextComponent center bold color={'white'} medium>RENT AVAILABLE FOR:</TextComponent>

                                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                                    <CustomCheckbox title={'Bachelor?'} textSize={16} textColor={'white'}
                                                    checkedIcon={<Icon
                                                        name={updateForBachelor ? 'checkbox' : 'square-outline'}
                                                        type='ionicon'
                                                        color={updateForBachelor ? 'green' : 'white'} size={30}
                                                        onPress={() => setUpdateForBachelor(!updateForBachelor)}
                                                    />}

                                                    checked={updateForBachelor}

                                    />

                                    <CustomCheckbox title={'Family?'} textSize={16} textColor={'white'}
                                                    checkedIcon={<Icon
                                                        name={updateForFamily ? 'checkbox' : 'square-outline'}
                                                        type='ionicon'
                                                        color={updateForFamily ? 'green' : 'white'} size={30}
                                                        onPress={() => setUpdateForFamily(!updateForFamily)}
                                                    />}

                                                    checked={updateForFamily}

                                    />

                                </View>


                            </BachelorOrFamilyContainer>


                            <MainContainerForRent>
                                <TextComponent semiLarge bold>RENT/MONTH</TextComponent>
                                <Divider style={{backgroundColor: 'blue'}}/>
                                <RentContainer>
                                    <RentTextInputAndIconWrapper>
                                        <Image source={require('../../assets/icons/BDTaka.png')} style={{height: 20, width: 20, borderRadius:10}}/>

                                        <RentTextInput placeholder={'10000TK'} keyboardType={'numeric'} maxLength={5} onChangeText={(rent) => setUpdateRentPerMonth(rent)}
                                                       autoCorrect={false} defaultValue={rentPerMonth}/>

                                    </RentTextInputAndIconWrapper>

                                    <IsNegotiable>

                                        <CustomCheckbox title={'Negotiable?'} textSize={16}
                                                        checkedIcon={<Icon
                                                            name={updateIsNegotiable ? 'checkbox' : 'square-outline'}
                                                            type='ionicon'
                                                            color={updateIsNegotiable ? 'green' : 'black'} size={30}
                                                            onPress={() => setUpdateNegotiable(!updateIsNegotiable)}
                                                        />}

                                                        checked={updateIsNegotiable}

                                        />

                                    </IsNegotiable>


                                </RentContainer>
                            </MainContainerForRent>

                            <MoreDetailsContainer>
                                <TextComponent semiLarge>MORE DETAILS (ENGAGE TENANT)</TextComponent>
                                <Divider style={{backgroundColor: 'blue'}}/>

                                <WritingDetailsContainer>
                                    <Icon
                                        name='article'
                                        type='md'
                                        color='#1c3787' size={30}
                                    />

                                    <DetailsTextInput placeholder={'Add Details to engage more Tenants'} autoCapitalize={'words'} defaultValue={moreDetails}
                                                      multiline={true} onChangeText={(moreDetails) => setUpdateMoreDetails(moreDetails)}
                                                      autoCorrect={false} />

                                </WritingDetailsContainer>
                            </MoreDetailsContainer>




                        </FormViewContainer>
                    </ScrollView>



                </ModalView>
            </Modal>
        </Container>
    );
};



const StatusBarAndTopHeaderBGColor = 'red';

const Container = styled.SafeAreaView`

`;

const ModalView = styled.SafeAreaView`
backgroundColor: white;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height:100%;

`;

const ModalHeader = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal: 32px;
 paddingVertical: 12px;

`;


const ListingsImagesContainer = styled.Image`
height:200px;
width:200px;
borderRadius: 10px;

`;



const ListingImageMainContainer = styled.View`
marginHorizontal:15px;
 height: 200px;
  width: 200px;
`;


const ImagePreviewPlace = styled.View`
height: 150px;
 width: 250px;
 marginTop: 10px;
 alignSelf: center;
  backgroundColor: white;
shadowColor: black;
elevation: 6;
 shadowOpacity: 1;
 alignItems: center;
 justify-content:center;
      shadowRadius: 5.32px;
      borderRadius: 10px;
`;


const HeaderContainer = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};

 flexDirection: row;
 alignItems: center;
 paddingHorizontal: 32px;
  paddingVertical: 12px;
 justifyContent: space-between;
 borderBottomLeftRadius: 50px;
 borderBottomRightRadius: 50px;

`;

const BodyView = styled.View`



`;

const FormViewContainer = styled.ScrollView`
marginTop: 20px;
`;

const LabelAndInputWrapper = styled.View`
                        flexDirection: row;
                        borderRadius: 10px;
                        backgroundColor: #eddefc;
                        paddingHorizontal: 5px;
                        alignItems: center;
                        marginBottom: 10px;


                        `;

const TextInput = styled.TextInput`

paddingRight: 10px;
fontSize: 18px;
               

                        `;

const CheckBoxWrapper = styled.View`

backgroundColor:#eddefc;
paddingHorizontal: 10px;
marginTop: 10px;
alignItems: center;
justifyContent: center;
borderBottomRightRadius: 15px;
borderTopRightRadius: 15px;

`;



const CheckBoxAndRoomWrapper = styled.View`
flexDirection: row;

justifyContent: space-between;


`;

const RoomInputWrapper = styled.View`
alignItems: center;
backgroundColor:#eddefc;
paddingVertical: 10px;
paddingHorizontal: 10px;
marginTop: 10px;
justifyContent: center;
borderBottomLeftRadius: 15px;
borderTopLeftRadius: 15px;
`;

const FacilitiesContainer = styled.View`
marginTop: 15px;
`


const RoomLabelAndInputWrapper = styled.View`
                        flexDirection: row;
                        borderRadius: 10px;
                        backgroundColor: white;
                        paddingHorizontal: 5px;
                        alignItems: center;
                        marginVertical: 5px;
                        alignSelf: flex-start;
                     


                        `;

const RoomInput = styled.TextInput`

paddingRight: 10px;

fontSize: 18px;
               

                        `;

const MainContainerForRent = styled.View`
marginTop: 20px;
`;

const RentContainer = styled.View`
marginVertical: 10px;
backgroundColor: #014172;
paddingVertical: 10px;
paddingHorizontal: 10px;
borderRadius: 10px;
flexDirection: row;
alignItems: center;
justifyContent: space-between;

`;



const RentTextInputAndIconWrapper= styled.View`
  flexDirection: row;
                        borderRadius: 10px;
                        backgroundColor: white;
                        paddingHorizontal: 5px;
                        alignItems: center;
                        marginVertical: 5px;
                        alignSelf: flex-start;
`;

const RentTextInput = styled.TextInput`
paddingRight: 10px;
fontSize: 18px;
`;


const BachelorOrFamilyContainer = styled.View`
paddingHorizontal: 10px;
backgroundColor: #f7047e;
borderRadius: 10px;
marginTop: 20px;

`;


const IsNegotiable = styled.View`
paddingHorizontal: 10px;
backgroundColor: white;
borderRadius: 10px;

`;


const MoreDetailsContainer= styled.View`
marginTop: 15px;
marginBottom: 15px;

`;

const WritingDetailsContainer = styled.View`
 flexDirection: row;
 overflow: hidden;
                        borderRadius: 10px;
                        backgroundColor: #eddefc;
                        paddingHorizontal: 5px;
                        alignItems: center;
                        marginBottom: 10px;
                        marginVertical: 10px;

`;

const DetailsTextInput = styled.TextInput`
paddingHorizontal: 10px;
fontSize: 18px;
`

const UpdateListingButton = styled.TouchableOpacity`
backgroundColor: #1c3787;
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 10px;
`


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'white',
    size: 'small',


}))``;

