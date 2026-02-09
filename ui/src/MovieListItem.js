export default function MovieListItem(props) {
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
            {props.movie.actors && props.movie.actors.length > 0 && (
                <div style={{marginTop: '5px', fontSize: '0.9em', color: '#666'}}>
                    <strong>Actors: </strong>
                    {props.movie.actors.map(a => a.name).join(', ')}
                </div>
            )}
        </div>
    );
}
