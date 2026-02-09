import {useState} from "react";

export default function ActorForm(props) {
    const [name, setName] = useState('');

    function addActor(event) {
        event.preventDefault();
        if (name.length < 2) {
            return alert('Name is too short');
        }
        props.onActorSubmit({name});
        setName('');
    }

    return <form onSubmit={addActor}>
        <h2>Add actor</h2>
        <div>
            <label>Name</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)}/>
        </div>
        <button>{props.buttonLabel || 'Submit'}</button>
    </form>;
}
