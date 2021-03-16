import React from 'react'
import { View, Text } from 'react-native'
import styled from "styled-components";

const LoadingScreen = (props) => {
    return (
        <Container>
            <Text>Hello LoadingScreen</Text>
        </Container>
    )
}

export default LoadingScreen;

const Container = styled.View`
    flex: 1;
    justifyContent: center;
    `