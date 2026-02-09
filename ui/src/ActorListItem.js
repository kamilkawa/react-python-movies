export default function ActorListItem(props) {
    return (
        <div>
            <strong>{props.actor.name}</strong>
            {' '}
            <a onClick={props.onDelete}>Delete</a>
        </div>
    );
}
