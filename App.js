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
  const [comment, setComment] = useState('');

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
    console.log('Début de l\'édition de l\'entrée:', entry);
    
    // Conversion de la date
    const entryDate = new Date(entry.date);
    
    // Conversion des heures
    const [startHours, startMinutes] = entry.start_time.split(':');
    const [endHours, endMinutes] = entry.end_time.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);
    
    // Mise à jour du state
    setDate(entryDate);
    setstart_time(startTime);
    setend_time(endTime);
    setType(entry.type);
    setComment(entry.comment || '');
    setEditingEntry(entry);
    
    // Redirection vers le formulaire
    setShowHistory(false);
    setShowDashboard(false);
    
    console.log('État après conversion:', {
      date: entryDate,
      start_time: startTime,
      end_time: endTime,
      type: entry.type,
      comment: entry.comment
    });
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

    // Vérifier que la date n'est pas dans le futur
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      Alert.alert(
        'Erreur',
        'La date ne peut pas être dans le futur',
        [{ text: 'OK' }]
      );
      return;
    }
  
    const diffHours = (end_time.getTime() - start_time.getTime()) / (1000 * 60 * 60);

    // Vérifier que le nombre d'heures est raisonnable
    if (diffHours <= 0 || diffHours > 24) {
      Alert.alert(
        'Erreur',
        'Le nombre d\'heures doit être entre 0 et 24',
        [{ text: 'OK' }]
      );
      return;
    }
  
    // Formatage des dates et heures pour Supabase
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    };

    // Créer une nouvelle entrée
    const newEntry = {
      date: formatDate(date),
      start_time: formatTime(start_time),
      end_time: formatTime(end_time),
      hours: parseFloat(diffHours.toFixed(2)),
      type,
      comment: comment
    };

    console.log('Envoi de la nouvelle entrée:', newEntry);
  
    try {
      let response;
      if (editingEntry) {
        // Mise à jour d'une entrée existante
        response = await supabase
          .from('entries')
          .update(newEntry)
          .eq('id', editingEntry.id)
          .select()
          .single();
      } else {
        // Création d'une nouvelle entrée
        response = await supabase
          .from('entries')
          .insert([newEntry])
          .select()
          .single();
      }

      const { data, error } = response;

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('Réponse Supabase:', data);

      if (editingEntry) {
        // Mise à jour de l'entrée dans le state
        setEntries(entries.map(e => e.id === editingEntry.id ? data : e));
      } else {
        // Ajout de la nouvelle entrée au state
        setEntries([...entries, data]);
      }

      // Mise à jour des heures totales
      const newHours = calculateTotalHours([...entries, data], selectedMonth, selectedYear);
      setMonthlyHours(newHours);
      
      // Sauvegarde locale
      saveData(newHours, [...entries, data]);
      
      // Réinitialisation du formulaire
      resetForm();
      setEditingEntry(null);
      
      Alert.alert('Succès', editingEntry ? 'Entrée modifiée' : 'Entrée ajoutée');
    } catch (error) {
      console.error(editingEntry ? 'Erreur lors de la modification:' : 'Erreur lors de l\'ajout de l\'entrée:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const resetForm = () => {
    setDate(null);
    setstart_time(null);
    setend_time(null);
    setType('delegation');
    setComment('');
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
              comment={comment}
              setComment={setComment}
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
