from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any, List, Optional
import sqlite3


class Actor(BaseModel):
    name: str


class Movie(BaseModel):
    title: str
    year: str
    actors: List[int] = []


app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory="../ui/build/static", check_dir=False),
    name="static",
)


def get_db_connection():
    db = sqlite3.connect("movies.db")
    db.execute("PRAGMA foreign_keys = ON")
    return db


@app.get("/")
def serve_react_app():
    return FileResponse("../ui/build/index.html")


@app.get("/movies")
def get_movies():
    db = get_db_connection()
    cursor = db.cursor()
    movies = cursor.execute("SELECT * FROM movies").fetchall()

    output = []
    for movie in movies:
        movie_id = movie[0]
        # Fetch actors for this movie
        actors = cursor.execute(
            """
            SELECT a.id, a.name 
            FROM actors a 
            JOIN movie_actors ma ON a.id = ma.actor_id 
            WHERE ma.movie_id = ?
            """,
            (movie_id,),
        ).fetchall()

        actors_list = [{"id": a[0], "name": a[1]} for a in actors]

        movie_data = {
            "id": movie_id,
            "title": movie[1],
            "year": movie[2],
            "actors": actors_list,
        }
        output.append(movie_data)
    return output


@app.get("/movies/{movie_id}")
def get_single_movie(movie_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    movie = cursor.execute(f"SELECT * FROM movies WHERE id={movie_id}").fetchone()
    if movie is None:
        return {"message": "Movie not found"}

    actors = cursor.execute(
        """
        SELECT a.id, a.name 
        FROM actors a 
        JOIN movie_actors ma ON a.id = ma.actor_id 
        WHERE ma.movie_id = ?
        """,
        (movie_id,),
    ).fetchall()
    actors_list = [{"id": a[0], "name": a[1]} for a in actors]

    return {"title": movie[1], "year": movie[2], "actors": actors_list}


@app.post("/movies")
def add_movie(movie: Movie):
    db = get_db_connection()
    cursor = db.cursor()
    # Insert movie (ignoring legacy actors column)
    cursor.execute(
        "INSERT INTO movies (title, year, actors) VALUES (?, ?, ?)",
        (movie.title, movie.year, ""),
    )
    movie_id = cursor.lastrowid

    # Insert actor associations
    for actor_id in movie.actors:
        cursor.execute(
            "INSERT INTO movie_actors (movie_id, actor_id) VALUES (?, ?)",
            (movie_id, actor_id),
        )

    db.commit()
    return {
        "message": f"Movie with id = {movie_id} added successfully",
        "id": movie_id,
    }


@app.put("/movies/{movie_id}")
def update_movie(movie_id: int, movie: Movie):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE movies SET title = ?, year = ? WHERE id = ?",
        (movie.title, movie.year, movie_id),
    )

    # Update actors: remove old, add new
    cursor.execute("DELETE FROM movie_actors WHERE movie_id = ?", (movie_id,))
    for actor_id in movie.actors:
        cursor.execute(
            "INSERT INTO movie_actors (movie_id, actor_id) VALUES (?, ?)",
            (movie_id, actor_id),
        )

    db.commit()
    return {"message": f"Movie with id = {movie_id} updated successfully"}


@app.delete("/movies/{movie_id}")
def delete_movie(movie_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    # Delete associations first
    cursor.execute("DELETE FROM movie_actors WHERE movie_id = ?", (movie_id,))
    cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {"message": f"Movie with id = {movie_id} deleted successfully"}


@app.delete("/movies")
def delete_movies():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("DELETE FROM movie_actors")
    cursor.execute("DELETE FROM movies")
    db.commit()
    return {"message": "Deleted all movies"}


# Actor Endpoints


@app.get("/actors")
def get_actors():
    db = get_db_connection()
    cursor = db.cursor()
    actors = cursor.execute("SELECT * FROM actors").fetchall()
    return [{"id": a[0], "name": a[1]} for a in actors]


@app.post("/actors")
def add_actor(actor: Actor):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("INSERT INTO actors (name) VALUES (?)", (actor.name,))
    db.commit()
    return {
        "message": f"Actor with id = {cursor.lastrowid} added successfully",
        "id": cursor.lastrowid,
        "name": actor.name,
    }


@app.delete("/actors/{actor_id}")
def delete_actor(actor_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    # Delete associations first
    cursor.execute("DELETE FROM movie_actors WHERE actor_id = ?", (actor_id,))
    cursor.execute("DELETE FROM actors WHERE id = ?", (actor_id,))
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Actor with id = {actor_id} not found"}
    return {"message": f"Actor with id = {actor_id} deleted successfully"}
