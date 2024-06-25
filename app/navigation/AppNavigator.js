import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AudioList from '../screens/AudioList';
import Player from '../screens/Player';
import PlayList from '../screens/PlayList';
import PlayListDetail from '../screens/PlayListDetail';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PlayListScreen = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name='PlayList' component={PlayList} />
    <Stack.Screen name='PlayListDetail' component={PlayListDetail} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen
      name='Início'
      component={AudioList}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name='headset' size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name='Player'
      component={Player}
      options={{
        tabBarIcon: ({ color, size }) => (
          <AntDesign name='forward' size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name='Biblioteca'
      component={PlayListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name='playlist-play' size={35} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;
