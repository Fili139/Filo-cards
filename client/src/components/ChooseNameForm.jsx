import { useForm } from 'react-hook-form'

const ChooseNameForm = ({ setName }) => {
    const { register, handleSubmit } = useForm();

    const chooseName = (data) => setName(data.name)

    return (
        <form onSubmit={handleSubmit((data) => chooseName(data))}>
            <br/>
            <br/>

            <input type="text" placeholder="Your name" {...register("name", { required: "This field is required" })} />

            <br/>
            <br/>

            <button type="submit">Choose name</button>
        </form>
    );
}

export default ChooseNameForm;

