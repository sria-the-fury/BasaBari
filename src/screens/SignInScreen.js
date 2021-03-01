import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import { TextComponent } from '../components/TextComponent';
import { Icon } from 'react-native-elements';
import { ScrollView , TouchableOpacity} from 'react-native';
import {UserContext} from "../context/UserContext";
import {FirebaseContext} from "../context/FirebaseContext";

export default function SignInScreen(props) {
    const [showPassword, setShowPassWord] = useState(true);

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [_,setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);



    const disableSignIn = () => {

        return !(userEmail !== '' && userPassword !== '')
    }

    const signIn = async () => {
        setLoading(true)
        try {
            const currentUser = await firebase.signIn(userEmail, userPassword);
            if(currentUser) {
                setUser({isLoggedIn: true});
            }
        }catch (error) {
            alert(error.message)

        }finally {
            setLoading(false)
        }

    };


    return (
        <Container>
            <TopDesign>
                <LeftCircle />
                <RightCircle />
            </TopDesign>
            <HeaderText>
                <TextComponent bold center large color='#1c3787'>Basa Bari</TextComponent>

            </HeaderText>
            <ScrollView>

                <MainContainer>


                    <FormContainer>

                        <LabelAndInputWrapper>
                            <Icon
                                name='email'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <TextInput placeholder={'Enter your email'} autoCapitalize={'none'}
                                       autoCompleteType={'email'} autoCorrect={false} onChangeText={(email) => setUserEmail(email)}/>

                        </LabelAndInputWrapper>

                        <LabelAndInputWrapper>
                            <Icon
                                name='lock'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <TextInput placeholder={'Enter your password'} autoCapitalize={'none'}
                                       autoCompleteType={'password'} autoCorrect={false} secureTextEntry={showPassword} onChangeText={(password) => setUserPassword(password)}/>

                            <Icon
                                name={showPassword ? 'visibility-off' : 'visibility'}
                                type='md'
                                color={showPassword ? 'grey' : 'black'} size={30} style={{ right: 5 }} onPress={() => setShowPassWord(!showPassword)}
                            />

                        </LabelAndInputWrapper>

                        <SignInButton disabled={disableSignIn() || loading} onPress={() => signIn(userEmail, userPassword, setUser, setLoading)}>

                            {loading ? (<Loading/>) : <TextComponent bold medium center color={'white'}>SIGN IN</TextComponent>}

                        </SignInButton>

                        <SignUpGoContainer>
                            <TextComponent medium center>Haven't Account ? </TextComponent>

                            <TouchableOpacity onPress={() => props.navigation.navigate('SignUp')} >

                                <Icon
                                    name={'chevron-forward-circle'}
                                    type='ionicon'
                                    color={'blue'} size={50}
                                />

                            </TouchableOpacity>

                        </SignUpGoContainer>



                    </FormContainer>

                </MainContainer>
            </ScrollView>



        </Container>
    );
}

const Container = styled.View`
flex:1;

`;

const TopDesign = styled.View`
position: absolute;
width: 100%;
top: -50px;
z-index: -100;

`;

const LeftCircle = styled.View`
    backgroundColor: purple;
    height: 200px;
    width:200px;
    position: absolute;

    top: -90px;
    left: -50px;
    borderRadius: 100px;

`;

const RightCircle = styled.View`
    backgroundColor: #1c3787;
    height: 400px;
    width:400px;

    top: -250px;
    right: -80px;
    borderRadius: 200px;

`;

const HeaderText = styled.View`
marginTop: 100px;

`;

const MainContainer = styled.View`
alignItems: center;



`;

const FormContainer = styled.KeyboardAvoidingView`

marginLeft: 20px;
marginRight: 20px;
width: 350px;
marginTop: 200px;

    
`;

const LabelAndInputWrapper = styled.View`
flexDirection: row;
borderRadius: 10px;
backgroundColor: #eddefc;
paddingHorizontal: 15px;
alignItems: center;
marginBottom: 30px;




`;

const TextInput = styled.TextInput`

fontSize: 18px;
width: 85%;

`;

const SignInButton = styled.TouchableOpacity`
alignItems: center;
backgroundColor: #1c3787;
marginHorizontal: 100px;
paddingVertical: 10px;
borderRadius: 5px;
marginBottom: 20px;

`;

const SignUpGoContainer = styled.View`
flexDirection: row;
alignItems: center;
justifyContent: center;

`;

const Loading = styled.ActivityIndicator.attrs(props => ({
    color: 'white',
    size: 'small',


}))``;

