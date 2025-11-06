const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const booksFile = path.join(__dirname, 'data', 'books.json');

// Helper functions
function loadBooks() {
  try {
    if (!fs.existsSync(booksFile)) return [];
    return JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
  } catch {
    return [];
  }
}

function saveBooks(data) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
}

// Windows
let mainWindow;
let listWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 750,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function createListWindow() {
  listWindow = new BrowserWindow({
    width: 850,
    height: 700,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  listWindow.loadFile(path.join(__dirname, 'renderer', 'itinerary.html'));
}

function createDetailsWindow(bookTitle) {
  const detailsWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  detailsWindow.loadFile(path.join(__dirname, 'renderer', 'details.html'));

  detailsWindow.webContents.on('did-finish-load', () => {
    detailsWindow.webContents.send('book-title', bookTitle);
  });
}

// IPC
ipcMain.on('open-list-window', () => createListWindow());
ipcMain.on('open-details-window', (event, title) => createDetailsWindow(title));

// CREATE
ipcMain.on('save-book', (event, book) => {
  let books = loadBooks();
  const dateAdded = new Date().toLocaleDateString('en-GB');
  if (!books.find(b => b.title.toLowerCase() === book.title.toLowerCase())) {
    book.dateAdded = dateAdded;
    books.push(book);
    saveBooks(books);
  }
});

// READ
ipcMain.handle('load-books', () => loadBooks());

// UPDATE SUMMARY
ipcMain.on('update-summary', (event, { title, summary }) => {
  let books = loadBooks();
  const idx = books.findIndex(b => b.title.toLowerCase() === title.toLowerCase());
  if (idx !== -1) {
    books[idx].summary = summary;
    saveBooks(books);
  }
});

// MARK READ
ipcMain.on('mark-read', (event, title) => {
  let books = loadBooks();
  const idx = books.findIndex(b => b.title.toLowerCase() === title.toLowerCase());
  if (idx !== -1) {
    books[idx].read = true;
    saveBooks(books);
  }
});

// DELETE
ipcMain.on('delete-book', (event, title) => {
  let books = loadBooks();
  const filtered = books.filter(b => b.title.toLowerCase() !== title.toLowerCase());
  saveBooks(filtered);
});

// App ready
app.whenReady().then(createMainWindow);
