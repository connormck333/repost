import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, Dimensions,
  SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function SearchScreen({ navigation }) {

  const [searchInput, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [found, setFound] = useState(false);
  const [searching, setSearching] = useState(false);

  function search() {
    setFound(false);
    try {
      const url = `https://instagram.com/${searchInput}/`
      fetch(url)
        .then(res => res.text())
        .then(body => {
          try {
            const data = body.split('window._sharedData = ')[1].split("</script>")[0];
            const json = JSON.parse(data.substr(0, data.length - 1));
            setImages(json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges);
            setProfile({
              avatar: json.entry_data.ProfilePage[0].graphql.user.profile_pic_url,
              username: json.entry_data.ProfilePage[0].graphql.user.username
            });
            console.log(json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges[2])
            setSearching(false);
            setFound(true);
          } catch {
            setSearching(false);
            alert('User not found.')
          }
        })
    } catch {
      setSearching(false);
      alert('User not found.')
    }
  }

  function header() {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', height: 40, borderBottomWidth: 0.5, borderColor: 'grey'}}>
        <Text style={{fontSize: 28, fontWeight: 'bold'}}>Search by username</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{position: 'absolute', left: 10, top: 0, bottom: 0, justifyContent: 'center'}}>
          <Ionicons name="ios-arrow-back" size={40} color="black" />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={{height: '100%', width: '100%', marginTop: Platform.OS === 'android' ? 25 : 0}}>
        <View style={{width: '100%', marginTop: 5}}>
          <View style={{flexDirection: 'row', width: '100%', justifyContent: 'center', marginTop: 10}}>
            <TextInput
              style={styles.searchBar}
              onChangeText={text => setInput(text)}
              value={searchInput}
            />
            <TouchableOpacity onPress={() => {
              Keyboard.dismiss()
              setSearching(true);
              search();
            }} style={{width: '25%', height: 50, borderRadius: 10, marginLeft: 5, backgroundColor: 'dodgerblue', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 20, color: 'white'}}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
        { searching ?
          <View style={{height: '75%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size='large' />
          </View> :
          <View>
            { !found &&
              <View style={{height: '65%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <Text multiline style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>To search an account, enter their username above and press 'Search'</Text>
                <Text multiline style={{textAlign: 'center', fontSize: 17, marginTop: 30, paddingLeft: 10, paddingRight: 10}}>This will only show up to 12 of their most recent posts. Ensure that their account is not private!</Text>
              </View>
            }
          </View>
        }
        { found &&
          <View>
            <View style={{height: 100, width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
              <Image source={{uri: profile.avatar}} style={{height: 80, width: 80, borderRadius: 40, marginLeft: 10}} resizeMode='cover' />
              <View style={{marginLeft: 10}}>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>{ profile.username }</Text>
              </View>
            </View>
            <View style={{height: '80%', width: '100%', marginTop: 10, backgroundColor: 'white'}}>
              <FlatList
                data={images}
                extraData={images}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => {
                      let images = [];
                      if (item.node.__typename === 'GraphSidecar') {
                        item.node.edge_sidecar_to_children.edges.map(item => {
                          images.push({
                            data: item.node.__typename === 'GraphVideo' ? item.node.video_url : item.node.display_url,
                            type: item.node.__typename === 'GraphVideo' ? 'video' : 'image'
                          });
                          console.log(item)
                        });
                      }
                      navigation.navigate('Repost', {route: 'image', image: {
                      data: item.node.__typename === 'GraphImage' ? item.node.display_url : item.node.__typename === 'GraphVideo' ? item.node.video_url : images,
                      avatar: profile.avatar,
                      username: profile.username,
                      caption: item.node.edge_media_to_caption.edges[0].node.text,
                      type: item.node.__typename === 'GraphImage' ? 'image' : item.node.__typename === 'GraphVideo' ? 'video' : 'collection'
                    }})
                  }} style={{height: screenWidth / 3, width: screenWidth / 3, borderWidth: 1}}>
                    <Image source={{ uri: item.node.thumbnail_src }} style={{height: '100%', width: '100%'}} resizeMode='cover' />
                    { item.node.__typename === 'GraphVideo' &&
                      <View style={{position: 'absolute', right: 2, bottom: 2}}>
                        <Ionicons name="videocam" size={24} color="white" />
                      </View>
                    }
                    { item.node.__typename === 'GraphSidecar' &&
                      <View style={{position: 'absolute', right: 2, bottom: 2}}>
                        <MaterialCommunityIcons name="image-multiple-outline" size={24} color="white" />
                      </View>
                    }
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        }
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 50,
    width: '70%',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    fontSize: 20,
    paddingLeft: 5
  }
})
