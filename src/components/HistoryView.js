import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';
import HoursSummary from './HoursSummary';

const HistoryView = ({ 
  entries, 
  selectedMonth, 
  selectedYear, 
  monthlyHours,
  onBack,
  onEdit,
  onDelete 
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Filtrer les entrées pour le mois et l'année sélectionnés
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === selectedMonth && 
           entryDate.getFullYear() === selectedYear;
  });

  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>
          {months[selectedMonth]} {selectedYear}
        </Text>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <HoursSummary 
        monthlyHours={monthlyHours}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      <ScrollView style={styles.entriesList}>
        {filteredEntries.map((entry, index) => (
          <View key={index} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
              <View style={styles.entryActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(entry)}
                >
                  <Ionicons name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete(entry)}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.entryDetails}>
              <View style={styles.entryTime}>
                <Text style={styles.entryTimeText}>
                  {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                </Text>
              </View>
              <View style={[
                styles.entryType,
                entry.type === 'delegation' ? styles.delegationType : styles.chsctType
              ]}>
                <Text style={styles.entryTypeText}>
                  {entry.type === 'delegation' ? 'Délégation' : 'CHSCT'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HistoryView;
