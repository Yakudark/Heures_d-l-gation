import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';
import HoursSummary from './HoursSummary';
import StatsView from './StatsView';

const HistoryView = ({ 
  entries, 
  selectedMonth, 
  selectedYear, 
  monthlyHours,
  onBack,
  onEdit,
  onDelete 
}) => {
  const [showStats, setShowStats] = useState(false);

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

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, !showStats && styles.toggleButtonActive]}
          onPress={() => setShowStats(false)}
        >
          <Text style={[styles.toggleButtonText, !showStats && styles.toggleButtonTextActive]}>
            Liste
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showStats && styles.toggleButtonActive]}
          onPress={() => setShowStats(true)}
        >
          <Text style={[styles.toggleButtonText, showStats && styles.toggleButtonTextActive]}>
            Statistiques
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {showStats ? (
          <ScrollView style={styles.statsContainer}>
            <StatsView
              entries={entries}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </ScrollView>
        ) : (
          <ScrollView style={styles.entriesList}>
            {filteredEntries
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((entry, index) => (
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
                        onPress={() => onDelete(entry.id)}
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
                      entry.type === 'delegation' ? styles.delegationType : 
                      entry.type === 'chsct' ? styles.chsctType :
                      styles.reunionType
                    ]}>
                      <Text style={[
                        styles.entryTypeText,
                        entry.type === 'delegation' ? styles.delegationTypeText : 
                        entry.type === 'chsct' ? styles.chsctTypeText :
                        styles.reunionTypeText
                      ]}>
                        {entry.type === 'delegation' ? 'Délégation' : 
                         entry.type === 'chsct' ? 'CHSCT' : 'Réunion'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default HistoryView;
