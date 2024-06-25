//Importações
//--------------------------------------------------------------------------------
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import color from '../misc/color';


//Definição do Componente Screen
//--------------------------------------------------------------------------------
const Screen = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};


//Estilização do Componente Screen
//--------------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.APP_BG,       //Importação da cor do BackGround da página color.js
    paddingTop: StatusBar.currentHeight, //Modifica a StatusBar adicionando um espaçamento entre o título "Início" e as músicas
  },
});

export default Screen;
