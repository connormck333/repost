import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/home';
import Repost from '../screens/repost';
import MainStack from './mainStack';
import SearchStack from './searchStack';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function Root() {

  return (
    <NavigationContainer>
      <Tab.Navigator tabBarOptions={{
        showLabel: false,
        activeTintColor: 'black'
      }}>
        <Tab.Screen name='MainStack' component={MainStack} options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={32} color={color} />
        }} />
        <Tab.Screen name='Search' component={SearchStack} options={{
          tabBarIcon: ({ color }) => <Ionicons name="search" size={32} color={color} />
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
