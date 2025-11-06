const { ipcRenderer } = require('electron');

function loadBooks() {
  ipcRenderer.invoke('load-books').then((books) => {
    const list = document.getElementById('bookList');
    list.innerHTML = '';

    if (!books.length) {
      list.innerHTML = '<p class="empty-msg">No books saved yet. 📖</p>';
      return;
    }

    books
      .sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0))
      .forEach((b) => {
        const div = document.createElement('div');
        div.classList.add('book-card');
        div.innerHTML = `
          <h3>${b.title}</h3>
          <p><b>Author:</b> ${b.author}</p>
          <p><b>Edition:</b> ${b.edition}</p>
          <p><b>Year:</b> ${b.year}</p>
          <p><b>Date Added:</b> ${b.dateAdded || 'N/A'}</p>
          <p><b>Read:</b> ${b.read ? '✅ Yes' : '❌ No'}</p>
          <textarea id="summary-${b.title}" placeholder="Write summary...">${b.summary || ''}</textarea>
          <button class="update-btn" data-title="${b.title}">💾 Update</button>
          <button class="mark-btn" data-title="${b.title}">📗 Mark as Read</button>
          <button class="delete-btn" data-title="${b.title}">🗑 Delete</button>
          <button class="details-btn" data-title="${b.title}">🔎 View Details</button>
        `;
        list.appendChild(div);
      });
  });
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    ipcRenderer.send('delete-book', e.target.dataset.title);
    setTimeout(loadBooks, 400);
  }
  if (e.target.classList.contains('update-btn')) {
    const title = e.target.dataset.title;
    const summary = document.getElementById(`summary-${title}`).value;
    ipcRenderer.send('update-summary', { title, summary });
  }
  if (e.target.classList.contains('mark-btn')) {
    ipcRenderer.send('mark-read', e.target.dataset.title);
    setTimeout(loadBooks, 400);
  }
  if (e.target.classList.contains('details-btn')) {
    ipcRenderer.send('open-details-window', e.target.dataset.title);
  }
});

document.getElementById('backBtn').addEventListener('click', () => window.close());
loadBooks();
