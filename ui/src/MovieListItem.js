import {useState, useEffect} from "react";

export default function MovieListItem(props) {
    const [movieActors, setMovieActors] = useState([]);
    const [assigningActor, setAssigningActor] = useState(false);

    useEffect(() => {
        if (props.movie.id) {
            fetchMovieActors();
        }
    }, [props.movie.id]);

    async function fetchMovieActors() {
        const response = await fetch(`/movies/${props.movie.id}/actors`);
        if (response.ok) {
            const actors = await response.json();
            setMovieActors(actors);
        }
    }

    async function handleAssignActor(actorId) {
        const response = await fetch(`/movies/${props.movie.id}/actors/${actorId}`, {
            method: 'POST',
        });
        if (response.ok) {
            fetchMovieActors();
        }
    }

    async function handleRemoveActor(actorId) {
        const response = await fetch(`/movies/${props.movie.id}/actors/${actorId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            fetchMovieActors();
        }
    }

    return (
        <div>
            <div>
                <strong>{props.movie.title}</strong>
                {' '}
                <span>({props.movie.year})</span>
                {' '}
                directed by {props.movie.director}
                {' '}
                <a onClick={props.onDelete}>Delete</a>
            </div>
            {props.movie.description}
            {movieActors.length > 0 && (
                <div style={{marginTop: '10px'}}>
                    <strong>Actors: </strong>
                    {movieActors.map(actor => (
                        <span key={actor.id}>
                            {actor.name}
                            {' '}
                            <a onClick={() => handleRemoveActor(actor.id)}>[remove]</a>
                            {' '}
                        </span>
                    ))}
                </div>
            )}
            {assigningActor ? (
                <div style={{marginTop: '10px'}}>
                    <select onChange={(e) => {
                        if (e.target.value) {
                            handleAssignActor(e.target.value);
                            setAssigningActor(false);
                        }
                    }}>
                        <option value="">Select actor...</option>
                        {props.allActors.filter(a => !movieActors.find(ma => ma.id === a.id)).map(actor => (
                            <option key={actor.id} value={actor.id}>{actor.name}</option>
                        ))}
                    </select>
                    {' '}
                    <button onClick={() => setAssigningActor(false)}>Cancel</button>
                </div>
            ) : (
                <div style={{marginTop: '10px'}}>
                    <a onClick={() => setAssigningActor(true)}>Assign actor</a>
                </div>
            )}
        </div>
    );
}
