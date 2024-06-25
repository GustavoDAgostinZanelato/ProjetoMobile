//Importações
//--------------------------------------------------------------------------------
import React, { useState } from 'react';
import {View,StyleSheet,Modal,TextInput,Dimensions,TouchableWithoutFeedback,Text,} from 'react-native'; 
import { AntDesign } from '@expo/vector-icons';
import color from '../misc/color';


//Renderiza as Músicas dentro da Playlist
//--------------------------------------------------------------------------------
const PlayListInputModal = ({ visible, onClose, onSubmit }) => {
  const [playListName, setPlayListName] = useState(''); // Estado para armazenar o nome da playlist

  // Função para lidar com a submissão do formulário
  const handleOnSubmit = () => {
    if (!playListName.trim()) {
      // Se o nome da playlist estiver vazio, fecha o modal
      onClose();
    } else {
      // Caso contrário, submete o nome da playlist e reseta o estado
      onSubmit(playListName);
      setPlayListName('');
      onClose();
    }
  };

  return (
    // Modal para criar uma nova playlist
    <Modal visible={visible} animationType='fade' transparent>
      <View style={styles.modalContainer}>
        <View style={styles.inputContainer}>
          <Text style={{ color: color.ACTIVE_BG }}>Create New Playlist</Text>
          <TextInput
            value={playListName} // Valor do input controlado pelo estado
            onChangeText={text => setPlayListName(text)} // Atualiza o estado com o texto inserido
            style={styles.input} // Estilo do input
          />
          <AntDesign
            name='check' // Ícone de check para submissão
            size={24}
            color={color.ACTIVE_FONT}
            style={styles.submitIcon}
            onPress={handleOnSubmit} // Chama handleOnSubmit quando pressionado
          />
        </View>
      </View>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
        {/* Fundo do modal para fechar ao clicar fora */}
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width } = Dimensions.get('window'); // Pega a largura da janela


//Estilização 
//--------------------------------------------------------------------------------
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  inputContainer: {
    width: width - 20, 
    height: 200, 
    borderRadius: 10, 
    backgroundColor: color.ACTIVE_FONT, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  input: {
    width: width - 40,
    borderBottomWidth: 1, 
    borderBottomColor: color.ACTIVE_BG, 
    fontSize: 18, 
    paddingVertical: 5,
  },
  submitIcon: {
    padding: 10,
    backgroundColor: color.ACTIVE_BG, 
    borderRadius: 50,
    marginTop: 15,
  },
  modalBG: {
    backgroundColor: color.MODAL_BG,
    zIndex: -1, 
  },
});

export default PlayListInputModal; // Exporta o componente
