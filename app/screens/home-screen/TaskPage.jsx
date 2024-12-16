import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, FlatList, StyleSheet, Alert } from "react-native";

const TaskPage1 = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);

  const addOrEditTask = () => {
    if (taskInput.trim()) {
      if (editingTaskId) {
        setTasks(tasks.map(task => 
          task.id === editingTaskId ? { ...task, task: taskInput } : task
        ));
        setEditingTaskId(null);
      } else {
        setTasks([...tasks, { id: Date.now(), task: taskInput }]);
      }
      setTaskInput("");
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = (id, taskText) => {
    setTaskInput(taskText);
    setEditingTaskId(id);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Get Things Done!</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="What is the task today?"
          placeholderTextColor="#6e6e6e" // Set placeholder text color to light black
          value={taskInput}
          onChangeText={setTaskInput}
          multiline={true} // Set input to multiline
          numberOfLines={4} // Set initial number of lines
          textAlignVertical="top" // Align text to the top in multiline
        />
        <TouchableOpacity style={styles.addButton} onPress={addOrEditTask}>
          <Text style={styles.buttonText}>{editingTaskId ? "Edit" : "Add"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.task}</Text>
            <View style={styles.taskActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => editTask(item.id, item.task)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => removeTask(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#d3d3d3", // Set background to light grey
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: "#333", // Darker color for text
    textAlign: "center",
    marginBottom: 30, // Adjusted margin bottom for the header to move it slightly down
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "white", // Set background color to white for input box
    borderWidth: 1,
    borderColor: "#FFCC00", // Set border color of text input to light yellowish-orange
    padding: 10,
    borderRadius: 5,
    color: "#333", // Darker text for input
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#008080", // Set background of the add button to teal
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  taskItem: {
    flexDirection: "column", // Allow task content and buttons to stack vertically
    backgroundColor: "#008080", // Set background color of task box to teal
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  taskText: {
    color: "#fff", // Set text color to white for tasks
    flex: 1,
    marginBottom: 10,
  },
  taskActions: {
    flexDirection: "column", // Stack edit and delete buttons vertically
    alignItems: "center",
  },
  actionButton: {
    marginTop: 5,
  },
  editText: {
    color: "#ffdd00",
    fontWeight: "bold",
  },
  deleteText: {
    color: "#ff4d4d",
    fontWeight: "bold",
  },
});

export default TaskPage1;
