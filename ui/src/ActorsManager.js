import {useState} from "react";

export default function ActorsManager({actors, onAddActor, onDeleteActor}) {
    const [newActorName, setNewActorName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newActorName.trim()) {
            onAddActor(newActorName);
            setNewActorName('');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input 
                        type="text" 
                        value={newActorName} 
                        onChange={e => setNewActorName(e.target.value)}
                        placeholder="Actor Name"
                    />
                    <button type="submit">Add Actor</button>
                </div>
            </form>

            {actors.length === 0 ? <p>No actors found.</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actors.map(actor => (
                            <tr key={actor.id}>
                                <td>{actor.name}</td>
                                <td>
                                    <button 
                                        className="button-outline" 
                                        onClick={() => onDeleteActor(actor.id)}
                                        style={{borderColor: 'red', color: 'red'}}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
