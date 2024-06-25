//Importações
//--------------------------------------------------------------------------------
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import color from '../misc/color';
//Importações de outros arquivos
import Screen from '../components/Screen';
import PlayerButton from '../components/PlayerButton';
import { AudioContext } from '../context/AudioProvider';
import {changeAudio, moveAudio, pause, selectAudio} from '../misc/audioController';
import { convertTime } from '../misc/helper';


// Obtém a largura da tela
const { width } = Dimensions.get('window');


// Slider de Música e Botões
//--------------------------------------------------------------------------------
const Player = () => {

  // Estado local para controlar a posição do slider
  const [currentPosition, setCurrentPosition] = useState(0);
  // Obtém o contexto do áudio para acessar o estado global do áudio
  const context = useContext(AudioContext); // O "AudioContext" gerencia o estado do áudio
  const { playbackPosition, playbackDuration, currentAudio } = context;

  // Calcula a posição atual do slider
  const calculateSeebBar = () => {
    if (playbackPosition !== null && playbackDuration !== null) {
      // Calcula a proporção da posição atual em relação à duração total do áudio
      return playbackPosition / playbackDuration;
    }

    if (currentAudio.lastPosition) {
      // Se houver uma última posição salva, calcula a proporção com base nela
      return currentAudio.lastPosition / (currentAudio.duration * 1000); // Converte para milissegundos
    }
    return 0;
  };

  // Carrega o áudio anterior ao montar o componente
  useEffect(() => {
    context.loadPreviousAudio();
  }, []);

  // Manipuladores de eventos para reproduzir/pausar, avançar e retroceder o áudio
  const handlePlayPause = async () => {
    await selectAudio(context.currentAudio, context);
  };

  const handleNext = async () => {
    await changeAudio(context, 'next');
  };

  const handlePrevious = async () => {
    await changeAudio(context, 'previous');
  };

  // Renderiza o tempo atual de reprodução do áudio
  const renderCurrentTime = () => {
    if (!context.soundObj && currentAudio.lastPosition) {
      return convertTime(currentAudio.lastPosition / 1000);
    }
    return convertTime(context.playbackPosition / 1000);
  };

  // Se não houver áudio atual, retorna nulo para não renderizar nada
  if (!context.currentAudio) return null;


  
  // Renderização do componente Player
  return (
    <Screen>
      <View style={styles.container}>
        

        {/* Contanier principal da página, com a ícone de música */}
        <View style={styles.midBannerContainer}>
          <MaterialCommunityIcons name='music-circle' size={300} color={context.isPlaying ? color.ACTIVE_BG : color.FONT_MEDIUM} />
        </View>
        {/* Container do reprodutor de áudio (título, tempo, slider, botões) */}
        <View style={styles.audioPlayerContainer}>
         
         
          {/* Exibe o tempo total da música */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15,}}>
            <Text>{convertTime(context.currentAudio.duration)}</Text>
          </View>


          {/* Slider para controlar a posição de reprodução da música */}
          <Slider
            style={{ width: width, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={calculateSeebBar()} // Define o valor inicial do slider
            minimumTrackTintColor={color.FONT_MEDIUM}
            maximumTrackTintColor={color.ACTIVE_BG}
            // Atualiza a posição atual do slider enquanto é movido
            onValueChange={value => {
              setCurrentPosition(
                convertTime(value * context.currentAudio.duration)
              );
            }}
            // Pausa a reprodução ao iniciar o movimento do slider
            onSlidingStart={async () => {
              if (!context.isPlaying) return;
              try {
                await pause(context.playbackObj); // Pausa a reprodução do áudio
              } catch (error) {
              }
            }}
            // Move a reprodução para a posição selecionada no slider
            onSlidingComplete={async value => {
              await moveAudio(context, value);
              setCurrentPosition(0); // Reinicia a posição atual do slider
            }}
          />


          {/* Botões de controle: anterior, play/pause, próximo */}
          <View style={styles.audioControllers}>
            <PlayerButton iconType='PREV' onPress={handlePrevious} />
            <PlayerButton onPress={handlePlayPause} style={{ marginHorizontal: 25 }} iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}/>
            <PlayerButton iconType='NEXT' onPress={handleNext} />
          </View>
        </View>
      </View>
    </Screen>
  );
};


// Estilização do componente Player
//--------------------------------------------------------------------------------
const styles = StyleSheet.create({
  audioControllers: {
    width,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  audioCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  container: {
    flex: 1,
  },
  audioCount: {
    textAlign: 'right',
    color: color.FONT_LIGHT,
    fontSize: 14,
  },
  midBannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTitle: {
    fontSize: 16,
    color: color.FONT,
    padding: 15,
  },
});

export default Player;