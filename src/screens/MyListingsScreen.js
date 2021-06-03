import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {FlatList, View} from 'react-native';
import {Icon} from "react-native-elements";
import {FirebaseContext} from "../context/FirebaseContext";
import firestore from "@react-native-firebase/firestore";
import {EachListing} from "../components/listings/EachListing";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import LottieView from "lottie-react-native";

export default function MyListingScreen(props) {
    const firebase =  useContext(FirebaseContext);
    const currentUserId = firebase.getCurrentUser().uid;


    const [ListingsData, setListingsData] = useState(null);

    console.log('ListingsData=>', ListingsData);




    useEffect(() => {

        const subscriber = firestore().collection('listings').orderBy('postedTime', 'desc').where('userId', '==', currentUserId).onSnapshot(
            docs=> {
                let data=[];
                if(docs) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id,
                            listingId: doc.data().listingId,
                            postedTime: doc.data().postedTime,
                            address: doc.data().address,
                            images: doc.data().images,
                            userId: doc.data().userId,
                            roomNumbers: doc.data().roomNumbers,
                            facilities: doc.data().facilities,
                            forBachelor: doc.data().forBachelor,
                            forFamily: doc.data().forFamily,
                            rentPerMonth: doc.data().rentPerMonth,
                            isNegotiable: doc.data().isNegotiable,
                            usersInFav: doc.data().usersInFav,
                            moreDetails: doc.data().moreDetails,
                            location: doc.data().location
                        });

                    });
                    setListingsData(data);
                }

            });

        return () => subscriber();


    }, []);

    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <HeaderContainer>
                <Icon
                    name={'chevron-back-outline'}
                    type='ionicon'
                    color={'white'} size={35}
                    onPress={() => props.navigation.goBack()}
                />
                <TextComponent medium bold color={'white'}>MY LISTINGS</TextComponent>

            </HeaderContainer>

            {
                ListingsData?.length > 0 ?
                    <FlatList data={ListingsData} renderItem={({item}) => <EachListing item = {item} navigation={props.navigation}/> } keyExtractor={item => item.id} showsVerticalScrollIndicator={false}/>
                    : ListingsData === null ?
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <LoadingView>
                            <LottieView source={require('../../assets/lottie-animations/loading.json')} autoPlay loop style={{width: 100}} />
                        </LoadingView>
                    </View>

                :
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <TextComponent medium>You don't add any listing yet. Please Add Listing.</TextComponent>
                </View>
            }

        </Container>
    )

}
const StatusBarAndTopHeaderBGColor = Colors.primaryStatusbarColor;


const Container = styled.SafeAreaView`
flex:1;

`;

const HeaderContainer = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};

 flexDirection: row;
 alignItems: center;
 paddingHorizontal: 20px;
 paddingVertical: 10px;
 justifyContent: space-between;


`;

const LoadingView = styled.View`
alignItems: center;
justifyContent: center;
`;





