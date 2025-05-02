import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const KEY = "fa2318e2";

const average = (arr) => {
  if (arr.length === 0) return 0; // Handle empty arrays
  return arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
};

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setselectedId] = useState(null);
  const [userRating, setUserRating] = useState(0);

  const handleAddWatchedMovie = (movie) => {
    setWatched((watched) => [...watched, movie]);
    console.log(`Added "${movie.Title}" to watched movies.`);
  };

  const handleSelectMovie = (id) => {
    setselectedId(id);
  };

  const handleCloseMovie = () => {
    setselectedId(null);
  };

  const handleDeleteWatchedMovie = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    console.log(`Deleted movie with ID "${id}" from watched movies.`);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      const controller = new AbortController(); // Create an AbortController instance
      const signal = controller.signal; // Get the signal to pass to fetch

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal } // Pass the signal to the fetch request
        );

        if (!res.ok) {
          throw new Error("Something went wrong with fetching movies");
        }

        const data = await res.json();

        if (data.Response === "False") {
          throw new Error("Movie not found");
        }

        setMovies(data.Search);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }

      return () => {
        controller.abort(); // Abort the fetch request when the component unmounts or query changes
      };
    };

    if (query.length < 3) {
      setMovies([]);
      setError(null);
      return;
    }

    fetchMovies();
  }, [query]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <>
          <Box>
            {isLoading && <Loader />}
            {error && <ErrorMessage message={error} />}
            {!isLoading && !error && (
              <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
            )}
          </Box>

          <Box>
            {selectedId ? (
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatchedMovie={handleAddWatchedMovie}
                watched={watched}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMoviesList
                  watched={watched}
                  onDeleteWatchedMovie={handleDeleteWatchedMovie}
                />
              </>
            )}
          </Box>
        </>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span role="img" aria-label="error">
        ❌
      </span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img" aria-label="popcorn">
        🍿
      </span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, observerRef }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie, index) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          ref={index === movies.length - 1 ? observerRef : null} // Attach ref to the last movie
        />
      ))}
    </ul>
  );
}

const Movie = React.forwardRef(({ movie }, ref) => (
  <li ref={ref}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
));

function SelectedMovie({ selectedId }) {
  return <div className="details">{selectedId}</div>;
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

// MovieDetails component definition
function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const data = await res.json();

        if (data.Response === "False") {
          throw new Error(data.Error || "Movie not found");
        }

        setMovie(data);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedId) {
      fetchMovieDetails();
    }
  }, [selectedId]);

  // Side effect to handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseMovie();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCloseMovie]);

  // Side effect to change the tab name
  useEffect(() => {
    if (movie) {
      document.title = `${movie.Title} - usePopcorn`;
    }

    return () => {
      document.title = "usePopcorn"; // Reset title when unmounting or changing movie
    };
  }, [movie]);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!movie) return null;

  const handleAdd = () => {
    const watchedMovie = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      runtime: Number(movie.Runtime.replace(" min", "")), // Ensure runtime is a number
      imdbRating: Number(movie.imdbRating), // Ensure imdbRating is a number
      userRating,
    };
    onAddWatchedMovie(watchedMovie);
    onCloseMovie();
  };

  const alreadyRatedMovie = watched.find(
    (watchedMovie) => watchedMovie.imdbID === selectedId
  );

  return (
    <div className="details">
      <button className="btn-back" onClick={onCloseMovie}>
        ←
      </button>
      <header className="details-overview">
        <img
          src={movie.Poster}
          alt={`${movie.Title} poster`}
          className="poster"
        />
        <div className="movie-info">
          <h2>{movie.Title}</h2>
          <p>
            <span>⭐️</span>
            {movie.imdbRating} IMDb Rating
          </p>
          <p>
            <span>📅</span>
            {movie.Year}
          </p>
          <p>
            <span>🎥</span>
            {movie.Genre}
          </p>
        </div>
      </header>
      <div className="rating-container">
        {alreadyRatedMovie ? (
          <p className="already-rated">
            You rated this movie a {alreadyRatedMovie.userRating}
          </p>
        ) : (
          <>
            <StarRating
              maxRating={10}
              color="#fcc419"
              size={24}
              defaultRating={0}
              onSetRating={(rating) => setUserRating(rating)}
            />
            <button
              className="btn-add"
              onClick={handleAdd}
              disabled={userRating === 0} // Disable button until a rating is set
            >
              + Add to Watched
            </button>
          </>
        )}
      </div>
      <section>
        <p>{movie.Plot}</p>
        <p>
          <strong>Director:</strong> {movie.Director}
        </p>
        <p>
          <strong>Actors:</strong> {movie.Actors}
        </p>
        <p>
          <strong>Runtime:</strong> {movie.Runtime}
        </p>
      </section>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatchedMovie }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay for slow network conditions
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("Watched movies loaded successfully.");
    }, 3000); // Simulate a 3-second delay for 3G network

    return () => clearTimeout(timer); // Cleanup timeout
  }, []);

  if (isLoading) {
    console.log("Loading watched movies...");
    return <p className="loader">Loading watched movies...</p>;
  }

  if (watched.length === 0) {
    console.log("No watched movies found.");
    return <p className="loader">No watched movies to display.</p>; // Apply the "loader" class
  }

  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDelete={() => onDeleteWatchedMovie(movie.imdbID)}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDelete }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}
