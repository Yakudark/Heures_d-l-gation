import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';
import HoursSummary from './HoursSummary';
import EntryList from './EntryList';

console.log('====================================');
console.log('HISTORY VIEW - RENDERING');
console.log('====================================');

const HistoryView = ({ entries, onEdit, onDelete, onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyHours, setMonthlyHours] = useState({
    delegation: 0,
    chsct: 0,
    reunion: 0
  });

  useEffect(() => {
    console.log('====================================');
    console.log('HISTORY VIEW - ENTRIES RECEIVED:', entries?.length || 0);
    console.log('ENTRIES DATA:', JSON.stringify(entries, null, 2));
    console.log('====================================');
  }, [entries]);

  useEffect(() => {
    if (entries && entries.length > 0) {
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === selectedMonth &&
          entryDate.getFullYear() === selectedYear
        );
      });

      const hours = {
        delegation: 0,
        chsct: 0,
        reunion: 0
      };

      filteredEntries.forEach(entry => {
        if (entry.type && entry.hours) {
          hours[entry.type] += parseFloat(entry.hours) || 0;
        }
      });

      setMonthlyHours(hours);
    }
  }, [entries, selectedMonth, selectedYear]);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const filteredEntries = entries?.filter(entry => {
    if (!entry || !entry.date) return false;
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() === selectedMonth &&
      entryDate.getFullYear() === selectedYear
    );
  }) || [];

  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.monthNavigation}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.historyTitle}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.historyContent}>
        <HoursSummary monthlyHours={monthlyHours} />
        <EntryList
          entries={filteredEntries}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </ScrollView>
    </View>
  );
};

export default HistoryView;
