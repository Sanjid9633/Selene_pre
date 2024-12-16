import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { collection, query, doc, orderBy, onSnapshot } from 'firebase/firestore';
import CustomAppBar from './components/CustomAppbar';
import JournalEntryButton from './components/JournalEntryButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({navigation}) => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = FIREBASE_AUTH.currentUser;
  const userId = user?.uid;

  useEffect(() => {
    let unsubscribe;

    const setupJournalListener = () => {
      try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        const journalsCollectionRef = collection(userDocRef, 'journals');
        const q = query(journalsCollectionRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(q, (snapshot) => {
          const journalEntries = [];
          snapshot.forEach((doc) => {
            journalEntries.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setJournals(journalEntries);
          setLoading(false);
        }, (error) => {
          console.error('Error listening to journals:', error);
          Alert.alert('Error', 'Failed to load journal entries');
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up journal listener:', error);
        setLoading(false);
      }
    };

    if (userId) {
      setupJournalListener();
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const renderJournalEntry = (journal) => {
    return (
      <TouchableOpacity 
        key={journal.id}
        style={styles.journalCard}
        onPress={() => navigation.navigate('JournalDetail', { journalId: journal.id })}
      >
        <View style={styles.dateTimeContainer}>
          <Text style={styles.journalDate}>{journal.date}</Text>
          <Text style={styles.journalTime}>{journal.time}</Text>
        </View>
        <Text style={styles.journalText} numberOfLines={3}>
          {journal.text}
        </Text>
        <Text style={styles.createdAt}>
          Created: {journal.createdAt?.toDate().toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAppBar/>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Icon name="logout" size={24} color="white" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="teal" style={styles.loader} />
      ) : (
        <ScrollView 
          style={styles.journalList} 
          contentContainerStyle={styles.journalListContent}
          showsVerticalScrollIndicator={false}
        >
          {journals.length > 0 ? (
            journals.map(journal => renderJournalEntry(journal))
          ) : (
            <Text style={styles.noJournalsText}>No journal entries yet</Text>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.floatingButton, styles.leftButton]}
        onPress={() => navigation.navigate('Calender')}
      >
        <Icon name="event" size={30} color="#fff"/>
      </TouchableOpacity>

      <JournalEntryButton navigation={navigation}/>

      <TouchableOpacity
        style={[styles.floatingButton, styles.rightButton]}
        onPress={() => navigation.navigate('ChatbotScreen')}
      >
        <Icon name="chat" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  journalList: {
    flex: 1,
    marginTop: 80,
    paddingHorizontal: 16,
  },
  journalListContent: {
    paddingBottom: 100,
  },
  journalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  journalTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  journalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noJournalsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginTop: 40,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 35,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'teal',
    elevation: 5,
  },
  leftButton: {
    left: '8%',
  },
  rightButton: {
    right: '8%',
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'teal',
    elevation: 5,
    zIndex: 1,
  },
});

export default HomeScreen;
