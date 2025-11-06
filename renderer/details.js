const { ipcRenderer } = require('electron');

ipcRenderer.on('book-title', (event, title) => {
  loadBookDetails(title);
});

function loadBookDetails(title) {
  ipcRenderer.invoke('load-books').then((books) => {
    const book = books.find(b => b.title.toLowerCase() === title.toLowerCase());
    const detailsDiv = document.getElementById('bookDetails');
    const titleHeading = document.getElementById('bookTitle');

    if (!book) {
      titleHeading.textContent = 'Book not found';
      detailsDiv.innerHTML = '<p>No data available.</p>';
      return;
    }

    titleHeading.textContent = book.title;
    detailsDiv.innerHTML = `
      <p><b>Author:</b> ${book.author}</p>
      <p><b>Edition:</b> ${book.edition}</p>
      <p><b>Published Year:</b> ${book.year}</p>
      <p><b>Date Added:</b> ${book.dateAdded || 'N/A'}</p>
      <p><b>Read Status:</b> ${book.read ? '✅ Yes' : '❌ No'}</p>
      <p><b>Your Summary:</b></p>
      <blockquote>${book.summary || 'No summary written.'}</blockquote>
    `;
  });
}

document.getElementById('closeBtn')?.addEventListener('click', () => window.close());
