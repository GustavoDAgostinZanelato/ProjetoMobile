//Importações
//--------------------------------------------------------------------------------
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
//Biblioteca do RN que permite armazenar dados e recupera valores
import AsyncStorage from '@react-native-async-storage/async-storage'; 
//Importações de outros arquivos
import PlayListInputModal from '../components/PlayListInputModal';
import { AudioContext } from '../context/AudioProvider';
import PlayListDetail from '../components/PlayListDetail';
import color from '../misc/color';


// Variável global para armazenar a playlist selecionada
let selectedPlayList = {};


const PlayList = ({ navigation }) => {
  // Estados locais
  const [modalVisible, setModalVisible] = useState(false); // Controla a visibilidade do modal para adicionar nova playlist
  const [showPlayList, setShowPlayList] = useState(false); // Controla a visibilidade da lista de reprodução detalhada
  // Contexto de áudio para acessar o estado global do áudio e as funções
  const context = useContext(AudioContext);
  const { playList, addToPlayList, updateState } = context;


  //Criando nova PlayList no AsyncStorage
  //--------------------------------------------------------------------------------
  const createPlayList = async playListName => {
    // Obtém a lista de playlists armazenada na biblioteca do AsyncStorage
    const result = await AsyncStorage.getItem('playlist');

    if (result !== null) {
      // Cria um array de áudios a serem adicionados à nova playlist
      const audios = [];
      if (addToPlayList) {
        audios.push(addToPlayList);
      }
      // Cria um novo objeto de playlist
      const newList = {id: Date.now(), title: playListName, audios: audios,};
      // Atualiza a lista de playlists no contexto global
      const updatedList = [...playList, newList];
      updateState(context, { addToPlayList: null, playList: updatedList });
      // Salva a nova lista de playlists no AsyncStorage
      await AsyncStorage.setItem('playlist', JSON.stringify(updatedList));
    }
    // Fecha o modal após a criação da playlist
    setModalVisible(false);
  };


  //Renderizando PlayList do AsyncStorage
  //--------------------------------------------------------------------------------
  const renderPlayList = async () => {
    // Obtém a lista de playlists armazenada no AsyncStorage
    const result = await AsyncStorage.getItem('playlist');
    
    if (result === null) {
      // Se não houver playlists armazenadas, cria uma playlist padrão
      const defaultPlayList = {
        id: Date.now(),
        title: 'Músicas Favoritas',
        audios: [],
      };
      // Adiciona a playlist padrão à lista de playlists do AsyncStorage
      const newPlayList = [...playList, defaultPlayList];
      updateState(context, { playList: [...newPlayList] });
      // Salva a nova lista de playlists no AsyncStorage
      return await AsyncStorage.setItem('playlist', JSON.stringify([...newPlayList]));
    }
    // Atualiza a lista de playlists no contexto global com base no resultado obtido do AsyncStorage
    updateState(context, { playList: JSON.parse(result) });
  };
  // Efeito para carregar as playlists ao montar o componente, caso não haja playlists carregadas
  useEffect(() => {
    if (!playList.length) {
      renderPlayList();
    }
  }, []);


  //Colocando Músicas na Playlist
  //--------------------------------------------------------------------------------
  const handleBannerPress = async playList => {
    if (addToPlayList) {
      // Se houver um áudio para adicionar à playlist
      const result = await AsyncStorage.getItem('playlist');

      let oldList = [];
      let updatedList = [];
      let sameAudio = false;

      if (result !== null) {
        oldList = JSON.parse(result);

        updatedList = oldList.filter(list => {
          if (list.id === playList.id) {
            // Verifica se o mesmo áudio já está na lista
            for (let audio of list.audios) {
              if (audio.id === addToPlayList.id) {
                sameAudio = true;
                return;
              }
            }
            // Caso contrário, adiciona o novo áudio à lista de áudios da playlist
            list.audios = [...list.audios, addToPlayList];
          }
          return list;
        });
      }

      // Se encontrar um áudio idêntico na playlist, exibe um alerta
      if (sameAudio) {
        Alert.alert(
          'Musica Repetida',
          `A música ${addToPlayList.filename} já está nessa playlist`
        );
        sameAudio = false;
        return updateState(context, { addToPlayList: null });
      }
      // Atualiza a lista de playlists no contexto global e no AsyncStorage
      updateState(context, { addToPlayList: null, playList: [...updatedList] });
      return AsyncStorage.setItem('playlist', JSON.stringify([...updatedList]));
    }
    // Se não houver áudio selecionado, abre a lista de reprodução detalhada
    selectedPlayList = playList;
    navigation.navigate('PlayListDetail', playList);
  };


  //Ícone da Playlist + Botão de Criar Playlist
  //--------------------------------------------------------------------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Renderiza os banners de cada playlist existente */}
      {playList.length
        ? playList.map(item => (
            <TouchableOpacity key={item.id.toString()} style={styles.playListBanner} onPress={() => handleBannerPress(item)}>
              <Text>{item.title}</Text>
              <Text style={styles.audioCount}>
                {item.audios.length > 1 || item.audios.length == 0
                  ? `${item.audios.length} Musicas`
                  : `${item.audios.length} Musica`}
              </Text>
            </TouchableOpacity>
          ))
        : null}
      {/* Botão para adicionar nova playlist */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginTop: 15 }}>
        <Text style={styles.playListBtn}>+ Criar Playlist</Text>
      </TouchableOpacity>


      {/* Chamando o componente modal que permite ao usuário criar uma nova playlist */}
      <PlayListInputModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={createPlayList}/>
      {/* Componente que mostra as musicas dentro da playlist */}
      <PlayListDetail visible={showPlayList} playList={selectedPlayList} onClose={() => setShowPlayList(false)}/>


    </ScrollView>
  );
};


//Estilização do Componente PlayList
//--------------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  playListBanner: {
    padding: 5,
    backgroundColor: 'rgba(204,204,204,0.3)',
    borderRadius: 5,
    marginBottom: 15,
  },
  audioCount: {
    marginTop: 3,
    opacity: 0.5,
    fontSize: 14,
  },
  playListBtn: {
    color: color.ACTIVE_BG,
    letterSpacing: 1,
    fontWeight: 'bold',
    fontSize: 14,
    padding: 5,
  },
});

export default PlayList;
