const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://ciapachinze.surge.sh',
    'https://ciapachinze_beta.surge.sh',
];

// Quanto tempo aspettare prima di togliere dalla room un giocatore caduto di connessione
const RECONNECT_GRACE_MS = 90 * 1000;

app.use(cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }));

const io = new Server(server, {
    // Heartbeat più tollerante: tab in background / telefono in standby non vengono tagliati subito
    pingInterval: 25 * 1000,
    pingTimeout: 60 * 1000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
    cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

/*
 rooms[room] = {
   players: [{ id: <playerId stabile>, name, socketId, connected }],
   gameType, currentTurnIndex
 }
 L'identità del giocatore NON è più socket.id (cambia a ogni riconnessione)
 ma un playerId generato dal client e inviato in handshake.auth.
*/
const rooms = {};
const graceTimers = new Map(); // `${room}:${playerId}` -> timeout

const publicPlayers = (r) => r.players.map(({ id, name, connected }) => ({ id, name, connected }));

const publicRooms = () => {
    const out = {};
    for (const [name, r] of Object.entries(rooms)) {
        out[name] = { players: publicPlayers(r), gameType: r.gameType, currentTurnIndex: r.currentTurnIndex };
    }
    return out;
};

function broadcastState(room) {
    const r = rooms[room];
    if (!r || r.players.length === 0) return;
    io.to(room).emit('playersUpdate', {
        players: publicPlayers(r),
        gameType: r.gameType,
        currentTurn: r.players[r.currentTurnIndex].id,
    });
}

function removePlayer(room, playerId) {
    const r = rooms[room];
    if (!r) return;

    const idx = r.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    r.players.splice(idx, 1);
    if (r.players.length === 0) {
        delete rooms[room];
        return;
    }
    if (idx < r.currentTurnIndex) r.currentTurnIndex--;
    if (r.currentTurnIndex >= r.players.length) r.currentTurnIndex = 0;
    broadcastState(room);
}

function clearGrace(room, playerId) {
    const key = `${room}:${playerId}`;
    clearTimeout(graceTimers.get(key));
    graceTimers.delete(key);
}

app.get('/', (req, res) => res.redirect('https://ciapachinze.surge.sh'));
// Endpoint leggero per uptime monitor / keep-alive
app.get('/health', (req, res) => res.json({ ok: true, rooms: Object.keys(rooms).length }));

io.on('connection', (socket) => {
    const playerId = String(socket.handshake.auth?.playerId || socket.id);
    socket.data.playerId = playerId;

    console.log(`Connesso: socket=${socket.id} player=${playerId} recovered=${socket.recovered}`);

    // Il client usa questo valore come "il mio id"
    socket.emit('yourID', playerId);

    socket.on('getRooms', () => socket.emit('getRooms', publicRooms()));

    socket.on('getPlayersInRoom', (room, callback) => {
        const clients = io.sockets.adapter.rooms.get(room);
        if (typeof callback === 'function') callback({ count: clients ? clients.size : 0 });
    });

    // Idempotente: va bene chiamarla anche a ogni riconnessione
    socket.on('joinRoom', (room, name, gameType) => {
        if (typeof room !== 'string' || !room) return;

        if (!rooms[room]) {
            rooms[room] = { players: [], gameType, currentTurnIndex: 0 };
        }
        const r = rooms[room];
        const existing = r.players.find((p) => p.id === playerId);

        if (existing) {
            // Riconnessione: stesso giocatore, nuovo socket
            clearGrace(room, playerId);
            existing.socketId = socket.id;
            existing.connected = true;
            if (name) existing.name = name;
        } else if (r.players.length < 2) {
            r.players.push({ id: playerId, name, socketId: socket.id, connected: true });
        } else {
            socket.emit('roomFull', room);
            return;
        }

        socket.join(room);
        console.log(`${name} (${playerId}) è nella room ${room}`);
        broadcastState(room);
    });

    // Compatibilità col vecchio client
    socket.on('playerReconnected', (name, room) => {
    });

    // Eventi che vengono semplicemente inoltrati all'avversario. L'ultimo argomento è sempre la room.
    const RELAY = [
        'deckID', 'playerMove', 'playerDraw', 'handUpdate', 'dealCards', 'scopeUpdate',
        'trisOrLess10', 'is15or30', 'toast', 'aMonte', 'mattata', 'matta', 'playerScore', 'nextHand',
    ];
    for (const event of RELAY) {
        socket.on(event, (...args) => {
            const room = args.pop();
            if (typeof room !== 'string') return;
            socket.to(room).emit(event, ...args);
        });
    }

    socket.on('endTurn', (room) => {
        const r = rooms[room];
        if (!r || r.players.length === 0) return;
        r.currentTurnIndex = (r.currentTurnIndex + 1) % r.players.length;
        io.to(room).emit('turnUpdate', { currentTurn: r.players[r.currentTurnIndex].id });
    });

    socket.on('disconnect', (reason) => {
        console.log(`Disconnesso: socket=${socket.id} player=${playerId} reason=${reason}`);

        const intentional =
            reason === 'client namespace disconnect' || reason === 'server namespace disconnect';

        for (const room of Object.keys(rooms)) {
            const p = rooms[room].players.find((pl) => pl.id === playerId);
            // Ignora se nel frattempo il giocatore si è già riconnesso con un altro socket
            if (!p || p.socketId !== socket.id) continue;

            if (intentional) {
                removePlayer(room, playerId);
            } else {
                // Caduta di rete / tab in background / sleep: periodo di grazia
                p.connected = false;
                broadcastState(room);
                clearGrace(room, playerId);
                graceTimers.set(
                    `${room}:${playerId}`,
                    setTimeout(() => {
                        graceTimers.delete(`${room}:${playerId}`);
                        removePlayer(room, playerId);
                    }, RECONNECT_GRACE_MS)
                );
            }
        }
    });
});

// Un errore in un handler non deve far cadere tutto il processo (e quindi tutte le partite)
process.on('uncaughtException', (err) => console.error('uncaughtException:', err));
process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err));

server.listen(port, () => console.log(`Server in ascolto sulla porta ${port}`));
