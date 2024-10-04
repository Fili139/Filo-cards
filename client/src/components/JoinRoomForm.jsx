import { useForm } from 'react-hook-form'

const JoinRoomForm = ({ setRoom, setMode }) => {
    const { register, handleSubmit } = useForm();

    const joinRoom = (data) => { setRoom(data.room); setMode("multi") }

    return (
        <form onSubmit={handleSubmit((data) => joinRoom(data))}>
        <input type="text" placeholder="Room name" {...register("room", { required: "This field is required" })} />
        <br/>
        <button type="submit">Join room</button>
        </form>
    );
}

export default JoinRoomForm;