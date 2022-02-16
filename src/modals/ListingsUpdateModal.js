import React, {useContext, useRef, useState} from "react";
import {View, Modal, ScrollView, FlatList, ToastAndroid, ActivityIndicator, TouchableOpacity} from "react-native";
import { Image} from "react-native-elements";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {FirebaseContext} from "../context/FirebaseContext";
import ImagePicker from "react-native-customized-image-picker";
import {v4 as uuidv4} from "uuid";
import _ from "lodash";
import {CustomCheckbox} from "../components/custom-checkbox/CustomCheckbox";
import {Colors} from "../components/utilities/Colors";
import {TextInput} from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import {SearchPlaces} from "../components/utilities/SearchPlaces";

export const ListingsUpdateModal = (props) => {
    const searchBottomSheet = useRef();
    const {modalVisible, modalHide, listingsData} = props;
    const {images, address, roomNumbers, facilities, forBachelor, forFamily, rentPerMonth, isNegotiable, moreDetails, listingId, location} = listingsData;


    const firebase = useContext(FirebaseContext);

    const [updateFacilities, setUpdateFacilities] = useState({
        isFireSafety: facilities.isFireSafety,
        hasBalcony: facilities.hasBalcony,
        isNearToMainRoad: facilities.isNearToMainRoad,
        hasCCTV: facilities.hasCCTV
    });

    const [updateRoomNumbers, setUpdateRoomNumbers] = useState({
        dining: roomNumbers.dining,
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

    const removeImageFromArray = (id) => {
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
            <ListingImageMainContainer>

                <Image source={{uri: image.imageUrl}} style={{ height: 200, width: 200, borderRadius: 10}}  PlaceholderContent={<ActivityIndicator size="large" color="white"/>}/>

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
        const isAddressSame = address === updateAddress.trim(),
            isFacilitiesSame = _.isEqual(facilities, updateFacilities),
            isSameRoom = _.isEqual(roomNumbers, updateRoomNumbers),
            isSameBachelor = forBachelor === updateForBachelor,
            isSameFamily = forFamily === updateForFamily,
            isSameRent = rentPerMonth === updateRentPerMonth.trim(),
            isSameNegotiable = isNegotiable === updateIsNegotiable,
            isSameDesc = moreDetails === updateMoreDetails.trim(),
            isSameLocation = _.isEqual(location,getSelectPlaceName);

        return (differenceImages && isAddressSame && isFacilitiesSame && isSameBachelor && isSameDesc && isSameFamily && isSameRent && isSameNegotiable && isSameRoom && isSameLocation);

    }

    const disableUpdate = () => {

        return (getSelectPlaceName === '' || (updateForBachelor === false && updateForFamily === false) ||  listingImages.length < 3 || (updateRentPerMonth === 0 || updateRentPerMonth.trim() ==='' || updateRentPerMonth.length < 3) || updateMoreDetails === '' || updateAddress === '' ||
            ((updateRoomNumbers.washRoom === 0 || updateRoomNumbers.washRoom === '') || (updateRoomNumbers.dining === 0 || updateRoomNumbers.dining === '') || (updateRoomNumbers.bedRoom === 0 || updateRoomNumbers.bedRoom === '')));
    }

    // console.log('disableUpdateIfSameValue=>', disableUpdateIfSameValue());


    //update method
    const updateListing = async (listingId) => {
        setLoading(true);
        try {

            const isNewImages = _.differenceWith(listingImages, images, _.isEqual),
                differenceImages = _.isEqual(listingImages, images),
                isSameLocation = _.isEqual(location,getSelectPlaceName);

            if((isNewImages.length !== 0) && !differenceImages) await  firebase.updateListingImages(isNewImages,removedImageId, getImagesAfterRemove, listingId);

            if(address !== updateAddress) await firebase.updateListingAddress(updateAddress,listingId);

            if(!(_.isEqual(facilities, updateFacilities))) await firebase.updateListingFacilities(updateFacilities,listingId);

            if(!(_.isEqual(roomNumbers, updateRoomNumbers))) await firebase.updateListingRoomNumbers(updateRoomNumbers,listingId);

            if(forBachelor !== updateForBachelor || forFamily !== updateForFamily) await firebase.updateListingRentType(updateForBachelor, updateForFamily ,listingId);

            if(rentPerMonth !== updateRentPerMonth) await firebase.updateListingRent(updateRentPerMonth ,listingId);

            if(isNegotiable !== updateIsNegotiable) await firebase.updateListingRentNegotiable(updateIsNegotiable ,listingId);

            if(moreDetails !== updateMoreDetails) await firebase.updateListingMoreDetails(updateMoreDetails ,listingId);

            if(!isSameLocation) await firebase.updateListingLocation(getSelectPlaceName, listingId);

        }catch (e) {
            ToastAndroid.show(e.message, ToastAndroid.LONG);
            setLoading(false);

        } finally {
            removeAllImagesOnce();
            setLoading(false);
            modalHide();
            //closeModalAndUpdateState();
        }

    };


    const closeModalAndUpdateState = () => {

        setListingImages(images);
        setUpdateFacilities({
            hasBalcony: facilities.hasBalcony,
            isNearToMainRoad: facilities.isNearToMainRoad,
            hasCCTV: facilities.hasCCTV,
            isFireSafety: facilities.isFireSafety
        });

        setUpdateRoomNumbers({
            dining: roomNumbers.dining,
            bedRoom: roomNumbers.bedRoom,
            washRoom: roomNumbers.washRoom
        });

        setUpdateForBachelor(forBachelor);
        setUpdateForFamily(forFamily);
        setUpdateAddress(address);
        setSelectPlaceName(location)
        setUpdateMoreDetails(moreDetails);
        setUpdateRentPerMonth(rentPerMonth);
        setUpdateNegotiable(isNegotiable);
        setImagesAfterRemoved([]);
        setRemovedImageId([]);

        removeAllImagesOnce();
        modalHide();

    };

    const [getSelectPlaceName, setSelectPlaceName] = useState(location);


    return (
        <Container>
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
                        <Icon name={'chevron-down-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => closeModalAndUpdateState()}/>

                        <UpdateListingButton disabled={disableUpdateIfSameValue() || disableUpdate() || loading} onPress={() => updateListing(listingId)}>
                            { loading ? <Loading/> :
                                <TextComponent bold medium color={disableUpdateIfSameValue() || disableUpdate() ? 'grey':'white'}>UPDATE LISTING</TextComponent>
                            }
                        </UpdateListingButton>
                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>
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

                        <RBSheet
                            ref={searchBottomSheet}
                            closeOnDragDown={true}
                            closeOnPressMask={true}
                            dragFromTopOnly={true}
                            height={320}

                            customStyles={{
                                wrapper: {
                                    backgroundColor: "transparent"
                                },
                                container: {backgroundColor: 'rgba(0,0,0,0.8)', borderTopLeftRadius: 20, borderTopRightRadius: 20},
                                draggableIcon: {
                                    backgroundColor: "white"
                                }
                            }}
                        >
                            <SearchPlaces updateQuery={setSelectPlaceName} closeBottomSheet={searchBottomSheet}/>
                        </RBSheet>

                        <SelectPlacesContainer>

                            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', width:'100%'}}
                                              onPress={() => searchBottomSheet.current.open()}>
                                <Icon
                                    name='location'
                                    type='ionicon'
                                    color={Colors.buttonPrimary} size={25}/>
                                { getSelectPlaceName !== '' ?
                                    <View>
                                        <TextComponent semiLarge color={Colors.buttonPrimary}>
                                            {getSelectPlaceName.city === getSelectPlaceName.county ? getSelectPlaceName.city : `${getSelectPlaceName.city}, ${getSelectPlaceName.county}`}
                                        </TextComponent>
                                        <TextComponent color={'rgba(0,0,0,0.5)'}>
                                            {getSelectPlaceName.state}, {getSelectPlaceName.country}
                                        </TextComponent>

                                    </View>

                                    :  <TextComponent semiLarge color={'rgba(0,0,0,0.5)'}>Select City or Place</TextComponent>

                                }


                            </TouchableOpacity>


                        </SelectPlacesContainer>

                        <FormViewContainer showsVerticalScrollIndicator={false}>

                            <TextInput style={{backgroundColor: 'lavender', fontSize: 20, marginBottom: 10, color: Colors.buttonPrimary, marginHorizontal: 5}}
                                       mode={'outlined'}
                                       label="Address"
                                       autoCorrect={false}
                                       placeholder={address} autoCapitalize={'words'} dataDetectorTypes={'address'}
                                       multiline={true} onChangeText={(address) => setUpdateAddress(address)} defaultValue={address}
                                       theme={{ colors: { placeholder: 'rgba(0,0,0,0.5)', text: Colors.buttonPrimary, primary: Colors.buttonPrimary, underlineColor:'transparent'}}}

                                       left={
                                           <TextInput.Icon
                                               name={()=>

                                                   <Icon
                                                       name='home'
                                                       type='ionicon'
                                                       color={Colors.buttonPrimary} size={25}/>
                                               }
                                           />
                                       }
                            />



                            <FacilitiesContainer>


                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5}}>
                                    <TextComponent semiLarge bold>FACILITIES</TextComponent>
                                    <TextComponent semiLarge bold>ROOMS</TextComponent>
                                </View>

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

                                        <TextInput style={{backgroundColor: 'white', fontSize: 20, marginBottom: 10, color: Colors.buttonPrimary, width: 150}}
                                                   mode={'outlined'}
                                                   label={"Bed Room"}
                                                   autoCorrect={false}
                                                   autoCompleteType={'off'}
                                                   defaultValue={roomNumbers.bedRoom}
                                                   placeholder={'1'} keyboardType={'numeric'} maxLength={1}
                                                   onChangeText={(bedRoom) => setUpdateRoomNumbers(prev => ({...prev, bedRoom: bedRoom}))}
                                                   theme={{ colors: { placeholder: 'rgba(0,0,0,0.5)', text: Colors.buttonPrimary, primary: Colors.buttonPrimary, underlineColor:'transparent'}}}

                                                   left={
                                                       <TextInput.Icon
                                                           name={()=>

                                                               <Icon
                                                                   name='bed-outline'
                                                                   type='ionicon'
                                                                   color={Colors.buttonPrimary} size={25}/>
                                                           }
                                                       />
                                                   }
                                        />



                                        <TextInput style={{backgroundColor: 'white', fontSize: 20, marginBottom: 10, color: Colors.buttonPrimary, width: 150, overflow: 'hidden'}}
                                                   mode={'outlined'}
                                                   label="Dining"
                                                   autoCorrect={false}
                                                   autoCompleteType={'off'}
                                                   defaultValue={roomNumbers.dining}
                                                   placeholder={'1'} keyboardType={'numeric'} maxLength={1}
                                                   onChangeText={(dining) => setUpdateRoomNumbers(prev => ({...prev, dining: dining}))}
                                                   theme={{ colors: { placeholder: 'rgba(0,0,0,0.5)', text: Colors.buttonPrimary, primary: Colors.buttonPrimary, underlineColor:'transparent'}}}

                                                   left={
                                                       <TextInput.Icon
                                                           name={()=>

                                                               <Icon
                                                                   name='restaurant-outline'
                                                                   type='ionicon'
                                                                   color={Colors.buttonPrimary} size={25}/>
                                                           }
                                                       />
                                                   }
                                        />


                                        <TextInput style={{backgroundColor: 'white', fontSize: 20, marginBottom: 10, color: Colors.buttonPrimary, width: 150, overflow: 'hidden'}}
                                                   mode={'outlined'}
                                                   label="Washroom"
                                                   autoCorrect={false}
                                                   autoCompleteType={'off'}
                                                   defaultValue={roomNumbers.washRoom}
                                                   placeholder={'1'} keyboardType={'numeric'} maxLength={1}
                                                   onChangeText={(washRoom) => setUpdateRoomNumbers(prev => ({...prev, washRoom: washRoom}))}
                                                   theme={{ colors: { placeholder: 'rgba(0,0,0,0.5)', text: Colors.buttonPrimary, primary: Colors.buttonPrimary, underlineColor:'transparent'}}}

                                                   left={
                                                       <TextInput.Icon
                                                           name={()=>

                                                               <Icon
                                                                   name='toilet'
                                                                   type='font-awesome-5'
                                                                   color={Colors.buttonPrimary} size={25}/>
                                                           }
                                                       />
                                                   }
                                        />


                                    </RoomInputWrapper>

                                </CheckBoxAndRoomWrapper>


                            </FacilitiesContainer>

                            <BachelorOrFamilyContainer>

                                <TextComponent center bold color={'white'} medium>RENT AVAILABLE FOR</TextComponent>

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
                                <View style={{marginHorizontal: 5}}>
                                    <TextComponent semiLarge bold>RENT/MONTH</TextComponent>
                                </View>
                                <RentContainer>

                                    <TextInput style={{backgroundColor: 'rgba(1,65, 114, 1)', fontSize: 20, marginBottom: 10, width: 150, overflow: 'hidden'}}
                                               mode={'outlined'}
                                               label="Rent"
                                               autoCorrect={false}
                                               autoCompleteType={'off'}
                                               placeholder={rentPerMonth} keyboardType={'numeric'} maxLength={5}
                                               defaultValue={rentPerMonth}
                                               onChangeText={(rent) => setUpdateRentPerMonth(rent)}
                                               theme={{ colors: { placeholder: 'rgba(255,255,255,0.5)', text: 'white', primary: 'white', underlineColor:'transparent'}}}

                                               left={
                                                   <TextInput.Icon name={ () =>
                                                       <TextComponent bold semiLarge color={'white'}>TK.</TextComponent>
                                                   }
                                                   />

                                               }
                                    />

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
                                <TextComponent semiLarge bold>MORE DETAILS (ENGAGE TENANT)</TextComponent>

                                <WritingDetailsContainer>
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
backgroundColor: ${Colors.primaryBody};
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal: 20px;
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


const BodyView = styled.View`
marginHorizontal: 5px;



`;

const FormViewContainer = styled.ScrollView`
marginTop: 20px;
`;



const CheckBoxWrapper = styled.View`

backgroundColor:#eddefc;
paddingHorizontal: 5px;
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
paddingHorizontal: 5px;
marginTop: 10px;
justifyContent: center;
borderBottomLeftRadius: 15px;
borderTopLeftRadius: 15px;
`;

const FacilitiesContainer = styled.View`
marginTop: 15px;
`


const MainContainerForRent = styled.View`
marginTop: 20px;
`;

const RentContainer = styled.View`
marginVertical: 10px;
backgroundColor: #014172;
paddingVertical: 10px;
paddingHorizontal: 10px;
flexDirection: row;
alignItems: center;
justifyContent: space-between;

`;


const BachelorOrFamilyContainer = styled.View`
paddingHorizontal: 5px;
backgroundColor: #f7047e;
marginTop: 20px;

`;


const IsNegotiable = styled.View`
paddingHorizontal: 10px;
backgroundColor: white;
borderRadius: 10px;

`;


const MoreDetailsContainer= styled.View`
marginVertical: 15px;
marginHorizontal: 5px;

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
backgroundColor: ${Colors.buttonPrimary};
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 10px;
`;

const SelectPlacesContainer = styled.View`
backgroundColor: lavender;
 paddingVertical: 13px;
  borderRadius:10px;
   paddingHorizontal: 10px;
    display: flex;
     flexDirection: row;
      marginTop: 20px;
      alignItems: center;
      justifyContent: space-between;
      height: 60px;
      marginHorizontal: 5px;
                      

`;


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'white',
    size: 'small',


}))``;

