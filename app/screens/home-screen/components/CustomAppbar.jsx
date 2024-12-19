import React from 'react';
import { Appbar } from 'react-native-paper';
import { Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CustomAppBar = () => {
    const navigation = useNavigation(); 
  return (
    <Appbar.Header>
    <Appbar.Action 
      icon="menu" 
      size={30} 
      onPress={() => {}
        //navigation.dispatch(DrawerActions.openDrawer())
      } 
    />

      <Text style={styles.welcomeText}>Selene</Text>

      

      <Appbar.Action icon="magnify" size={30} onPress={() => {}} />
      <View style={styles.divider}></View>
      <Appbar.Action size={30} icon="account-circle" onPress={() => {}} />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    marginLeft:-96,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'teal',
  },
  divider: {
    width: 2,
    height: '60%',
    backgroundColor: 'gray',
    marginHorizontal: 10,
  },
  appbarIcon: {
    
  },
});

export default CustomAppBar;
