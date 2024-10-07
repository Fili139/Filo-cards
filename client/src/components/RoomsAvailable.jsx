// RoomsAvailable.js
import React from 'react';
import './RoomsAvailable.css';

const RoomsAvailable = ({ rooms, setRoom }) => {

    const roomsAvailable = []

    for (const room in rooms) {
        const style = rooms[room].players.length < 2 ? "room-available-empty" : "room-available-full"

        roomsAvailable.push(
            <li key={room}>
                <span className={style} onClick={() =>  {if (style === "room-available-empty") setRoom(room)}}>Room name: {room} - players: {rooms[room].players.length}/2</span>
            </li>
        )
    }

    return (
        <>
            <p>Rooms available:</p>
            {roomsAvailable.length > 0 ? roomsAvailable : "No rooms available"}

            <br/>
            <br/>
        </>
    )
}

export default RoomsAvailable;