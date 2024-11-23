import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

const TimeEntryForm = ({
  date,
  startTime,
  endTime,
  type,
  showDatePicker,
  showStartTimePicker,
  showEndTimePicker,
  setDate,
  setStartTime,
  setEndTime,
  setType,
  setShowDatePicker,
  setShowStartTimePicker,
  setShowEndTimePicker,
  handleSubmit,
  editingEntry,
  cancelEditing,
}) => {
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingEntry ? 'Modifier une entrée' : 'Nouvelle entrée'}
        </Text>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'delegation' && styles.selectedType]}
          onPress={() => setType('delegation')}
        >
          <Text style={[
            styles.typeText,
            type === 'delegation' && styles.selectedTypeText
          ]}>
            Délégation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'chsct' && styles.selectedType]}
          onPress={() => setType('chsct')}
        >
          <Text style={[
            styles.typeText,
            type === 'chsct' && styles.selectedTypeText
          ]}>
            CHSCT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'reunion' && styles.selectedType]}
          onPress={() => setType('reunion')}
        >
          <Text style={[
            styles.typeText,
            type === 'reunion' && styles.selectedTypeText
          ]}>
            Réunion
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.input}>{date ? formatDate(date) : 'Sélectionner une date'}</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Début</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.input}>{startTime ? formatTime(startTime) : 'Sélectionner une heure'}</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Ionicons name="time" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Fin</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.input}>{endTime ? formatTime(endTime) : 'Sélectionner une heure'}</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Ionicons name="time" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {editingEntry ? 'Modifier' : 'Ajouter'}
          </Text>
        </TouchableOpacity>

        {editingEntry && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelEditing}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TimeEntryForm;
