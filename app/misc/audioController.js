//Importação
//------------------------------------------------------------------------------
import { storeAudioForNextOpening } from './helper'; //Chama o Arquivo helper.js


//Botões de Audio
//------------------------------------------------------------------------------
// play audio
export const play = async (playbackObj, uri, lastPosition) => {
  try {
    // Se não houver lastPosition, carrega o áudio e inicia a reprodução
    if (!lastPosition)
      return await playbackObj.loadAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
      );

    // Caso haja lastPosition, carrega o áudio e inicia a reprodução a partir da última posição
    await playbackObj.loadAsync(
      { uri },
      { progressUpdateIntervalMillis: 1000 }
    );

    return await playbackObj.playFromPositionAsync(lastPosition);
  } catch (error) {
    console.log('error inside play helper method', error.message);
  }
};


// pause audio
export const pause = async playbackObj => {
  try {
    // Pausa a reprodução do áudio
    return await playbackObj.setStatusAsync({
      shouldPlay: false,
    });
  } catch (error) {
    console.log('error inside pause helper method', error.message);
  }
};

// retomar audio
export const resume = async playbackObj => {
  try {
    // Reteoma a reprodução do áudio
    return await playbackObj.playAsync();
  } catch (error) {
    console.log('error inside resume helper method', error.message);
  }
};



//Demais Configurações
//------------------------------------------------------------------------------
// Selecionar outro audio
export const playNext = async (playbackObj, uri) => {
  try {
    // Para a reprodução atual, descarrega o áudio e inicia o próximo áudio
    await playbackObj.stopAsync();
    await playbackObj.unloadAsync();
    return await play(playbackObj, uri);
  } catch (error) {
    console.log('error inside playNext helper method', error.message);
  }
};

// Seleciona um áudio para reprodução
export const selectAudio = async (audio, context, playListInfo = {}) => {
  const {
    soundObj,
    playbackObj,
    currentAudio,
    updateState,
    audioFiles,
    onPlaybackStatusUpdate,
  } = context;
  try {
    // Se nenhum áudio estiver sendo reproduzido atualmente
    if (soundObj === null) {
      // Inicia a reprodução do áudio especificado
      const status = await play(playbackObj, audio.uri, audio.lastPosition);
      // Encontra o índice do áudio na lista de áudios
      const index = audioFiles.findIndex(({ id }) => id === audio.id);
      // Atualiza o estado do contexto com as informações do áudio atual e do estado de reprodução
      updateState(context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
        isPlayListRunning: false,
        activePlayList: [],
        ...playListInfo,
      });
      // Armazena informações do áudio para a próxima abertura do aplicativo
      playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      return storeAudioForNextOpening(audio, index);
    }

    // Pausa o áudio se já estiver carregado e em reprodução
    if (
      soundObj.isLoaded &&
      soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await pause(playbackObj);
      return updateState(context, {
        soundObj: status,
        isPlaying: false,
        playbackPosition: status.positionMillis,
      });
    }

    // Resume o áudio se já estiver carregado e pausado
    if (
      soundObj.isLoaded &&
      !soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await resume(playbackObj);
      return updateState(context, { soundObj: status, isPlaying: true });
    }

    // Seleciona outro áudio se um áudio diferente estiver carregado
    if (soundObj.isLoaded && currentAudio.id !== audio.id) {
      const status = await playNext(playbackObj, audio.uri);
      const index = audioFiles.findIndex(({ id }) => id === audio.id);
      updateState(context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
        isPlayListRunning: false,
        activePlayList: [],
        ...playListInfo,
      });
      return storeAudioForNextOpening(audio, index);
    }
  } catch (error) {
    console.log('error inside select audio method.', error.message);
  }
};

// Seleciona um áudio da playlist (próximo ou anterior)
const selectAudioFromPlayList = async (context, select) => {
  const { activePlayList, currentAudio, audioFiles, playbackObj, updateState } =
    context;
  let audio;
  let defaultIndex;
  let nextIndex;

  // Encontra o índice do áudio atual na playlist ativa
  const indexOnPlayList = activePlayList.audios.findIndex(
    ({ id }) => id === currentAudio.id
  );

  // Seleciona o próximo áudio na playlist
  if (select === 'next') {
    nextIndex = indexOnPlayList + 1;
    defaultIndex = 0;
  }

  // Seleciona o áudio anterior na playlist
  if (select === 'previous') {
    nextIndex = indexOnPlayList - 1;
    defaultIndex = activePlayList.audios.length - 1;
  }
  audio = activePlayList.audios[nextIndex];

  // Se não houver próximo áudio na playlist, seleciona o índice padrão
  if (!audio) audio = activePlayList.audios[defaultIndex];

  // Encontra o índice do áudio na lista completa de áudios
  const indexOnAllList = audioFiles.findIndex(({ id }) => id === audio.id);

  // Inicia a reprodução do próximo áudio na playlist
  const status = await playNext(playbackObj, audio.uri);
  return updateState(context, {
    soundObj: status,
    isPlaying: true,
    currentAudio: audio,
    currentAudioIndex: indexOnAllList,
  });
};

// Alterna entre o próximo e o áudio anterior na lista completa de áudios
export const changeAudio = async (context, select) => {
  const {
    playbackObj,
    currentAudioIndex,
    totalAudioCount,
    audioFiles,
    updateState,
    isPlayListRunning,
  } = context;

  // Se a playlist estiver em execução, seleciona o próximo áudio na playlist
  if (isPlayListRunning) return selectAudioFromPlayList(context, select);

  try {
    const { isLoaded } = await playbackObj.getStatusAsync();
    const isLastAudio = currentAudioIndex + 1 === totalAudioCount;
    const isFirstAudio = currentAudioIndex <= 0;
    let audio;
    let index;
    let status;

    // Para o próximo áudio na lista completa
    if (select === 'next') {
      audio = audioFiles[currentAudioIndex + 1];
      if (!isLoaded && !isLastAudio) {
        index = currentAudioIndex + 1;
        status = await play(playbackObj, audio.uri);
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      if (isLoaded && !isLastAudio) {
        index = currentAudioIndex + 1;
        status = await playNext(playbackObj, audio.uri);
      }

      // Se for o último áudio, volta ao início da lista
      if (isLastAudio) {
        index = 0;
        audio = audioFiles[index];
        if (isLoaded) {
          status = await playNext(playbackObj, audio.uri);
        } else {
          status = await play(playbackObj, audio.uri);
        }
      }
    }

    // Para o áudio anterior na lista completa
    if (select === 'previous') {
      audio = audioFiles[currentAudioIndex - 1];
      if (!isLoaded && !isFirstAudio) {
        index = currentAudioIndex - 1;
        status = await play(playbackObj, audio.uri);
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      if (isLoaded && !isFirstAudio) {
        index = currentAudioIndex - 1;
        status = await playNext(playbackObj, audio.uri);
      }

      // Se for o primeiro áudio, volta ao final da lista
      if (isFirstAudio) {
        index = totalAudioCount - 1;
        audio = audioFiles[index];
        if (isLoaded) {
          status = await playNext(playbackObj, audio.uri);
        } else {
          status = await play(playbackObj, audio.uri);
        }
      }
    }

    // Atualiza o estado do contexto com o novo áudio selecionado
    updateState(context, {
      currentAudio: audio,
      soundObj: status,
      isPlaying: true,
      currentAudioIndex: index,
      playbackPosition: null,
      playbackDuration: null,
    });
    // Armazena informações do áudio para a próxima abertura do aplicativo
    storeAudioForNextOpening(audio, index);
  } catch (error) {
    console.log('error inside change audio method.', error.message);
  }
};

// Move a reprodução de áudio para uma posição específica
export const moveAudio = async (context, value) => {
  const { soundObj, isPlaying, playbackObj, updateState } = context;
  // Verifica se há um áudio carregado e se está em reprodução
  if (soundObj === null || !isPlaying) return;

  try {
    // Move a reprodução para a posição especificada no áudio
    const status = await playbackObj.setPositionAsync(
      Math.floor(soundObj.durationMillis * value)
    );
    // Atualiza o estado do contexto com a nova posição de reprodução
    updateState(context, {
      soundObj: status,
      playbackPosition: status.positionMillis,
    });

    // Resume a reprodução após mover para a nova posição
    await resume(playbackObj);
  } catch (error) {
    console.log('error inside onSlidingComplete callback', error);
  }
};