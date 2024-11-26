// Importando o express e dotenv
import express from 'express';
import dotenv from 'dotenv';

import { fetchPlayerData } from './src/tm.js'

// Configurando o dotenv para carregar as variáveis de ambiente
dotenv.config();

// Criando uma aplicação Express
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/club/:id/players', async (req, res) => {
    const clubId = req.params.id;
    try {
      const players = await fetchPlayerData(clubId);
      res.json(players);
    } catch (error) {
      console.error('Erro ao buscar dados dos jogadores:', error);
      res.status(500).json({ message: 'Erro ao buscar dados dos jogadores' });
    }
});

app.listen(process.env.PORT, () => {
    console.log("App is running!")
})