import React, {useState, useContext, useRef} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";

import {View, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import { Divider } from 'react-native-elements';
import {Icon} from "react-native-elements";
import ImagePicker from "react-native-customized-image-picker";
import _ from "lodash";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {CustomCheckbox} from "../components/custom-checkbox/CustomCheckbox";
import {FirebaseContext} from "../context/FirebaseContext";
import {Colors} from "../components/utilities/Colors";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import { TextInput} from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import {SearchPlaces} from "../components/utilities/SearchPlaces";


export default function AddListingScreen(props) {
    const searchBottomSheet = useRef();

    const firebase = useContext(FirebaseContext);

    const [facilities, setFacilities] = useState({
        isFireSafety: false,
        hasBalcony: false,
        isNearToMainRoad: false,
        hasCCTV: false
    });

    const [roomNumbers, setRoomNumbers] = useState({
        dining: 0,
        bedRoom: 0,
        washRoom: 0
    })

    const [forBachelor, setForBachelor] = useState(false);
    const [forFamily, setForFamily] = useState(false);
    const [address, setAddress] = useState('');
    const [moreDetails, setMoreDetails] = useState('');
    const [rentPerMonth, setRentPerMonth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isNegotiable, setNegotiable] = useState(false);


    const [listingImages, setListingImages] = useState([]);

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
                    imageUri: images[0].path}]);
            }
            else if((images.length > 1) && (listingImages.length >= 1)) {

                let imageData=[];

                _.each(images, (image) => {

                    imageData.push({
                        imageId: uuidv4(),
                        imageUri: image.path

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
                        imageUri: image.path
                    })

                });

                setListingImages(...listingImages, imageData)
            }


        });
    }


    const removeAllImagesOnce = () => {
        ImagePicker.clean()
            .then(() => {
                setListingImages([])
            })
            .catch(e => {
                console.log(e);
            });

    }

    const removeImageFromArray = (id) =>{
        let clonedListingImage = _.clone(listingImages);

        _.remove(clonedListingImage, {imageId: id});
        setListingImages(clonedListingImage);


    }

    const renderImage= (image) => {

        return(
            <ListingImageMainContainer >


                <ListingsImagesContainer source={{uri: image.imageUri}}/>
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


    //adding to firebase

    const addListing = async () => {
        setLoading(true);
        try {
            const location = getSelectPlaceName;
            const listingData =  {facilities, roomNumbers, forBachelor, moreDetails, address, rentPerMonth, listingImages, isNegotiable, forFamily, location}
            const isListingAdded = await firebase.addListing(listingData);
            if(isListingAdded) props.navigation.goBack();
        } catch (error) {
            alert(error.message);

        } finally {
            removeAllImagesOnce();
            setLoading(false);
        }
    }



    const disableSubmit = () => {

        return ((forBachelor === false && forFamily === false) || listingImages.length < 3 || getSelectPlaceName === '' || rentPerMonth === 0 || moreDetails === '' || address === '' || (roomNumbers.washRoom === 0 || roomNumbers.dining === 0 || roomNumbers.bedRoom === 0))
    }


    //open search Modal

    const [openPlaceSearchModal, setPlaceSearchModal] = useState(false);

    const closePlaceSearchModal = () => {
        setPlaceSearchModal(false);
    }

    const [getSelectPlaceName, setSelectPlaceName] = useState('');


    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryBody}/>
            <HeaderContainer>

                    <Icon
                        name={'chevron-down-outline'}
                        type='ionicon'
                        color={'white'} size={35} onPress={() => props.navigation.goBack()}
                    />

                <AddListingButton onPress={() => addListing()} disabled={disableSubmit() || loading}
                                  style={{backgroundColor : disableSubmit() || loading ? Colors.buttonPrimary : Colors.appIconColor}}>
                    {loading ? <Loading/> : <TextComponent medium bold color={disableSubmit() ? 'grey' : 'white'}>ADD LISTING</TextComponent> }
                </AddListingButton>

            </HeaderContainer>

            <FormViewContainer showsVerticalScrollIndicator={false}>

                <BodyView>

                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: 'space-between'}}>
                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            <Icon raised name={'add-photo-alternate'} type={'md'} size={20} onPress={() => pickImage()} disabled={listingImages && listingImages.length === 5}/>
                            <TextComponent bold color={listingImages.length === 5 ? 'grey': 'black'}>
                                Select Image: {listingImages ? listingImages.length : 0} of 5 (Min: 3)
                            </TextComponent>
                        </View>


                        <Icon raised name={'image-not-supported'} type={'material'} color={'red'}
                              size={20} onPress={() => removeAllImagesOnce()} disabled={listingImages.length === 0}/>

                    </View>


                    {listingImages.length ? <FlatList data={listingImages} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
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


                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', width: getSelectPlaceName === '' ? '100%' : '80%'}}
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

                    { getSelectPlaceName !== '' ?
                        <Icon
                            name='close'
                            type='ionicon'
                            color={'rgba(0,0,0, 0.5)'} size={25} onPress={() => setSelectPlaceName('')}/> : null
                    }

                </SelectPlacesContainer>


                <TextInput style={{backgroundColor: 'lavender', fontSize: 20, marginBottom: 10, color: Colors.buttonPrimary, marginHorizontal: 5}}
                           mode={'outlined'}
                           label="Write specific address"
                           autoCorrect={false}
                           placeholder={'House No., Block No., Road No.'} autoCapitalize={'words'} dataDetectorTypes={'address'}
                           onChangeText={(address) => setAddress(address)}
                           multiline={true}
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
                                                name={facilities.isFireSafety ? 'checkbox' : 'square-outline'}
                                                type='ionicon'
                                                color={facilities.isFireSafety ? 'green' : 'black'} size={30}
                                                onPress={() => setFacilities(prev => ({...prev,
                                                    isFireSafety: !facilities.isFireSafety
                                                }))}
                                            />}

                                            checked={facilities.isFireSafety}

                            />



                            <CustomCheckbox title={'Balcony'} textSize={18}
                                            checkedIcon={<Icon
                                                name={facilities.hasBalcony ? 'checkbox' : 'square-outline'}
                                                type='ionicon'
                                                color={facilities.hasBalcony ? 'green' : 'black'} size={30}
                                                onPress={() => setFacilities(prev => ({...prev,
                                                    hasBalcony: !facilities.hasBalcony
                                                }))}
                                            />}

                                            checked={facilities.hasBalcony}

                            />


                            <CustomCheckbox title={'Near Main Road'} textSize={18}
                                            checkedIcon={<Icon
                                                name={facilities.isNearToMainRoad ? 'checkbox' : 'square-outline'}
                                                type='ionicon'
                                                color={facilities.isNearToMainRoad ? 'green' : 'black'} size={30}
                                                onPress={() => setFacilities(prev => ({...prev,
                                                    isNearToMainRoad: !facilities.isNearToMainRoad
                                                }))}
                                            />}

                                            checked={facilities.isNearToMainRoad}

                            />


                            <CustomCheckbox title={'CCTV'} textSize={18}
                                            checkedIcon={<Icon
                                                name={facilities.hasCCTV ? 'checkbox' : 'square-outline'}
                                                type='ionicon'
                                                color={facilities.hasCCTV ? 'green' : 'black'} size={30}
                                                onPress={() => setFacilities(prev => ({...prev,
                                                    hasCCTV: !facilities.hasCCTV
                                                }))}
                                            />}

                                            checked={facilities.hasCCTV}

                            />

                        </CheckBoxWrapper>

                        <RoomInputWrapper>

                            <TextInput style={{backgroundColor: 'white', fontSize: 20, marginBottom: 10, color: Colors.buttonPrimary, width: 150}}
                                       mode={'outlined'}
                                       label="Bed Room"
                                       autoCorrect={false}
                                       autoCompleteType={'off'}
                                       placeholder={'1'} keyboardType={'numeric'} maxLength={1}
                                       onChangeText={(bedRoom) => setRoomNumbers(prev => ({...prev, bedRoom: bedRoom}))}
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
                                       label="dining"
                                       autoCorrect={false}
                                       autoCompleteType={'off'}
                                       placeholder={'1'} keyboardType={'numeric'} maxLength={1}
                                       onChangeText={(dining) => setRoomNumbers(prev => ({...prev, dining: dining}))}
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
                                       placeholder={'1'} keyboardType={'numeric'} maxLength={1}
                                       onChangeText={(washRoom) => setRoomNumbers(prev => ({...prev, washRoom: washRoom}))}
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
                                            name={forBachelor ? 'checkbox' : 'square-outline'}
                                            type='ionicon'
                                            color={forBachelor ? 'green' : 'white'} size={30}
                                            onPress={() => setForBachelor(!forBachelor)}
                                        />}

                                        checked={forBachelor}

                        />

                        <CustomCheckbox title={'Family?'} textSize={16} textColor={'white'}
                                        checkedIcon={<Icon
                                            name={forFamily ? 'checkbox' : 'square-outline'}
                                            type='ionicon'
                                            color={forFamily ? 'green' : 'white'} size={30}
                                            onPress={() => setForFamily(!forFamily)}
                                        />}

                                        checked={forFamily}

                        />

                    </View>


                </BachelorOrFamilyContainer>


                <MainContainerForRent>
                    <View style={styles.textMargin}>
                        <TextComponent semiLarge bold>RENT/MONTH</TextComponent>
                    </View>

                    <RentContainer>

                        <TextInput style={{backgroundColor: 'rgba(1,65, 114, 1)', fontSize: 20, marginBottom: 10, width: 150, overflow: 'hidden'}}
                                   mode={'outlined'}
                                   label="Rent"
                                   autoCorrect={false}
                                   autoCompleteType={'off'}
                                   placeholder={'10000'} keyboardType={'numeric'} maxLength={5}
                                   onChangeText={(rent) => setRentPerMonth(rent)}
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
                                                name={isNegotiable ? 'checkbox' : 'square-outline'}
                                                type='ionicon'
                                                color={isNegotiable ? 'green' : 'black'} size={30}
                                                onPress={() => setNegotiable(!isNegotiable)}
                                            />}

                                            checked={isNegotiable}

                            />

                        </IsNegotiable>


                    </RentContainer>
                </MainContainerForRent>

                <MoreDetailsContainer>
                    <TextComponent semiLarge bold>MORE DETAILS (ENGAGE TENANT)</TextComponent>

                    <WritingDetailsContainer>
                        <DetailsTextInput placeholder={'Add Details to engage more Tenants'} autoCapitalize={'words'}
                                          multiline={true} onChangeText={(moreDetails) => setMoreDetails(moreDetails)}
                                          autoCorrect={false} />

                    </WritingDetailsContainer>
                </MoreDetailsContainer>




            </FormViewContainer>

        </Container>
    );
};


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




const Container = styled.View`
flex:1;

`;

const HeaderContainer = styled.View`
backgroundColor: ${Colors.primaryBody};

 flexDirection: row;
 alignItems: center;
 paddingHorizontal: 20px;
  paddingVertical: 10px;
 justifyContent: space-between;

`;

const BodyView = styled.View`
marginBottom: 20px;
paddingHorizontal : 5px;

`;

const FormViewContainer = styled.ScrollView`

`;


// const TextInput = styled.TextInput`
//
// paddingRight: 10px;
// fontSize: 18px;
//
//
//                         `;

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


const RoomLabelAndInputWrapper = styled.View`
                        flexDirection: row;
                        borderRadius: 10px;
                        backgroundColor: white;
                        paddingHorizontal: 5px;
                        alignItems: center;
                        marginVertical: 5px;
                        alignSelf: flex-start;
                     


                        `;


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
marginTop: 15px;
marginHorizontal: 5px;
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

const AddListingButton = styled.TouchableOpacity`
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 10px;
`;

const SelectPlacesContainer = styled.View`
backgroundColor: lavender;
 paddingVertical: 13px;
  borderRadius:10px;
  marginHorizontal: 5px;
   paddingHorizontal: 10px;
    display: flex;
     flexDirection: row;
      marginBottom: 10px;
      alignItems: center;
      justifyContent: space-between;
      height: 60px;
                      

`


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'white',
    size: 'small',


}))``;

const styles = StyleSheet.create({
    textMargin: {
        marginHorizontal: 5
    }
})
