const express = require('express');
const http = require('http');
const cors = require('cors');  // Importa cors
const { Server } = require('socket.io');

const { curly } = require('node-libcurl');

const app = express();
const server = http.createServer(app);

// Configura il middleware cors
app.use(cors({
    origin: 'http://localhost:5173',  // Permetti l'accesso al frontend (React app)
    methods: ['GET', 'POST'],
}));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Indica l'origine da cui accetti richieste
        methods: ["GET", "POST"]
    }
});

/*
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
*/

//const { statusCode, data, headers } = await curly.get('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')

// Quando un giocatore si connette
io.on('connection', (socket) => {
    console.log(`Giocatore connesso: ${socket.id}`);

    // Invia l'ID al giocatore connesso
    socket.emit('yourId', socket.id);

    // Invio deck id generato da giocatore
    socket.on('deckID', (deck_id) => {
        console.log(`Il giocatore: ${socket.id}`, "ha generato un deck con id", deck_id, "inoltro...");
        
        socket.broadcast.emit('deckID', deck_id);
    });
    // Gestione di messaggi tra i giocatori
    socket.on('playerMove', (data) => {
        console.log(`Mossa del giocatore: ${socket.id}`, data);
        
        // Invia la mossa agli altri giocatori
        socket.broadcast.emit('playerMove', data);
    });

    socket.on('playerDraw', (count, remaining) => {
        console.log(`Il giocatore: ${socket.id} ha pescato`, count, ", carte rimanenti: ", remaining);
        
        // Invia la mossa agli altri giocatori
        socket.broadcast.emit('playerDraw', count, remaining);
    });

    // Quando un giocatore si disconnette
    socket.on('disconnect', () => {
        console.log('Un giocatore si è disconnesso!');
    });
});

server.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
});