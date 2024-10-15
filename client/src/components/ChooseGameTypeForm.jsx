import { useForm } from 'react-hook-form'

const ChooseGameTypeForm = ({ setGameType }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            gameType: "fast"
        }
    });

    const chooseGameType = (data) => setGameType(data.gameType)

    return (
        <form onSubmit={handleSubmit((data) => chooseGameType(data))}>
            <br/>
            <br/>

            <p>Choose game type:</p>
            <label htmlFor="fastGame">
                <input
                    {...register("gameType")}
                    type="radio"
                    value="fast"
                    id="fastGame"
                />
                Fast game
            </label>
            <label htmlFor="fullGame">
                <input
                    {...register("gameType")}
                    type="radio"
                    value="full"
                    id="fullGame"
                />
                Full game
            </label>

            <br/>
            <br/>

            <button type="submit">Confirm game type</button>
        </form>
    );
}

export default ChooseGameTypeForm;

