import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles/styles';
import TimeEntryForm from './components/TimeEntryForm';
import HistoryView from './components/HistoryView';
import Dashboard from './components/Dashboard';
import { ENTRIES_KEY, calculateTotalHours } from './utils/constants';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyHours, setMonthlyHours] = useState({
    delegation: 0,
    chsct: 0,
    reunion: 0
  });

  // Chargement initial des entrées
  useEffect(() => {
    loadEntries();
  }, []);

  // Mise à jour des heures mensuelles quand les entrées changent
  useEffect(() => {
    const totals = calculateTotalHours(entries, selectedMonth, selectedYear);
    setMonthlyHours(totals);
  }, [entries, selectedMonth, selectedYear]);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem(ENTRIES_KEY);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entrées:', error);
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des entrées:', error);
    }
  };

  const handleSubmit = (entry) => {
    let newEntries;
    if (editingEntry) {
      // Modification d'une entrée existante
      newEntries = entries.map(e => 
        e.id === editingEntry.id ? { ...entry, id: editingEntry.id } : e
      );
      setEditingEntry(null);
    } else {
      // Ajout d'une nouvelle entrée
      newEntries = [...entries, { ...entry, id: Date.now().toString() }];
    }
    saveEntries(newEntries);
  };

  const handleDelete = (entryId) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cette entrée ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => {
            const newEntries = entries.filter(entry => entry.id !== entryId);
            saveEntries(newEntries);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowHistory(false);
  };

  if (showHistory) {
    return (
      <HistoryView
        entries={entries}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthlyHours={monthlyHours}
        onBack={() => setShowHistory(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TimeEntryForm
        handleSubmit={handleSubmit}
        editingEntry={editingEntry}
        cancelEditing={() => setEditingEntry(null)}
      />
      <Dashboard
        entries={entries}
        monthlyHours={monthlyHours}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        startEditing={handleEdit}
        deleteEntry={handleDelete}
      />
    </View>
  );
}
