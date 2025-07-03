const API_KEY = "6dc725b4"; 
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const modal = document.getElementById("movieModal");
const modalBody = document.querySelector(".modalBody");
const closeBtn = document.querySelector(".close-btn");

let currentQuery = "";
let currentPage = 1;  // added let here
let debounceTimer = null;

function debounce(callback, delay){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(callback, delay);
}

async function fetchMovies(query, page = 1) {
    // Fixed URL template string and function name encodeURIComponent
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`);
    const data = await res.json();
    return data.Response === "True" ? data.Search : [];
}

function renderMovies(movies, append = false) {
    const html = movies.map((movie) =>
        `<div class="movie-card" data-id="${movie.imdbID}">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : ""}" alt="${movie.Title}">
            <div class="movie-infor">${movie.Title} (${movie.Year})</div>
        </div>`
    ).join("");

    if (append) results.innerHTML += html;
    else results.innerHTML = html;
}

searchInput.addEventListener("input", () => {
    debounce(async () => {
       
        const query = searchInput.value.trim();
        if (!query) {
            results.innerHTML = "";  
            loadMoreBtn.style.display = "none";
            return;
        }
        currentQuery = query;
        currentPage = 1;
        const movies = await fetchMovies(currentQuery, currentPage);
        renderMovies(movies);
        loadMoreBtn.style.display = movies.length >= 10 ? "block" : "none";
    }, 500);  
});

loadMoreBtn.addEventListener("click",async ()=>{
    CurrentPage++;
    const movies = await fetchMovies(currentQuery,currentPage);
    renderMovies(movies,true);
    if(movies.length<10) loadMoreBtn.style.display = "none";

})

async function fetchMovieDetails(imdbID){
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`);

    const data = await res.json();
    return data.Response==="True"?data:{};
}

results.addEventListener("click",async(e)=>{
    const card = e.target.closest(".movie-card");
    if(!card) return;
    const movieID = card.dataset.id;
    if(!movieID) return alert("IMDB ID is not found");
    const movie = await fetchMovieDetails(movieID);
    showModal(movie);
})
function showModal(movie){
    modalBody.innerHTML = `<img src="${
      movie.Poster !== "N/A"
        ? movie.Poster
        : "https://via.placeholder.com/150x225"
    }">
    <div>
      <h2>${movie.Title || "No Title"} (${movie.Year || "N/A"})</h2>
      <p><strong>Genre:</strong> ${
        movie.Genre !== "N/A" ? movie.Genre : "Not available"
      }</p>
      <p><strong>IMDb:</strong> ${
        movie.imdbRating !== "N/A" ? movie.imdbRating : "N/A"
      } | 
         <strong>Runtime:</strong> ${
           movie.Runtime !== "N/A" ? movie.Runtime : "N/A"
         }</p>
      <p><strong>Director:</strong> ${
        movie.Director !== "N/A" ? movie.Director : "N/A"
      }</p>
      <p><strong>Actors:</strong> ${
        movie.Actors !== "N/A" ? movie.Actors : "N/A"
      }</p>
      <p><strong>Plot:</strong> ${
        movie.Plot !== "N/A" ? movie.Plot : "No plot available"
      }</p>
      <p><strong>Box Office:</strong> ${
        movie.BoxOffice && movie.BoxOffice !== "N/A"
          ? movie.BoxOffice
          : "Not disclosed"
      }</p>
    </div>`;
    modal.style.display="block";
}
closeBtn.addEventListener("click",()=>{
    return modal.style.display="none";
})