import React, {useEffect, useState} from "react";
import {View, Modal, Pressable, ScrollView, TouchableOpacity} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Avatar, Icon} from "react-native-elements";
import {Colors} from "../components/utilities/Colors";
import { SearchBar, ListItem } from 'react-native-elements';
import axios from "axios";
import _ from 'lodash';

export const SearchListingsModal = (props) => {
    const {modalVisible, modalHide, headerColor} = props;


    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);

    const updateSearch = (search) => {
        setSearch(search);

    }

    const onClearSearch = () => {
        setResult(null);
        setSearch('')
    }

    useEffect(() => {

        if(search !== ''){
            axios.get(`https://us1.locationiq.com/v1/search.php?key=51b1b23250a6fb&q=${search}&format=json`)
                .then((response) => {
                    const {data} = response;
                    if(!data.error){
                        let countryInfoArray = [];
                        _.each(data, (eachData) => {

                            let displayName = eachData?.display_name,
                                name = displayName.split(','),
                                countryName = name.slice(-1),
                                divisionName = name.slice(-2),

                                eachCountryInfo = {
                                    placeName: name[0]+', '+divisionName,
                                    latitude: eachData.lat,
                                    longitude: eachData.lon
                                };
                            countryInfoArray.push(eachCountryInfo);

                            if(countryInfoArray?.length > 0) {
                                setResult(countryInfoArray);

                            }

                        })
                    }


                }).catch((error) => {
                console.log(error.message + '@searching');
            })
        }


    }, [search]);


    return (
        <Container>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide()
                }}
            >
                <ModalView>
                    <ModalHeader style={{backgroundColor: Colors.primaryStatusbarColor}}>
                        <Pressable onPress={() => modalHide()}>
                            <Icon name={'chevron-down-circle'} type={'ionicon'} size={40} color={'white'}/>
                        </Pressable>
                        <SearchBar onClear={() => onClearSearch()}
                            containerStyle={{backgroundColor: Colors.primaryBodyLight, width: '70%', height: 50, borderRadius: 50}}
                            inputStyle={{height: 50, backgroundColor: Colors.primaryBodyLight, color: 'white'}}

                            inputContainerStyle={{backgroundColor: Colors.primaryBodyLight, width: '100%', height: '100%'}}
                            placeholder="Search by Place name..."
                            onChangeText={updateSearch}
                            value={search}
                        />

                        <TextComponent medium bold color={'white'}>SEARCH</TextComponent>
                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{paddingHorizontal: 10, paddingVertical: 10}}>
                            <TextComponent medium justify>
                                {search}

                            </TextComponent>
                        </View>
                        <View>
                            {
                                result && result.map((res, key)  => (
                                    <ListItem key={key} bottomDivider containerStyle={{ width: 600}}>

                                        <ListItem.Content>
                                            <ListItem.Title> {res.placeName} </ListItem.Title>

                                            <ListItem.Subtitle>{res.latitude}</ListItem.Subtitle>
                                        </ListItem.Content>
                                    </ListItem>
                                ))

                            }
                        </View>
                    </ScrollView>



                </ModalView>
            </Modal>
        </Container>
    );
};

const StatusBarAndTopHeaderBGColor = '#d0ff00';
const Container = styled.View`

`;

const ModalView = styled.View`
backgroundColor: white;

alignItems: center;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height:100%;

`;

const ModalHeader = styled.View`
paddingVertical: 10px;
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal:10px;

`;



// const styles = StyleSheet.create({
//     centeredView: {
//         flex: 1,
//         justifyContent: "center",
//     },
//     modalView: {
//         margin: 20,
//         backgroundColor: "white",
//         borderRadius: 20,
//         padding: 35,
//         alignItems: "center",
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 2
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         e
//     },
//     button: {
//         borderRadius: 20,
//         padding: 10,
//         elevation: 2
//     },
//     buttonOpen: {
//         backgroundColor: "#F194FF",
//     },
//     buttonClose: {
//         backgroundColor: "#2196F3",
//     },
//     textStyle: {
//         color: "white",
//         fontWeight: "bold",
//         textAlign: "center"
//     },
//     modalText: {
//         marginBottom: 15,
//         textAlign: "center"
//     }
// });

