import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import TimeEntryForm from './components/TimeEntryForm';
import HistoryView from './components/HistoryView';
import { entriesService } from './services/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState('form');
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await entriesService.getEntries();
      console.log('Données chargées depuis Supabase:', data);
      setEntries(data || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données depuis Supabase'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (entry) => {
    try {
      let savedEntry;
      
      if (editingEntry) {
        savedEntry = await entriesService.updateEntry(editingEntry.id, entry);
        setEntries(entries.map(e => e.id === editingEntry.id ? savedEntry : e));
      } else {
        savedEntry = await entriesService.createEntry(entry);
        setEntries([savedEntry, ...entries]);
      }
      
      setEditingEntry(null);
      Alert.alert('Succès', 'Entrée sauvegardée dans Supabase');
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      Alert.alert(
        'Erreur',
        'Impossible de sauvegarder l\'entrée dans Supabase'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await entriesService.deleteEntry(id);
      setEntries(entries.filter(entry => entry.id !== id));
      Alert.alert('Succès', 'Entrée supprimée de Supabase');
    } catch (error) {
      console.error('Erreur de suppression:', error);
      Alert.alert(
        'Erreur',
        'Impossible de supprimer l\'entrée de Supabase'
      );
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setCurrentView('form');
  };

  const handleClose = () => {
    setCurrentView('form');
    setEditingEntry(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Chargement des données depuis Supabase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentView === 'form' ? (
        <TimeEntryForm
          onSave={handleSave}
          onViewHistory={() => setCurrentView('history')}
          editingEntry={editingEntry}
        />
      ) : (
        <HistoryView
          entries={entries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
