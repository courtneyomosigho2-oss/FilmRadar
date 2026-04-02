const API_KEY = '3b43e91e'; 
const searchBtn = document.getElementById('search-btn');
const resultsGrid = document.getElementById('results-grid');

if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        const query = document.getElementById('movie-input').value.trim();
        if(!query) return;

        resultsGrid.innerHTML = `<p style="color: #7fdbff; text-align: center; width: 100%;">Scanning the database...</p>`;

        try {
            const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
            const data = await res.json();
            if (data.Response === "True") {
                displayMovies(data.Search);
            } else {
                resultsGrid.innerHTML = `<p style="text-align: center; width: 100%;">No movies found. Try another title!</p>`;
            }
        } catch (err) {
            console.error(err);
        }
    });
}

function displayMovies(movies) {
    resultsGrid.innerHTML = ""; 
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        card.onclick = () => {
            localStorage.setItem('selectedMovieID', movie.imdbID);
            window.location.href = 'details.html';
        };

        card.onmouseover = () => card.style.transform = "translateY(-10px) scale(1.03)";
        card.onmouseout = () => card.style.transform = "translateY(0) scale(1)";

        card.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'images/placeholder.jpg'}" alt="${movie.Title}">
            <div class="card-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <span style="color: #7fdbff; font-size: 0.8rem;">View Details</span>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}

async function loadDetails() {
    const id = localStorage.getItem('selectedMovieID');
    const container = document.getElementById('movie-details');
    if (!id || !container) return;

    try {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
        const movie = await res.json();
        const trailerSearch = encodeURIComponent(movie.Title + " " + movie.Year + " official trailer");
        const trailerUrl = `https://www.youtube.com/results?search_query=${trailerSearch}`;

        container.innerHTML = `
            <div style="display: flex; gap: 30px; margin-top: 30px; color: white; align-items: flex-start; flex-wrap: wrap;">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'images/placeholder.jpg'}" style="width: 300px; border-radius: 10px; border: 2px solid #7fdbff;">
                <div style="flex: 1; min-width: 300px; text-align: left;">
                    <h1 style="color: #7fdbff; margin-top: 0;">${movie.Title} (${movie.Year})</h1>
                    <button onclick="addToWatchLater('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}', '${movie.Poster}')" 
                            style="margin-bottom: 20px; padding: 12px 24px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            + Add to Watch Later
                    </button>
                    <p style="margin: 10px 0; line-height: 1.6;">${movie.Plot}</p>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #7fdbff;">
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Cast:</strong> ${movie.Actors}</p>
                        <p><strong>Rating:</strong> ⭐ ${movie.imdbRating}</p>
                    </div>
                    <a href="${trailerUrl}" target="_blank" style="text-decoration: none;">
                        <div style="width: 100%; height: 100px; background: #000; border-radius: 12px; border: 2px solid #7fdbff; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                            <p style="color: #7fdbff; font-weight: bold;">WATCH TRAILER ON YOUTUBE</p>
                        </div>
                    </a>
                </div>
            </div>
        `;
    } catch (err) { console.error(err); }
}

function addToWatchLater(id, title, poster) {
    let list = JSON.parse(localStorage.getItem('watchLaterList')) || [];
    if (list.some(m => m.id === id)) return;
    list.push({ id, title, poster });
    localStorage.setItem('watchLaterList', JSON.stringify(list));
    alert(title + " added to Watch Later!");
}

function displayWatchLater() {
    const grid = document.getElementById('watch-later-grid');
    if (!grid) return;
    const saved = JSON.parse(localStorage.getItem('watchLaterList')) || [];

    if (saved.length === 0) {
        grid.innerHTML = `<div style="text-align: center; width: 100%; padding: 50px;"><h2>List is empty</h2></div>`;
        return;
    }

    grid.innerHTML = saved.map(m => `
        <div class="watch-later-item" style="background: #112240; border-radius: 15px; overflow: hidden; border: 1px solid rgba(127, 219, 255, 0.1);">
            <img src="${m.poster}" style="width: 100%; height: 350px; object-fit: cover;">
            <div style="padding: 15px; text-align: center;">
                <h3 style="color: #7fdbff; margin: 0;">${m.title}</h3>
                <button onclick="removeFromWatchLater('${m.id}')" style="margin-top: 10px; background: transparent; border: 1px solid #ff4747; color: #ff4747; cursor: pointer; border-radius: 5px; padding: 5px 10px;">Remove</button>
            </div>
        </div>
    `).join('');
}

function removeFromWatchLater(id) {
    let list = JSON.parse(localStorage.getItem('watchLaterList')) || [];
    list = list.filter(m => m.id !== id);
    localStorage.setItem('watchLaterList', JSON.stringify(list));
    displayWatchLater();
}

function loadWatchLaterPreview() {
    const container = document.getElementById('watch-later-preview');
    const grid = document.getElementById('preview-grid');
    const list = JSON.parse(localStorage.getItem('watchLaterList')) || [];

    if (list.length > 0 && container) {
        container.style.display = "block";
        grid.innerHTML = list.slice(0, 5).map(m => `
            <div style="min-width: 120px; text-align: center; cursor: pointer;" onclick="goToDetails('${m.id}')">
                <img src="${m.poster}" style="width: 100px; border-radius: 5px; border: 1px solid #7fdbff;">
                <p style="font-size: 0.7rem; color: white; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">${m.title}</p>
            </div>
        `).join('');
    } else if (container) {
        container.style.display = "none";
    }
}

function goToDetails(id) {
    localStorage.setItem('selectedMovieID', id);
    window.location.href = 'details.html';
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedback = document.getElementById('form-feedback');
        feedback.innerHTML = `<p style="color:#7fdbff;">Message received. Thank you!</p>`;
        contactForm.reset();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('details.html')) loadDetails();
    if (path.includes('watch-later.html')) displayWatchLater();
    if (path.includes('index.html') || path.endsWith('/')) loadWatchLaterPreview();
});