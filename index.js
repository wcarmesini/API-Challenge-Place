// Importando o express e dotenv
import express from 'express';
import dotenv from 'dotenv';

// Configurando o dotenv para carregar as variáveis de ambiente
dotenv.config();

// Criando uma aplicação Express
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
    console.log("App is running!")
})