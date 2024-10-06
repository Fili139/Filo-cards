const express = require('express');
const http = require('http');
const cors = require('cors');  // Importa cors
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configura il middleware cors
app.use(cors({
    origin: ['http://localhost:5173', 'https://ciapachinze.surge.sh'],  // Permetti l'accesso al frontend (React app)
    methods: ['GET', 'POST'],
}));

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://ciapachinze.surge.sh'],  // Indica l'origine da cui accetti richieste
        methods: ["GET", "POST"]
    }
});

// Memorizza i giocatori e i turni per ogni room
const rooms = {};

// Quando un giocatore si connette
io.on('connection', (socket) => {
    console.log(`Giocatore connesso: ${socket.id}`);

    // Invia l'ID al giocatore connesso
    socket.emit('yourID', socket.id);

    // Invia l'ID del giocatore avversario connesso
    /*
    socket.on('playerID', (id) => {
        console.log(`Il giocatore: ${id}`, "si è connesso");
        
        socket.broadcast.emit('playerID', id);
    });
    */

    socket.on('getPlayersInRoom', (room, callback) => {
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        const clientCount = clientsInRoom ? clientsInRoom.size : 0;
    
        // Rispondi al client tramite la callback
        callback({ count: clientCount });
    });   

    socket.on('joinRoom', (room) => {
        console.log(`Il giocatore: ${socket.id}`, "vuole entrare nella room", room);
        
        socket.join(room);

        // Se la room non esiste ancora, creala
        if (!rooms[room]) {
            rooms[room] = {
                players: [],
                currentTurnIndex: 0,
            };
        }
    
        // Aggiungi il giocatore alla lista della room
        rooms[room].players.push(socket.id);
    
        // Notifica tutti i giocatori nella room del nuovo stato
        io.to(room).emit('playersUpdate', {
            players: rooms[room].players,
            currentTurn: rooms[room].players[rooms[room].currentTurnIndex],
        });
    });

    // Invio deck id generato da giocatore
    socket.on('deckID', (deck_id, room) => {
        console.log(`Il giocatore: ${socket.id}`, "ha generato un deck con id:", deck_id, "inoltro...");
        
        socket.to(room).emit('deckID', deck_id);
    });

    // Gestione di messaggi tra i giocatori
    socket.on('playerMove', (played_card, cards_taken, newTable, room) => {
        console.log(`Mossa del giocatore: ${socket.id}`, "ha preso:", cards_taken);
        
        socket.to(room).emit('playerMove', played_card, cards_taken, newTable);
    });

    socket.on('playerDraw', (count, remaining, room) => {
        console.log(`Il giocatore: ${socket.id} ha pescato:`, count, ", carte rimanenti: ", remaining);
        
        socket.to(room).emit('playerDraw', count, remaining);
    });

    socket.on('handUpdate', (handCount, room) => {
        socket.to(room).emit('handUpdate', handCount);
    });

    // Gestione di messaggi tra i giocatori
    socket.on('dealCards', (table_cards, remaining, room) => {
        console.log(`Il giocatore: ${socket.id}`, "ha dato le carte, rimanenti:", remaining);
        
        socket.to(room).emit('dealCards', table_cards, remaining);
    });

    socket.on('scopeUpdate', (scope, room) => {
        console.log(`Il giocatore: ${socket.id}`, "ha fatto:", scope, "scopa/e");
        
        socket.to(room).emit('scopeUpdate', scope);
    });

    socket.on('trisOrLess10', (cards, room) => {
        socket.to(room).emit('trisOrLess10', cards);
    });
    
    // Gestisci la fine del turno da parte di un giocatore
    socket.on('endTurn', (room) => {
        const roomData = rooms[room];

        if (roomData) {
            // Passa il turno al prossimo giocatore nella room
            roomData.currentTurnIndex = (roomData.currentTurnIndex + 1) % roomData.players.length;
            const nextPlayer = roomData.players[roomData.currentTurnIndex];

            // Notifica tutti i giocatori della room del nuovo turno
            io.to(room).emit('turnUpdate', { currentTurn: nextPlayer });
        }
    });

    // Quando un giocatore si disconnette
    socket.on('disconnect', () => {
        console.log(`Un giocatore si è disconnesso: ${socket.id}`);

        // Rimuovi il giocatore da tutte le room a cui apparteneva
        for (const room in rooms) {
            const roomData = rooms[room];
            roomData.players = roomData.players.filter(player => player !== socket.id);

            // Se la room ha ancora giocatori, aggiorna il turno
            if (roomData.players.length > 0) {
                if (roomData.currentTurnIndex >= roomData.players.length)
                    roomData.currentTurnIndex = 0; // Resetta l'indice del turno

                io.to(room).emit('playersUpdate', {
                    players: roomData.players,
                    currentTurn: roomData.players[roomData.currentTurnIndex],
                });
            } else {
                // Se non ci sono più giocatori nella room, elimina la room
                delete rooms[room];
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
});