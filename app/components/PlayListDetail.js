import React from 'react';
import { View, StyleSheet, Modal, FlatList, Text, Dimensions } from 'react-native';
import color from '../misc/color'; 
import AudioListItem from './AudioListItem';
import { selectAudio } from '../misc/audioController';

const PlayListDetail = ({ visible, playList, onClose }) => {
  const playAudio = (audio) => {
    selectAudio(audio);
  }

  // Log para verificar os dados de playList e playList.audios
  console.log("PlayList:", playList);

  if (!playList || !Array.isArray(playList.audios)) {
    return null; // Ou exibir uma mensagem de erro ou componente de carregamento
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{playList.title}</Text>
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={playList.audios}
          keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()} // Verifique se o item.id existe
          renderItem={({ item }) => {
            if (!item.id) {
              console.warn("Item without id:", item); // Log para identificar itens sem id
              return null; // Ou exibir uma mensagem de erro
            }

            return (
              <View style={{ marginBottom: 10 }}>
                <AudioListItem
                  title={item.filename}
                  duration={item.duration}
                  onAudioPress={() => playAudio(item)}
                />
              </View>
            );
          }}
        />
      </View>
      <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    height: height - 150,
    width: width - 15,
    backgroundColor: '#fff',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  modalBG: {
    backgroundColor: color.MODAL_BG,
    zIndex: -1,
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
