import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimeEntryForm from './src/components/TimeEntryForm';
import PeriodSelector from './src/components/PeriodSelector';
import HistoryView from './src/components/HistoryView';
import HoursSummary from './src/components/HoursSummary';
import { styles } from './src/styles/styles';
import {
  STORAGE_KEY,
  ENTRIES_KEY,
  DELEGATION_HOURS,
  CHSCT_HOURS,
  calculateTotalHours
} from './src/utils/constants';

export default function App() {
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [type, setType] = useState('delegation');
  const [monthlyHours, setMonthlyHours] = useState({ delegation: 0, chsct: 0 });
  const [entries, setEntries] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Recalculer les heures mensuelles quand le mois/année change ou quand les entrées changent
    const newHours = calculateTotalHours(entries, selectedMonth, selectedYear);
    setMonthlyHours(newHours);
  }, [selectedMonth, selectedYear, entries]);

  const loadData = async () => {
    try {
      const savedHours = await AsyncStorage.getItem(STORAGE_KEY);
      const savedEntries = await AsyncStorage.getItem(ENTRIES_KEY);
      
      if (savedHours !== null) {
        setMonthlyHours(JSON.parse(savedHours));
      }
      if (savedEntries !== null) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const saveData = async (hours, newEntries) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(hours));
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const startEditing = (entry) => {
    setEditingEntry(entry);
    setDate(new Date(entry.date));
    setStartTime(new Date(entry.startTime));
    setEndTime(new Date(entry.endTime));
    setType(entry.type);
    setShowDashboard(false);
  };

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) {
      Alert.alert(
        'Erreur',
        'Veuillez sélectionner une date et des heures',
        [{ text: 'OK' }]
      );
      return;
    }

    if (endTime.getTime() <= startTime.getTime()) {
      Alert.alert(
        'Erreur',
        "L'heure de fin doit être supérieure à l'heure de début",
        [{ text: 'OK' }]
      );
      return;
    }

    const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    if (editingEntry) {
      const newEntries = entries.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              date: date.toISOString(),
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              hours: diffHours,
              type
            }
          : entry
      );
      setEntries(newEntries);
      const newHours = calculateTotalHours(newEntries, selectedMonth, selectedYear);
      setMonthlyHours(newHours);
      saveData(newHours, newEntries);
      setEditingEntry(null);
      resetForm();
      Alert.alert('Succès', 'Les modifications ont été enregistrées');
    } else {
      const newEntry = {
        id: Date.now().toString(),
        date: date.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        hours: diffHours,
        type,
      };
      const newEntries = [...entries, newEntry];
      const newHours = calculateTotalHours(newEntries, selectedMonth, selectedYear);
      setEntries(newEntries);
      setMonthlyHours(newHours);
      saveData(newHours, newEntries);
      resetForm();
      Alert.alert('Succès', 'Les heures ont été enregistrées');
    }
  };

  const resetForm = () => {
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setType('delegation');
  };

  const deleteEntry = (id) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette entrée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const newEntries = entries.filter(entry => entry.id !== id);
            const newHours = calculateTotalHours(newEntries, selectedMonth, selectedYear);
            setEntries(newEntries);
            setMonthlyHours(newHours);
            saveData(newHours, newEntries);
          }
        }
      ]
    );
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  const handleEdit = (entry) => {
    startEditing(entry);
    setShowHistory(false);
  };

  const handleDelete = (id) => {
    deleteEntry(id);
  };

  return (
    <View style={styles.container}>
      {!showHistory ? (
        <>
          <Text style={styles.title}>Heures de Délégation</Text>
          
          <HoursSummary 
            monthlyHours={monthlyHours}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />

          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabButton, !showDashboard && styles.selectedTab]}
              onPress={() => setShowDashboard(false)}
            >
              <Text style={[styles.tabButtonText, !showDashboard && styles.selectedTabText]}>
                Nouvelle entrée
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, showDashboard && styles.selectedTab]}
              onPress={() => setShowDashboard(true)}
            >
              <Text style={[styles.tabButtonText, showDashboard && styles.selectedTabText]}>
                Historique
              </Text>
            </TouchableOpacity>
          </View>

          {!showDashboard ? (
            <TimeEntryForm
              date={date}
              startTime={startTime}
              endTime={endTime}
              type={type}
              showDatePicker={showDatePicker}
              showStartTimePicker={showStartTimePicker}
              showEndTimePicker={showEndTimePicker}
              setDate={setDate}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              setType={setType}
              setShowDatePicker={setShowDatePicker}
              setShowStartTimePicker={setShowStartTimePicker}
              setShowEndTimePicker={setShowEndTimePicker}
              handleSubmit={handleSubmit}
              editingEntry={editingEntry}
              cancelEditing={() => {
                setEditingEntry(null);
                setDate(null);
                setStartTime(null);
                setEndTime(null);
                setType('delegation');
              }}
            />
          ) : (
            <PeriodSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setSelectedMonth={setSelectedMonth}
              setSelectedYear={setSelectedYear}
              onValidate={handleViewHistory}
            />
          )}
        </>
      ) : (
        <HistoryView
          entries={entries}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          monthlyHours={monthlyHours}
          onBack={handleBackFromHistory}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
}
