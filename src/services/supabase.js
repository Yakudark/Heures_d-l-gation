import { supabase } from '../config/supabase';

const entriesService = {
  async getEntries() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des entrées:', error);
      throw error;
    }

    return data;
  },

  async createEntry(entry) {
    const { data, error } = await supabase
      .from('entries')
      .insert([{
        date: entry.date,
        start_time: entry.startTime,
        end_time: entry.endTime,
        type: entry.type,
        comment: entry.comment || '',
        hours: entry.hours
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'entrée:', error);
      throw error;
    }

    return data;
  },

  async updateEntry(id, entry) {
    const { data, error } = await supabase
      .from('entries')
      .update({
        date: entry.date,
        start_time: entry.startTime,
        end_time: entry.endTime,
        type: entry.type,
        comment: entry.comment || '',
        hours: entry.hours
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée:', error);
      throw error;
    }

    return data;
  },

  async deleteEntry(id) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de l\'entrée:', error);
      throw error;
    }
  }
};

export { entriesService };
