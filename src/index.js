/* eslint-disable no-tabs,no-unused-expressions */
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let subWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      javascript: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  subWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      javascript: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.loadURL('https://mail.google.com');
  subWindow.loadURL('https://map.google.com');
  subWindow.hide()

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  ipcMain.on('reload_url', (event, value) => {
    // console.log('ipcMain url', value);
    mainWindow.loadURL(value);
  });


  const commonJS = id => `
    const url = document.querySelector("#ogbkddg\\\\:${id} a").getAttribute("href")
    ipc.send('reload_url',url)
    `;

  const goMap = () => {
    mainWindow.webContents.executeJavaScript(commonJS(2));
  };

  const goCalendar = () => {
    mainWindow.webContents.executeJavaScript(commonJS(8));
  };

  const goMail = () => {
    mainWindow.webContents.executeJavaScript(commonJS(5));
  };

  const goDrive = () => {
    mainWindow.webContents.executeJavaScript(commonJS(7));
  };

  const goTranslate = () => {
    mainWindow.webContents.executeJavaScript(commonJS('a'));
  };

  const goDoc = () => {
    mainWindow.webContents.executeJavaScript(commonJS('c'));
  };

  const mainMenuTemplate = [
    {},
    {
      label: 'File',
      submenu: [
        {
          label: 'Map',
          click: goMap,
        },
        {
          label: 'Calendar',
          click: goCalendar,
        },
        {
          label: 'Mail',
          click: goMail,
        },
        {
          label: 'Drive',
          click: goDrive,
        },
        {
          label: 'Tanslate',
          click: goTranslate,
        },
        {
          label: 'Document',
          click: goDoc,
        },
        {
          label: 'hide',
          click: () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            subWindow.isVisible() ? subWindow.hide() : subWindow.show();
          },
        },
      ],
    },
  ];
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    subWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
