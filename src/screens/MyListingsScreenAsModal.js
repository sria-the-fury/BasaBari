import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Text, TouchableOpacity, StatusBar, FlatList, Image} from 'react-native';
import {Icon} from "react-native-elements";
import {FirebaseContext} from "../context/FirebaseContext";
import firestore from "@react-native-firebase/firestore";
import {EachListing} from "../components/listings/EachListing";

export default function MyListingScreenAsModal(props) {
    const firebase =  useContext(FirebaseContext);
    const currentUserId = firebase.getCurrentUser().uid;


    const [ListingsData, setListingsData] = useState(null);




    useEffect(() => {

        const subscriber = firestore().collection('listings').where('userId', '==', currentUserId).onSnapshot(
            docs=> {
                let data=[];
                if(!docs.empty) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id,
                            postedTime: doc.data().postedTime,
                            address: doc.data().address,
                            images: doc.data().images,
                            userId: doc.data().userId,
                            roomNumbers: doc.data().roomNumbers,
                            facilities: doc.data().facilities,
                            forBachelor: doc.data().availableForBachelor,
                            forFamily: doc.data().forFamily,
                            rentPerMonth: doc.data().rentPerMonth,
                            isNegotiable: doc.data().isNegotiable
                        });

                    });
                    setListingsData(data);
                }


            });

        return () => subscriber();


    }, []);


    return (
        <Container>
            <StatusBar backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <HeaderContainer>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>

                    <Icon
                        name={'chevron-down-circle'}
                        type='ionicon'
                        color={'white'} size={40}
                    />

                </TouchableOpacity>

                <TextComponent medium bold color={'white'}>MY LISTINGS</TextComponent>

            </HeaderContainer>
            <FlatList data={ListingsData} renderItem={({item}) => <EachListing item = {item}/> } keyExtractor={item => item.id.toString()} showsVerticalScrollIndicator={false}/>
        </Container>
    )
}
const StatusBarAndTopHeaderBGColor = 'red';


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


`;





