import React, {useState} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";

import {View, TouchableOpacity, StatusBar, Image, FlatList} from 'react-native';
import {Icon} from "react-native-elements";
import ImagePicker from "react-native-customized-image-picker";
import _ from "lodash";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function AddListingScreen(props) {

    const [listingImages, setListingImages] = useState([]);

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
                console.log("removed all tmp images from tmp directory");
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




    return (
        <Container>
            <StatusBar backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <HeaderContainer>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>

                    <Icon
                        name={'chevron-down-circle'}
                        type='ionicon'
                        color={'black'} size={40}
                    />

                </TouchableOpacity>

                <TextComponent medium bold>ADD LISTING</TextComponent>

            </HeaderContainer>

            <BodyView>

                <View style={{flexDirection: "row", alignItems: "center", justifyContent: 'space-between'}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Icon raised name={'add-photo-alternate'} type={'md'} size={24} onPress={() => pickImage()} disabled={listingImages && listingImages.length === 5}/>
                        <TextComponent bold color={listingImages.length === 5 ? 'grey': 'black'}>
                            Select Image: {listingImages ? listingImages.length : 0} of 5 (Min: 3)
                        </TextComponent>
                    </View>


                    <Icon raised name={'image-not-supported'} type={'material'} color={'red'}
                          size={24} onPress={() => removeAllImagesOnce()} disabled={listingImages.length === 0}/>

                </View>


                {listingImages.length ? <FlatList data={listingImages} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                                           showsHorizontalScrollIndicator={false}/>
                    :
                    <ImagePreviewPlace>
                        <TextComponent center>No Image selected yet</TextComponent>
                    </ImagePreviewPlace>}

            </BodyView>



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


const StatusBarAndTopHeaderBGColor = '#d0ff00';


const Container = styled.View`
flex:1;

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
paddingHorizontal : 10px;



`;



