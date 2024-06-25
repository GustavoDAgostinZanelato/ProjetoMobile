import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { selectAudio } from '../misc/audioController';
import color from '../misc/color';
import AudioListItem from '../components/AudioListItem';
import { AudioContext } from '../context/AudioProvider';
import OptionModal from '../components/OptionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlayListDetail = props => {
  const context = useContext(AudioContext);
  const playList = props.route.params;

  console.log("PlayList:", playList); // Log para verificar os dados do playlist

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [audios, setAudios] = useState(playList.audios || []);

  const playAudio = async audio => {
    await selectAudio(audio, context, {
      activePlayList: playList,
      isPlayListRunning: true,
    });
  };

  const closeModal = () => {
    setSelectedItem({});
    setModalVisible(false);
  };

  const removeAudio = async () => {
    let { isPlaying, isPlayListRunning, soundObj, playbackPosition, activePlayList } = context;

    if (
      context.isPlayListRunning &&
      context.currentAudio.id === selectedItem.id
    ) {
      await context.playbackObj.stopAsync();
      await context.playbackObj.unloadAsync();
      isPlaying = false;
      isPlayListRunning = false;
      soundObj = null;
      playbackPosition = 0;
      activePlayList = [];
    }

    const newAudios = audios.filter(audio => audio.id !== selectedItem.id);
    try {
      const result = await AsyncStorage.getItem('playlist');
      if (result !== null) {
        const oldPlayLists = JSON.parse(result);
        const updatedPlayLists = oldPlayLists.map(item => {
          if (item.id === playList.id) {
            return { ...item, audios: newAudios };
          }
          return item;
        });

        await AsyncStorage.setItem('playlist', JSON.stringify(updatedPlayLists));
        context.updateState(context, {
          playList: updatedPlayLists,
          isPlayListRunning,
          activePlayList,
          playbackPosition,
          isPlaying,
          soundObj,
        });
      }
    } catch (error) {
      console.error("Failed to update playlist", error);
    }

    setAudios(newAudios);
    closeModal();
  };

  const removePlaylist = async () => {
    let { isPlaying, isPlayListRunning, soundObj, playbackPosition, activePlayList } = context;

    if (context.isPlayListRunning && activePlayList.id === playList.id) {
      await context.playbackObj.stopAsync();
      await context.playbackObj.unloadAsync();
      isPlaying = false;
      isPlayListRunning = false;
      soundObj = null;
      playbackPosition = 0;
      activePlayList = [];
    }

    try {
      const result = await AsyncStorage.getItem('playlist');
      if (result !== null) {
        const oldPlayLists = JSON.parse(result);
        const updatedPlayLists = oldPlayLists.filter(item => item.id !== playList.id);

        await AsyncStorage.setItem('playlist', JSON.stringify(updatedPlayLists));
        context.updateState(context, {
          playList: updatedPlayLists,
          isPlayListRunning,
          activePlayList,
          playbackPosition,
          isPlaying,
          soundObj,
        });
      }
    } catch (error) {
      console.error("Failed to remove playlist", error);
    }

    props.navigation.goBack();
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
          }}
        >
          <Text style={styles.title}>{playList.title}</Text>
          <TouchableOpacity onPress={removePlaylist}>
            <Text style={[styles.title, { color: 'red' }]}>Remove</Text>
          </TouchableOpacity>
        </View>
        {audios.length ? (
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={audios}
            keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={({ item }) => {
              // Adiciona uma verificação antes de renderizar o AudioListItem
              if (!item.id || !item.filename) {
                console.warn("Item inválido:", item); // Log para identificar itens inválidos
                return null;
              }
              return (
                <View style={{ marginBottom: 10 }}>
                  <AudioListItem
                    title={item.filename}
                    duration={item.duration}
                    isPlaying={context.isPlaying}
                    activeListItem={item.id === context.currentAudio.id}
                    onAudioPress={() => playAudio(item)}
                    onOptionPress={() => {
                      setSelectedItem(item);
                      setModalVisible(true);
                    }}
                  />
                </View>
              );
            }}
          />
        ) : (
          <Text
            style={{
              fontWeight: 'bold',
              color: color.FONT_LIGHT,
              fontSize: 25,
              paddingTop: 50,
            }}
          >
            No Audio
          </Text>
        )}
      </View>
      <OptionModal
        visible={modalVisible}
        onClose={closeModal}
        options={[{ title: 'Remove from playlist', onPress: removeAudio }]}
        currentItem={selectedItem}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    paddingVertical: 5,
    fontWeight: 'bold',
    color: color.ACTIVE_BG,
  },
});

export default PlayListDetail;
