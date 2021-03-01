import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PhoneAuthScreen from "../screens/PhoneAuthScreen";

export default function AuthStackScreen() {
  const AuthStack = createStackNavigator();

  return (
    <AuthStack.Navigator headerMode={'none'}>

      <AuthStack.Screen name={'SignIn'} component={SignInScreen} />
      {/*<AuthStack.Screen name={'SignIn'} component={PhoneAuthScreen} />*/}
      <AuthStack.Screen name={'SignUp'} component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}
