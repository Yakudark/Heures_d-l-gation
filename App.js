import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimeEntryForm from './src/components/TimeEntryForm';
import PeriodSelector from './src/components/PeriodSelector';
import HistoryView from './src/components/HistoryView';
import HoursSummary from './src/components/HoursSummary';
import { styles } from './src/styles/styles';
import { supabase } from './src/config/supabase';
import {
  STORAGE_KEY,
  ENTRIES_KEY,
  DELEGATION_HOURS,
  CHSCT_HOURS,
  calculateTotalHours
} from './src/utils/constants';

export default function App() {
  const [date, setDate] = useState(null);
  const [start_time, setstart_time] = useState(null);
  const [end_time, setend_time] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showstart_timePicker, setShowstart_timePicker] = useState(false);
  const [showend_timePicker, setShowend_timePicker] = useState(false);
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
    setstart_time(new Date(entry.start_time));
    setend_time(new Date(entry.end_time));
    setType(entry.type);
    setShowDashboard(false);
  };

  const handleSubmit = async () => {
    // Vérification des champs
    if (!date || !start_time || !end_time) {
      Alert.alert(
        'Erreur',
        'Veuillez sélectionner une date et des heures',
        [{ text: 'OK' }]
      );
      return;
    }
  
    if (end_time.getTime() <= start_time.getTime()) {
      Alert.alert(
        'Erreur',
        "L'heure de fin doit être supérieure à l'heure de début",
        [{ text: 'OK' }]
      );
      return;
    }
  
    const diffHours = (end_time.getTime() - start_time.getTime()) / (1000 * 60 * 60);
  
    // Formatage des dates et heures pour Supabase
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]; // Retourne uniquement la partie date "YYYY-MM-DD"
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    };

    // Créer une nouvelle entrée sans ID (Supabase le générera)
    const newEntry = {
      date: formatDate(date),
      start_time: formatTime(start_time),
      end_time: formatTime(end_time),
      hours: parseFloat(diffHours.toFixed(2)), // Arrondir à 2 décimales
      type,
      comment: '' // Ajouter un champ comment vide par défaut
    };

    console.log('Envoi de la nouvelle entrée:', newEntry);
  
    try {
      // Envoi des données à Supabase
      const { data, error } = await supabase
        .from('entries')
        .insert([newEntry])
        .select()
        .single();
  
      if (error) {
        throw error;
      }
  
      // Utiliser l'entrée retournée par Supabase (avec l'ID généré)
      const newEntries = [...entries, data];
      const newHours = calculateTotalHours(newEntries, selectedMonth, selectedYear);
      setEntries(newEntries);
      setMonthlyHours(newHours);
      saveData(newHours, newEntries);
  
      console.log('Entrée ajoutée avec succès:', data);
      Alert.alert('Succès', 'Les heures ont été enregistrées');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrée:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement des données.');
    }
  
    // Réinitialisation du formulaire après soumission
    resetForm();
  };

  const resetForm = () => {
    setDate(null);
    setstart_time(null);
    setend_time(null);
    setType('delegation');
  };

  const deleteEntry = async (id) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette entrée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentative de suppression de l\'entrée avec ID:', id);
              
              // Suppression de l'entrée dans Supabase
              const { data, error } = await supabase
                .from('entries')
                .delete()
                .eq('id', id)
                .select();

              if (error) {
                console.error('Erreur Supabase lors de la suppression:', error);
                throw error;
              }

              console.log('Réponse Supabase après suppression:', data);

              // Mise à jour de l'état local
              const updatedEntries = entries.filter(entry => entry.id !== id);
              setEntries(updatedEntries);
              
              // Recalcul des heures
              const newHours = calculateTotalHours(updatedEntries, selectedMonth, selectedYear);
              setMonthlyHours(newHours);
              
              // Sauvegarde locale
              saveData(newHours, updatedEntries);
              
              Alert.alert('Succès', 'L\'entrée a été supprimée');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Erreur lors de la suppression de l\'entrée');
            }
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
              start_time={start_time}
              end_time={end_time}
              type={type}
              showDatePicker={showDatePicker}
              showstart_timePicker={showstart_timePicker}
              showend_timePicker={showend_timePicker}
              setDate={setDate}
              setstart_time={setstart_time}
              setend_time={setend_time}
              setType={setType}
              setShowDatePicker={setShowDatePicker}
              setShowstart_timePicker={setShowstart_timePicker}
              setShowend_timePicker={setShowend_timePicker}
              handleSubmit={handleSubmit}
              editingEntry={editingEntry}
              cancelEditing={() => {
                setEditingEntry(null);
                setDate(null);
                setstart_time(null);
                setend_time(null);
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
          setEntries={setEntries}
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
