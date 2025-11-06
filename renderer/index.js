const { ipcRenderer } = require('electron');

// Load popular authors
async function loadAuthors() {
  const authorsList = document.getElementById('authorsList');
  authorsList.innerHTML = '<p>Loading authors...</p>';

  try {
    const res = await fetch('https://openlibrary.org/search/authors.json?q=roald');
    const data = await res.json();
    authorsList.innerHTML = '';

    data.docs.slice(0, 15).forEach(a => {
      const div = document.createElement('div');
      div.classList.add('author-card');
      div.textContent = a.name;
      div.addEventListener('click', () => searchBooks(a.name));
      authorsList.appendChild(div);
    });
  } catch {
    authorsList.innerHTML = '<p>❌ Failed to load authors.</p>';
  }
}

// Search books
async function searchBooks(author) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<p>Searching books by <b>${author}</b>...</p>`;

  try {
    const res = await fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(author)}`);
    const data = await res.json();
    resultsDiv.innerHTML = '';

    if (!data.docs.length) {
      resultsDiv.innerHTML = '<p>No books found for this author.</p>';
      return;
    }

    data.docs.slice(0, 10).forEach(book => {
      const div = document.createElement('div');
      div.classList.add('book-card');
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p><b>Author:</b> ${book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
        <p><b>Edition:</b> ${book.edition_count || 'N/A'}</p>
        <p><b>Year:</b> ${book.first_publish_year || 'Unknown'}</p>
        <button class="save-btn">💾 Save</button>
      `;

      div.querySelector('.save-btn').addEventListener('click', () => {
        ipcRenderer.send('save-book', {
          title: book.title,
          author: book.author_name ? book.author_name.join(', ') : 'Unknown',
          edition: book.edition_count || 'N/A',
          year: book.first_publish_year || 'Unknown',
          summary: '',
          read: false
        });
        alert(`Saved "${book.title}"`);
      });
      resultsDiv.appendChild(div);
    });
  } catch {
    resultsDiv.innerHTML = '<p>❌ Error loading books.</p>';
  }
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const author = document.getElementById('author').value.trim();
  if (!author) return alert('Please enter an author name.');
  searchBooks(author);
});

document.getElementById('viewBtn').addEventListener('click', () => {
  ipcRenderer.send('open-list-window');
});

loadAuthors();
