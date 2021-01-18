import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../screens/search';
import Repost from '../screens/repost';
import Header from '../components/header';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

export default function SearchStack() {

  return (
    <Stack.Navigator headerMode='screen' screenOptions={{
      header: ({ navigation, scene }) => {
        return (
          <LinearGradient
            colors={['#eb402a', '#eb9b2a', '#fff526']}
            start={{x: -0.3, y: -0.3}}
            end={{x: 1.5, y: 1.5}}
            locations={[0.15, 0.42, 1.0]}
            style={{height: scene.route.name === 'Repost' ? 90 : 50, width: '100%'}}
          >
            {scene.route.name === 'Repost' &&
              <TouchableOpacity onPress={() => navigation.goBack()} style={{width: '100%', height: '100%', justifyContent: 'flex-end', marginLeft: 10, paddingBottom: 8}}>
                <Ionicons name="ios-arrow-back" size={40} color="black" />
              </TouchableOpacity>
            }
          </LinearGradient>
        );
      }
    }}>
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='Repost' component={Repost} />
    </Stack.Navigator>
  );
}
