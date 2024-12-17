import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { doc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as Audio from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Entypo, FontAwesome, Feather } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';

const JournalEntryPage = () => {
  const navigation = useNavigation();

  const [journalText, setJournalText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState('');
  const [journalEntries, setJournalEntries] = useState([]); // State to store journal entries

  // Fetch journal entries on component mount using Firestore's onSnapshot for real-time updates
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDate(formattedDate);
    setTime(formattedTime);

    // Fetch journal entries in real-time using onSnapshot
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (userId) {
      const unsubscribe = onSnapshot(collection(FIRESTORE_DB, 'users', userId, 'journals'), (querySnapshot) => {
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJournalEntries(entries.reverse()); // reverse to show latest at the bottom
      }, (error) => {
        console.error('Error fetching journal entries:', error);
      });

      // Cleanup function to unsubscribe from listener when the component unmounts
      return () => unsubscribe();
    }
  }, []);

  const addMedia = (newMedia) => {
    if (newMedia.type === 'image' || newMedia.type === 'video') {
      setSelectedImages((prevImages) => [...prevImages, newMedia]);
    } else if (newMedia.type === 'audio') {
      setAudioUri(newMedia.uri);
    }
  };

  const pickImageOrVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) {
      const newMedia = { type: result.assets[0].type, uri: result.assets[0].uri };
      addMedia(newMedia);
    }
  };

  const captureMedia = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) {
      const newMedia = { type: result.assets[0].type, uri: result.assets[0].uri };
      addMedia(newMedia);
    }
  };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type === 'success') {
      const newMedia = { type: 'audio', uri: result.uri };
      addMedia(newMedia);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        Alert.alert('Permission required', 'Please allow microphone access.');
      }
    } catch (error) {
      console.error('Recording Error:', error);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const newMedia = { type: 'audio', uri };
      addMedia(newMedia);
      setRecording(null);
    }
  };

  const handleSave = async () => {
    if (!journalText.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add some text or media to save.');
      return;
    }

    try {
      const userId = FIREBASE_AUTH.currentUser?.uid; // Get the current user's UID

      if (!userId) {
        Alert.alert('Error', 'User is not logged in.');
        return;
      }

      const docData = {
        text: journalText,
        date,
        time,
        createdAt: new Date(),
        media: selectedImages.map(image => ({
          type: image.type,
          uri: image.uri,
        })),
        audioUri,
      };

      // Reference the user's document and their journals subcollection
      const userDocRef = doc(FIRESTORE_DB, 'users', userId); // Reference to the user document
      const journalsCollectionRef = collection(userDocRef, 'journals'); // Subcollection under the user document

      // Add the journal entry to the journals subcollection
      await addDoc(journalsCollectionRef, docData);

      Alert.alert('Success', 'Journal entry saved successfully!');
      setJournalText('');
      setSelectedImages([]);
      setAudioUri('');
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Error', 'Failed to save journal entry.');
    }
  };

  const renderJournalEntry = (journal) => {
    return (
      <View key={journal.id} style={styles.chatBubble}>
        <Text style={styles.journalDate}>{journal.date} {journal.time}</Text>
        <Text style={styles.journalText}>{journal.text}</Text>
        {journal.media && journal.media.map((media, index) => renderMedia(media, index))}
        {journal.audioUri && renderMedia({ type: 'audio', uri: journal.audioUri })}
      </View>
    );
  };

  const renderMedia = (media, index) => {
    switch (media.type) {
      case 'image':
        return <Image key={index} source={{ uri: media.uri }} style={styles.media} />;
      case 'audio':
        return (
          <View key={index} style={styles.mediaPlaceholder}>
            <Text style={styles.placeholderText}>[Audio]</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.chatContainer}>
          {journalEntries.length > 0 ? (
            journalEntries.map(renderJournalEntry)
          ) : (
            <Text>No journal entries found.</Text>
          )}
        </View>
      </ScrollView>

      <TextInput
        style={styles.journalInput}
        multiline
        numberOfLines={10}
        value={journalText}
        onChangeText={setJournalText}
        placeholder="Write your thoughts here..."
        textAlignVertical="top"
      />

      <View style={styles.mediaButtonsContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImageOrVideo}>
          <Entypo name="image" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={captureMedia}>
          <FontAwesome name="camera" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={pickAudioFile}>
          <FontAwesome name="music" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={recording ? stopRecording : startRecording}>
          {recording ? (
            <FontAwesome name="stop" size={30} color="red" />
          ) : (
            <Feather name="mic" size={30} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Entry</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  chatContainer: {
    marginBottom: 20,
  },
  chatBubble: {
    backgroundColor: '#e1e1e1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  journalDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  journalText: {
    fontSize: 16,
    color: '#333',
  },
  media: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  mediaButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 30,
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaPlaceholder: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 10,
  },
  placeholderText: {
    color: '#333',
    fontSize: 16,
  },
  journalInput: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});

export default JournalEntryPage;
