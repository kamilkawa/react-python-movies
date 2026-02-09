import './App.css';
import {useState, useEffect} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import ActorForm from "./ActorForm";
import ActorsList from "./ActorsList";

function App() {
    const [movies, setMovies] = useState([]);
    const [actors, setActors] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);
    const [addingActor, setAddingActor] = useState(false);

    // avoid contant connection requesting list of movies from server (constant react rendering) by useEffect
    useEffect(() => {
        const fetchMovies = async () => {
            const response = await fetch(`/movies`);
            if (response.ok) {
                const movies = await response.json();
                setMovies(movies);
            }
        };
        const fetchActors = async () => {
            const response = await fetch(`/actors`);
            if (response.ok) {
                const actors = await response.json();
                setActors(actors);
            }
        };
        fetchMovies();
        fetchActors();
    }, []);

    async function handleAddMovie(movie) {
        movie.actors = '';
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const MovieWithId= await response.json();
            movie.id = MovieWithId.id;
            setMovies([...movies, movie]);
            setAddingMovie(false);
        }
        }
    async function handleDeleteMovie(movie) {
        const response = await fetch(`/movies/${movie.id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            const nextMovies = movies.filter(m => m !== movie);
            setMovies(nextMovies);
        }
    }

    async function handleAddActor(actor) {
        const response = await fetch('/actors', {
            method: 'POST',
            body: JSON.stringify(actor),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const actorWithId = await response.json();
            actor.id = actorWithId.id;
            setActors([...actors, actor]);
            setAddingActor(false);
        }
    }

    async function handleDeleteActor(actor) {
        const response = await fetch(`/actors/${actor.id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            const nextActors = actors.filter(a => a !== actor);
            setActors(nextActors);
        }
    }

    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
            
            <div style={{marginBottom: '40px'}}>
                {movies.length === 0
                    ? <p>No movies yet. Maybe add something?</p>
                    : <MoviesList movies={movies}
                                  onDeleteMovie={handleDeleteMovie}
                                  allActors={actors}
                    />}
                {addingMovie
                    ? <MovieForm onMovieSubmit={handleAddMovie}
                                 buttonLabel="Add a movie"
                    />
                    : <button onClick={() => setAddingMovie(true)}>Add a movie</button>}
            </div>

            <hr/>

            <div style={{marginTop: '40px'}}>
                <h2>Actors Management</h2>
                {actors.length === 0
                    ? <p>No actors yet. Add some actors!</p>
                    : <ActorsList actors={actors}
                                  onDeleteActor={handleDeleteActor}
                    />}
                {addingActor
                    ? <ActorForm onActorSubmit={handleAddActor}
                                 buttonLabel="Add an actor"
                    />
                    : <button onClick={() => setAddingActor(true)}>Add an actor</button>}
            </div>
        </div>
    );
}

export default App;
