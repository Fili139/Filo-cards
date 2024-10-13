import { useForm } from 'react-hook-form'
import RoomsAvailable from './RoomsAvailable'

const JoinRoomForm = ({ setRoom, rooms }) => {
    const { register, handleSubmit } = useForm();

    const joinRoom = (data) => setRoom(data.room)
    
    return (
        <>
            <RoomsAvailable 
                rooms={rooms}
                setRoom={setRoom}
            />

            <br/>

            <form onSubmit={handleSubmit((data) => joinRoom(data))}>
                <input type="text" placeholder="Room name" {...register("room", { required: "This field is required" })} />

                <br/>
                <br/>

                <button type="submit">Join room</button>
            </form>
        </>
    );
}

export default JoinRoomForm;