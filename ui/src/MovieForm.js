import {useState} from "react";

export default function MovieForm(props) {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [director, setDirector] = useState('');
    const [description, setDescription] = useState('');
    const [selectedActors, setSelectedActors] = useState([]);

    function addMovie(event) {
        event.preventDefault();
        if (title.length < 5) {
            return alert('Tytuł jest za krótki');
        }
        props.onMovieSubmit({
            title, 
            year, 
            director, 
            description,
            actors: selectedActors
        });
        setTitle('');
        setYear('');
        setDirector('');
        setDescription('');
        setSelectedActors([]);
    }

    const handleActorToggle = (actorId) => {
        if (selectedActors.includes(actorId)) {
            setSelectedActors(selectedActors.filter(id => id !== actorId));
        } else {
            setSelectedActors([...selectedActors, actorId]);
        }
    };

    return <form onSubmit={addMovie}>
        <h2>Add movie</h2>
        <div>
            <label>Tytuł</label>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)}/>
        </div>
        <div>
            <label>Year</label>
            <input type="text" value={year} onChange={(event) => setYear(event.target.value)}/>
        </div>
        <div>
            <label>Director</label>
            <input type="text" value={director} onChange={(event) => setDirector(event.target.value)}/>
        </div>
        <div>
            <label>Description</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)}/>
        </div>
        
        {props.availableActors && props.availableActors.length > 0 && (
            <div style={{marginBottom: '20px'}}>
                <label>Actors</label>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                    {props.availableActors.map(actor => (
                        <div key={actor.id} style={{display: 'flex', alignItems: 'center'}}>
                            <input 
                                type="checkbox" 
                                id={`actor-${actor.id}`}
                                checked={selectedActors.includes(actor.id)}
                                onChange={() => handleActorToggle(actor.id)}
                                style={{marginRight: '5px'}}
                            />
                            <label htmlFor={`actor-${actor.id}`} style={{marginBottom: 0, fontWeight: 'normal'}}>
                                {actor.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <button>{props.buttonLabel || 'Submit'}</button>
    </form>;
}
