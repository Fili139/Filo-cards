import { useState } from "react";

export const useOnlineState = () => {
    
    const [socket, setSocket] = useState(null);

    const [playerID, setPlayerID] = useState("");
    
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState("");

    return {
        socket,
        setSocket,
        room,
        setRoom,
        rooms,
        setRooms,
        players,
        setPlayers,
        currentTurn,
        setCurrentTurn,
        playerID,
        setPlayerID,
    };
};