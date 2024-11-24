import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  useSharedValue 
} from 'react-native-reanimated';
import { styles } from '../styles/styles';

// Crée un composant Animated TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Composant réutilisable pour les champs Date et Heure
const DateTimeInput = ({ label, value, onPress, iconName }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Text style={styles.input}>{value || `Sélectionner ${label.toLowerCase()}`}</Text>
      <TouchableOpacity style={styles.iconButton} onPress={onPress}>
        <Ionicons name={iconName} size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </View>
);

// Ton composant principal TimeEntryForm reste inchangé
const TimeEntryForm = ({
  date,
  start_time,
  end_time,
  type,
  comment,
  showDatePicker,
  showstart_timePicker,
  showend_timePicker,
  setDate,
  setstart_time,
  setend_time,
  setType,
  setComment,
  setShowDatePicker,
  setShowstart_timePicker,
  setShowend_timePicker,
  handleSubmit,
  editingEntry,
  cancelEditing,
  onShowHistory,
}) => {
  const formatDate = (date) => {
    if (!date) return 'Sélectionner une date';
    if (!(date instanceof Date) || isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (time) => {
    if (!time) return 'Sélectionner une heure';
    if (!(time instanceof Date) || isNaN(time.getTime())) return 'Heure invalide';
    return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const validateEntry = () => {
    if (!date || !start_time || !end_time) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return false;
    }
    if (start_time >= end_time) {
      Alert.alert('Erreur', 'L’heure de fin doit être après l’heure de début.');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateEntry()) return;
    handleSubmit(); // Appel de la méthode parent pour sauvegarder
  };

  // Animation des boutons
  const addButtonAnimation = useSharedValue(0);
  const cancelButtonAnimation = useSharedValue(0);

  useEffect(() => {
    addButtonAnimation.value = withSpring(1);
    cancelButtonAnimation.value = editingEntry ? withSpring(1) : withSpring(0);
  }, [editingEntry]);

  const addButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addButtonAnimation.value }],
    opacity: addButtonAnimation.value,
  }));

  const cancelButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelButtonAnimation.value }],
    opacity: cancelButtonAnimation.value,
  }));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form}>
        {/* Sélection du type */}
        <View style={styles.typeSelector}>
          {['delegation', 'chsct', 'reunion'].map((entryType) => (
            <TouchableOpacity
              key={entryType}
              style={[styles.typeButton, type === entryType && styles.selectedType]}
              onPress={() => setType(entryType)}
              accessibilityLabel={`Choisir ${entryType}`}
            >
              <Text
                style={[
                  styles.typeText,
                  type === entryType && styles.selectedTypeText,
                ]}
              >
                {entryType.charAt(0).toUpperCase() + entryType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champs de formulaire */}
        <View style={styles.formCard}>
          <DateTimeInput
            label="Date"
            value={formatDate(date)}
            onPress={() => setShowDatePicker(true)}
            iconName="calendar"
          />

          <DateTimeInput
            label="Début"
            value={formatTime(start_time)}
            onPress={() => setShowstart_timePicker(true)}
            iconName="time"
          />

          <DateTimeInput
            label="Fin"
            value={formatTime(end_time)}
            onPress={() => setShowend_timePicker(true)}
            iconName="time"
          />

          {/* Champ pour les commentaires */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Note</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Ajouter une note"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Pickers conditionnels */}
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

        {showstart_timePicker && (
          <DateTimePicker
            value={start_time || new Date()}
            mode="time"
            is24Hour
            onChange={(event, selectedTime) => {
              setShowstart_timePicker(false);
              if (selectedTime) setstart_time(selectedTime);
            }}
          />
        )}

        {showend_timePicker && (
          <DateTimePicker
            value={end_time || new Date()}
            mode="time"
            is24Hour
            onChange={(event, selectedTime) => {
              setShowend_timePicker(false);
              if (selectedTime) setend_time(selectedTime);
            }}
          />
        )}
      </ScrollView>

      {/* Boutons flottants */}
      <Animated.View>
        <AnimatedTouchableOpacity
          style={[styles.floatingButton, addButtonStyle]}
          onPress={handleSave}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </AnimatedTouchableOpacity>

        {editingEntry && (
          <AnimatedTouchableOpacity
            style={[styles.floatingButton, styles.floatingButtonLeft, cancelButtonStyle]}
            onPress={cancelEditing}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </AnimatedTouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default TimeEntryForm;
