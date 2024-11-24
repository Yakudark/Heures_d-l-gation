import { supabase } from '../config/supabase';

const entriesService = {
  async getEntries() {
    console.log('Tentative de récupération des entrées...');
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur Supabase lors de la récupération:', error);
        throw error;
      }

      console.log('Entrées récupérées avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération:', error);
      throw error;
    }
  },

  async createEntry(entry) {
    console.log('Tentative de création d\'une entrée:', entry);
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          date: entry.date,
          start_time: entry.start_time,
          end_time: entry.end_time,
          type: entry.type,
          comment: entry.comment || '',
          hours: parseFloat(entry.hours)
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création:', error);
        throw error;
      }

      console.log('Entrée créée avec succès:', data);
      return {
        ...data,
        start_time: data.start_time,
        end_time: data.end_time
      };
    } catch (error) {
      console.error('Erreur inattendue lors de la création:', error);
      throw error;
    }
  },

  async updateEntry(id, entry) {
    console.log('Tentative de mise à jour de l\'entrée:', { id, entry });
    try {
      const { data, error } = await supabase
        .from('entries')
        .update({
          date: entry.date,
          start_time: entry.start_time,
          end_time: entry.end_time,
          type: entry.type,
          comment: entry.comment || '',
          hours: parseFloat(entry.hours)
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        throw error;
      }

      console.log('Entrée mise à jour avec succès:', data);
      return {
        ...data,
        start_time: data.start_time,
        end_time: data.end_time
      };
    } catch (error) {
      console.error('Erreur inattendue lors de la mise à jour:', error);
      throw error;
    }
  },

  async deleteEntry(id) {
    console.log('Tentative de suppression de l\'entrée:', id);
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur Supabase lors de la suppression:', error);
        throw error;
      }

      console.log('Entrée supprimée avec succès');
    } catch (error) {
      console.error('Erreur inattendue lors de la suppression:', error);
      throw error;
    }
  }
};

export { entriesService };
