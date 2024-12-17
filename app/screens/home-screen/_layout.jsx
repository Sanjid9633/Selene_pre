// screens/home-screen/_layout.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import Screen2 from './Screen2';
import JournalCalendar from './JournalCalender';
import JournalEntryPage from './JournalEntryPage';
import Chatsum from './Chatsum';
import TaskPage from './TaskPage';

const HomeStack = createNativeStackNavigator();

function HomeStackLayout() {
  return (
    <HomeStack.Navigator initialRouteName="Main">
      <HomeStack.Screen 
        name="Main" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="Calender" 
        component={JournalCalendar}
      />
      <HomeStack.Screen 
        name="JournalEntry" 
        component={JournalEntryPage}
      />
      <HomeStack.Screen 
        name="Chatsum" 
        component={Chatsum}
      />
      <HomeStack.Screen 
        name="TaskPage" 
        component={TaskPage}
      />
    </HomeStack.Navigator>
  );
}

export default HomeStackLayout;