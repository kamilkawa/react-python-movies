from fastapi import FastAPI, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any
import sqlite3
import os


class Movie(BaseModel):
    title: str
    year: str


class Actor(BaseModel):
    name: str


# Get database path relative to this file
DB_PATH = os.path.join(os.path.dirname(__file__), "movies.db")

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory="../ui/build/static", check_dir=False),
    name="static",
)


@app.get("/")
def serve_react_app():
    return FileResponse("../ui/build/index.html")


@app.get("/movies")
def get_movies():  # put application's code here
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    movies = cursor.execute("SELECT * FROM movies")

    output = []
    for movie in movies:
        movie = {
            "id": movie[0],
            "title": movie[1],
            "year": movie[2],
            "actors": movie[3],
        }
        output.append(movie)
    return output


@app.get("/movies/{movie_id}")
def get_single_movie(movie_id: int):  # put application's code here
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    movie = cursor.execute(f"SELECT * FROM movies WHERE id={movie_id}").fetchone()
    if movie is None:
        return {"message": "Movie not found"}
    return {"title": movie[1], "year": movie[2], "actors": movie[3]}


@app.post("/movies")
def add_movie(movie: Movie):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute(
        f"INSERT INTO movies (title, year) VALUES ('{movie.title}', '{movie.year}')"
    )
    db.commit()
    return {
        "id": cursor.lastrowid,
        "message": f"Movie with id = {cursor.lastrowid} added successfully",
    }
    # movie = models.Movie.create(**movie.dict())
    # return movie


@app.put("/movies/{movie_id}")
def update_movie(movie_id: int, params: dict[str, Any]):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute(
        "UPDATE movies SET title = ?, year = ?, actors = ? WHERE id = ?",
        (params["title"], params["year"], params["actors"], movie_id),
    )
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {"message": f"Movie with id = {cursor.lastrowid} updated successfully"}


@app.delete("/movies/{movie_id}")
def delete_movie(movie_id: int):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {"message": f"Movie with id = {movie_id} deleted successfully"}


@app.delete("/movies")
def delete_movies(movie_id: int):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies")
    db.commit()
    return {"message": f"Deleted {cursor.rowcount} movies"}


# Actors endpoints
@app.get("/actors")
def get_actors():
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    actors = cursor.execute("SELECT * FROM actors")

    output = []
    for actor in actors:
        actor_data = {
            "id": actor[0],
            "name": actor[1],
        }
        output.append(actor_data)
    return output


@app.post("/actors")
def add_actor(actor: Actor):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute(f"INSERT INTO actors (name) VALUES ('{actor.name}')")
    db.commit()
    return {
        "id": cursor.lastrowid,
        "message": f"Actor with id = {cursor.lastrowid} added successfully",
    }


@app.delete("/actors/{actor_id}")
def delete_actor(actor_id: int):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute("DELETE FROM movie_actors WHERE actor_id = ?", (actor_id,))
    cursor.execute("DELETE FROM actors WHERE id = ?", (actor_id,))
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Actor with id = {actor_id} not found"}
    return {"message": f"Actor with id = {actor_id} deleted successfully"}


# Movie-Actor relationships
@app.get("/movies/{movie_id}/actors")
def get_movie_actors(movie_id: int):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    actors = cursor.execute(
        "SELECT a.id, a.name FROM actors a JOIN movie_actors ma ON a.id = ma.actor_id WHERE ma.movie_id = ?",
        (movie_id,),
    )

    output = []
    for actor in actors:
        actor_data = {
            "id": actor[0],
            "name": actor[1],
        }
        output.append(actor_data)
    return output


@app.post("/movies/{movie_id}/actors/{actor_id}")
def assign_actor_to_movie(movie_id: int, actor_id: int):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO movie_actors (movie_id, actor_id) VALUES (?, ?)",
        (movie_id, actor_id),
    )
    db.commit()
    return {"message": f"Actor {actor_id} assigned to movie {movie_id}"}


@app.delete("/movies/{movie_id}/actors/{actor_id}")
def remove_actor_from_movie(movie_id: int, actor_id: int):
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    cursor.execute(
        "DELETE FROM movie_actors WHERE movie_id = ? AND actor_id = ?",
        (movie_id, actor_id),
    )
    db.commit()
    if cursor.rowcount == 0:
        return {"message": "Assignment not found"}
    return {"message": f"Actor {actor_id} removed from movie {movie_id}"}


# if __name__ == '__main__':
#     app.run()
