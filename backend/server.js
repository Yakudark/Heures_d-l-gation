const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { dotenv } = require('dotenv');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Créer une instance du client Supabase
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
// Routes pour les entrées
app.get('/api/entries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/entries', async (req, res) => {
  const { date, startTime, endTime, type, comment } = req.body;
  try {
    const { data, error } = await supabase
      .from('entries')
      .insert([
        { date, start_time: startTime, end_time: endTime, type, comment }
      ]);

    if (error) {
      throw error;
    }

    res.status(201).json({ id: data[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/entries/:id', async (req, res) => {
  const { date, startTime, endTime, type, comment } = req.body;
  try {
    const { error } = await supabase
      .from('entries')
      .update({ date, start_time: startTime, end_time: endTime, type, comment })
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Entry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
