import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

const EntryList = ({ entries, onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return 'Date invalide';
    }
  };

  const formatTime = (timeStr) => {
    try {
      // Si le format est déjà HH:mm:ss, pas besoin de créer un objet Date
      if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const [hours, minutes] = timeStr.split(':');
        return `${hours}:${minutes}`;
      }

      // Sinon, essayer de parser comme une date
      const date = new Date(`1970-01-01T${timeStr}`);
      if (isNaN(date.getTime())) return 'Heure invalide';
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de l\'heure:', error);
      return 'Heure invalide';
    }
  };

  return (
    <View style={styles.entriesList}>
      {entries
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
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                </Text>
                <Text style={styles.commentText}>
                  {entry.comment || 'Pas de note'}
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
    </View>
  );
};


export default EntryList;
