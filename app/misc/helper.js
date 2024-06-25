//Importação
//--------------------------------------------------------------------------------
import AsyncStorage from '@react-native-async-storage/async-storage';


//Armazenar Informações do Áudio
//--------------------------------------------------------------------------------
export const storeAudioForNextOpening = async (audio, index, lastPosition) => {
  // Armazena os dados do áudio no AsyncStorage do dispositivo
  await AsyncStorage.setItem(
    'previousAudio',
    JSON.stringify({ audio: { ...audio, lastPosition }, index })
  );
};


//Converte um Número de Minutos em uma String Formatada de Horas e Minutos 
//--------------------------------------------------------------------------------
export const convertTime = minutes => {
  if (minutes) {
    const hrs = minutes / 60; // Converte minutos em horas
    const minute = hrs.toString().split('.')[0]; // Obtém os minutos
    const percent = parseInt(hrs.toString().split('.')[1].slice(0, 2)); // Obtém a parte decimal dos minutos
    const sec = Math.ceil((60 * percent) / 100); // Calcula os segundos

    // Formatação do tempo
    if (parseInt(minute) < 10 && sec < 10) {
      return `0${minute}:0${sec}`; // Minutos e segundos menores que 10
    }

    if (sec === 60) {
      return `${parseInt(minute) + 1}:00`; // Caso especial: quando os segundos chegam a 60
    }

    if (parseInt(minute) < 10) {
      return `0${minute}:${sec}`; // Minutos menores que 10
    }

    if (sec < 10) {
      return `${minute}:0${sec}`; // Segundos menores que 10
    }

    return `${minute}:${sec}`; // Outros casos
  }
};
