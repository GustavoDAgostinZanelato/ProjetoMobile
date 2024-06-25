import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import { RecyclerListView, LayoutProvider } from 'recyclerlistview';
import { AudioContext } from '../context/AudioProvider';
import { selectAudio } from '../misc/audioController';
import AudioListItem from '../components/AudioListItem';
import OptionModal from '../components/OptionModal';
import Screen from '../components/Screen';

const AudioList = ({ navigation }) => {
  const context = useContext(AudioContext);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  let currentItem = {};

  const layoutProvider = new LayoutProvider(
    i => 'audio',
    (type, dim) => {
      switch (type) {
        case 'audio':
          dim.width = Dimensions.get('window').width;
          dim.height = 70;
          break;
        default:
          dim.width = 0;
          dim.height = 0;
      }
    }
  );

  const handleAudioPress = async audio => {
    await selectAudio(audio, context);
  };

  useEffect(() => {
    context.loadPreviousAudio();
  }, []);

  const rowRenderer = (type, item, index, extendedState) => {
    return (
      <AudioListItem
        title={item.filename}
        isPlaying={extendedState.isPlaying}
        activeListItem={context.currentAudioIndex === index}
        duration={item.duration}
        onAudioPress={() => handleAudioPress(item)}
        onOptionPress={() => {
          currentItem = item;
          setOptionModalVisible(true);
        }}
      />
    );
  };

  const navigateToPlaylist = () => {
    context.updateState(context, {
      addToPlayList: currentItem,
    });
    navigation.navigate('PlayList');
  };

  if (!context.dataProvider._data.length) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 25, textAlign: 'center', color: 'red' }}>
          Arquivos de áudio não encontrados
        </Text>
      </View>
    );
  }

  return (
    <Screen>
      <RecyclerListView
        dataProvider={context.dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
        extendedState={{ isPlaying: context.isPlaying }}
      />
      <OptionModal
        options={[
          {
            title: 'Adicionar a Playlist',
            onPress: navigateToPlaylist,
          },
        ]}
        currentItem={currentItem}
        onClose={() => setOptionModalVisible(false)}
        visible={optionModalVisible}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioList;
