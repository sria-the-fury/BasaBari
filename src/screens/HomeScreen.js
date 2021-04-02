import React, {useState, useEffect} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {TouchableOpacity, FlatList} from 'react-native';
import {Icon} from "react-native-elements";
import {EachListing} from "../components/listings/EachListing";
import firestore from "@react-native-firebase/firestore";
import {FirebaseContext} from "../context/FirebaseContext";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import {SearchListingsModal} from "../modals/SearchListingsModal";

export default function  HomeScreen (props) {

    const [ListingsData, setListingsData] = useState(null);

    //open search Modal

    const [openSearchModal, setSearchModal] = useState(false);

    const closeSearchModal = () => {
        setSearchModal(false);
    }




    useEffect(() => {

        const subscriber = firestore().collection('listings').orderBy('postedTime', 'desc').onSnapshot(
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
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryStatusbarColor}/>
            <HeaderContainer>
                <TouchableOpacity  style={{backgroundColor: Colors.primaryBodyLight,borderWidth: 1,
                    borderColor: 'grey', borderRadius: 50, width: '80%', height: 50, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10 }}
                onPress={() => setSearchModal(true)}
                >
                    <Icon name={'search-outline'} color={'grey'} type={'ionicon'} size={25}/>
                    <TextComponent bold color={'grey'} medium>Search By Place...</TextComponent>



                </TouchableOpacity>

                <TextComponent medium bold color={'white'}>SEARCH</TextComponent>

            </HeaderContainer>
            <FlatList data={ListingsData} renderItem={({item}) => <EachListing item = {item} navigation={props.navigation}/> } keyExtractor={item => item.id.toString()} showsVerticalScrollIndicator={false}/>
            <SearchListingsModal modalVisible={openSearchModal} modalHide={closeSearchModal}/>

        </Container>
    )

}


const Container = styled.SafeAreaView`
flex:1;
backgroundColor: white;

`;

const HeaderContainer = styled.View`
backgroundColor: ${Colors.primaryStatusbarColor};

 flexDirection: row;
 alignItems: center;
 paddingHorizontal: 32px;
 paddingVertical: 12px;
 justifyContent: space-between;


`;





