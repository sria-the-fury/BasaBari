import React, {useState, useEffect, useContext} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {TempData} from "../TempData";
import {View, TouchableOpacity, StatusBar, FlatList, Image} from 'react-native';
import {Icon} from "react-native-elements";
import {EachListing} from "../components/listings/EachListing";
import firestore from "@react-native-firebase/firestore";
import {FirebaseContext} from "../context/FirebaseContext";

export default function  HomeScreen () {

    const [ListingsData, setListingsData] = useState(null);

    // const ViewUserInfo = () => {
    //
    //     if(user){
    //         return(
    //             user.map((user) =>
    //                 <View key={user.userId}>
    //                     <TextComponent>{user.userId}</TextComponent>
    //                     <TextComponent>{user.userName}</TextComponent>
    //                     <TextComponent>{user.userAge}</TextComponent>
    //                 </View>
    //             )
    //
    //         );
    //     } else return <TextComponent>No User</TextComponent>;
    //
    //
    // }



    useEffect(() => {

        const subscriber = firestore().collection('listings').onSnapshot(
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
                            roomNumbers: doc.data().roomNumbers
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
            {/*<HeaderContainer>*/}
            {/*    <TouchableOpacity onPress={() => props.navigation.goBack()}>*/}

            {/*        <Icon*/}
            {/*            name={'chevron-down-circle'}*/}
            {/*            type='ionicon'*/}
            {/*            color={'white'} size={40}*/}
            {/*        />*/}

            {/*    </TouchableOpacity>*/}

            {/*    <TextComponent medium bold color={'white'}>MY LISTINGS</TextComponent>*/}

            {/*</HeaderContainer>*/}
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





