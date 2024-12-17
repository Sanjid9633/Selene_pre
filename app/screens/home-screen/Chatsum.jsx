import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchDataFromGrok } from './GrokApi';

const Chatsum = () => {
  const [messages, setMessages] = useState([]); // Message history
  const [userInput, setUserInput] = useState(''); // Current user input
  const [isLoading, setIsLoading] = useState(false); // Loading state for the chatbot

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      const userMessage = { text: userInput, sender: 'user' }; // Current user message
      setMessages([...messages, userMessage]); // Add user message to messages list
      setUserInput(''); // Clear input
      setIsLoading(true); // Show loading indicator

      try {
        // Format the messages array for Grok API
        const formattedMessages = [
          ...messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant', // Define role
            content: msg.text, // Message content
          })),
          { role: 'user', content: userInput }, // Add the current user input
        ];

        // Send formatted messages to Grok API
        const botResponse = await fetchDataFromGrok(formattedMessages);

        // Add chatbot response to the messages list
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botResponse, sender: 'bot' },
        ]);
      } catch (error) {
        // Show error message
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Error fetching response from Grok.', sender: 'bot' },
        ]);
      } finally {
        setIsLoading(false); // Hide loading indicator
      }
    }
  };

  const handleSummarize = () => {
    console.log('Summarize Pressed');
    // Add summarize functionality here
  };

  return (
    <View style={styles.container}>
      {/* Chat messages */}
      <ScrollView contentContainerStyle={styles.messageContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.sender === 'bot' && styles.botText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
        {/* Loading indicator */}
        {isLoading && (
          <Text style={styles.typingIndicator}>Chatbot is typing...</Text>
        )}
      </ScrollView>

      {/* Input box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={userInput}
          onChangeText={setUserInput}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Icon name="send" size={24} color="teal" />
        </TouchableOpacity>
      </View>

      {/* Summarize Button */}
      <View style={styles.summarizeButtonContainer}>
        <TouchableOpacity style={styles.summarizeButton} onPress={handleSummarize}>
          <Text style={styles.summarizeButtonText}>Summarize</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'teal',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ddd',
  },
  messageText: {
    fontSize: 16,
  },
  botText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    marginRight: 10,
  },
  typingIndicator: {
    alignSelf: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#555',
  },
  summarizeButtonContainer: {
    alignItems: 'center', // Center horizontally
    marginTop: 10, // Add spacing from input field
    marginBottom: 10, // Add spacing at bottom
  },
  summarizeButton: {
    backgroundColor: 'teal', // Teal color for button
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 32, // Horizontal padding
    borderRadius: 20, // Rounded corners
  },
  summarizeButtonText: {
    color: 'white', // White text color
    fontSize: 16, // Text size
    fontWeight: 'bold', // Make text bold
  },
});

export default Chatsum;
