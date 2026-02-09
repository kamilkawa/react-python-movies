import './App.css';
import {useState, useEffect} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import ActorsManager from "./ActorsManager";

function App() {
    const [movies, setMovies] = useState([]);
    const [actors, setActors] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);

    // fetch movies and actors
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
                const data = await response.json();
                setActors(data);
            }
        };
        fetchMovies();
        fetchActors();
    }, []);

    async function handleAddMovie(movie) {
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const moviesResp = await fetch('/movies');
            if (moviesResp.ok) {
                 setMovies(await moviesResp.json());
            }
            setAddingMovie(false);
        }
    }

    async function handleDeleteMovie(movie) {
        const response = await fetch(`/movies/${movie.id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            const nextMovies = movies.filter(m => m.id !== movie.id);
            setMovies(nextMovies);
        }
    }

    async function handleAddActor(name) {
        const response = await fetch('/actors', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        });
        if (response.ok) {
            const newActor = await response.json();
            setActors([...actors, {id: newActor.id, name: newActor.name}]);
        }
    }

    async function handleDeleteActor(id) {
        const response = await fetch(`/actors/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            setActors(actors.filter(a => a.id !== id));
            const moviesResp = await fetch('/movies');
            if (moviesResp.ok) {
                 setMovies(await moviesResp.json());
            }
        }
    }

    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
            {movies.length === 0
                ? <p>No movies yet. Maybe add something?</p>
                : <MoviesList movies={movies}
                              onDeleteMovie={handleDeleteMovie}
                />}
            {addingMovie
                ? <MovieForm onMovieSubmit={handleAddMovie}
                             buttonLabel="Add a movie"
                             availableActors={actors}
                />
                : <button onClick={() => setAddingMovie(true)}>Add a movie</button>}
            
            <div style={{marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px'}}>
                <h2>Manage Actors</h2>
                <ActorsManager 
                    actors={actors}
                    onAddActor={handleAddActor}
                    onDeleteActor={handleDeleteActor}
                />
            </div>
        </div>
    );
}

export default App;
