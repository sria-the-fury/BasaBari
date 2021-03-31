import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import { TouchableOpacity, FlatList} from 'react-native';
import {Icon} from "react-native-elements";
import {FirebaseContext} from "../context/FirebaseContext";
import firestore from "@react-native-firebase/firestore";
import {EachListing} from "../components/listings/EachListing";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";

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
                            isNegotiable: doc.data().isNegotiable,
                            usersInFav: doc.data().usersInFav,
                            moreDetails: doc.data().moreDetails
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
                <TouchableOpacity onPress={() => props.navigation.goBack()}>

                    <Icon
                        name={'chevron-forward-circle'}
                        type='ionicon'
                        color={'white'} size={40}
                    />

                </TouchableOpacity>

                <TextComponent medium bold color={'white'}>MY LISTINGS</TextComponent>

            </HeaderContainer>
            <FlatList data={ListingsData} renderItem={({item}) => <EachListing item = {item}/> } keyExtractor={item => item.id} showsVerticalScrollIndicator={false}/>
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
 paddingHorizontal: 32px;
 paddingVertical: 12px;
 justifyContent: space-between;


`;





