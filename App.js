import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './app/screens/Login';
import SignUp from './app/screens/SignUp';
import AudioProvider from './app/context/AudioProvider';
import AppNavigator from './app/navigation/AppNavigator';
import color from './app/misc/color';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: color.APP_BG,
  },
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="AppNavigator" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}


