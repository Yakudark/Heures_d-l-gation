import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'; // Importation de Supabase
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

// Création d'un client Supabase avec les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  // Désactive les fonctionnalités d'authentification si tu ne les utilises pas
  auth: {
    autoRefreshToken: false,  // Désactive l'auto-refresh du token
    persistSession: false,    // Désactive la persistance de session
    detectSessionInUrl: false // Désactive la détection de session dans l'URL
  }
});

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
  
    // Créer une nouvelle entrée
    const newEntry = {
      id: Date.now().toString(),
      date: date.toISOString(),
      start_time: start_time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      end_time: end_time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      hours: diffHours,
      type,
    };
  
    // Ajouter la nouvelle entrée à l'historique
    const newEntries = [...entries, newEntry];
    const newHours = calculateTotalHours(newEntries, selectedMonth, selectedYear);
    setEntries(newEntries);
    setMonthlyHours(newHours);
    saveData(newHours, newEntries);
  
    try {
      // Envoi des données à Supabase
      const { data, error } = await supabase
        .from('entries')  // Nom de la table dans Supabase
        .insert([newEntry]);  // Insère un tableau d'objets, ici avec une seule entrée
  
      if (error) {
        throw error;
      }
  
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
