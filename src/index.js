const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');
const path = require('path');
const fs = require('fs')

const defaultPage = {
	url: 'https://mail.google.com',
	name: 'Mail'
}

class GoogleSuit {

	constructor() {
		this.mainWindow = null
		this.init()
	}

	init() {
		app.on('ready', () => {
			this.createWindow()
		});

		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});

		app.on('activate', () => {
			if (this.mainWindow === null) {
				this.createWindow();
			}
		});
	}

	createWindow() {
		// Create the browser window.
		this.mainWindow = new BrowserWindow({
			show: false,
			transparent: true,
			// frame: false,
			width: 1000,
			height: 600,
			webPreferences: {
				nativeWindowOpen: true,
				javascript: true,
				preload: path.join(__dirname, 'preload.js'),
			},
		});

		const debug = true
		if (debug) {
			this.openDevTool()
		}

		// and load the index.html of the app.
		// mainWindow.loadURL(`file://${__dirname}/index.html`);
		this.mainWindow.loadURL(defaultPage.url);
		this.mainWindow.currentName = defaultPage.name

		this.getIconsFromRender()
		this.ipcSubscriber()

		// gracefully show
		this.mainWindow.once('ready-to-show', () => {
			this.mainWindow.show()
		})

		this.mainWindow.on('closed', () => {
			this.mainWindow = null;
			this.removePlaytimeObserver()
		});

		//handle open _blank window in chrome...
		this.mainWindow.webContents.on('new-window', (event, url) => {
			event.preventDefault()
			shell.openExternal(url)
		})

		// dom ready
		// this.mainWindow.webContents.on('dom-ready', () => {
		//
		// })

		// this.addPlaytimeObserver()

	}

	openDevTool() {
		// Open the DevTools.
		this.mainWindow.webContents.openDevTools();
	}

	ipcSubscriber() {
		ipcMain.on('reload_url', (event, value) => {
			console.log('ipcMain url', value);
			this.mainWindow.loadURL(value);
		});

		ipcMain.on('menu_icons', (event, icons) => {
			console.log('imenu icons', icons);
			this.loadMenus(icons)
		});

		ipcMain.on('inbox_change', (event, msg) => {
			console.log('inbox_change ', msg);
		});

	}

	loadMenus(icons) {
		const commonJS = (id, name) => {
			const indexColon = id.indexOf(':')
			const escapId = id.slice(0, indexColon) + '\\\\' + id.slice(indexColon)
			return `
				const ${name} = document.querySelector("#${escapId} a").getAttribute("href")
				if(${name}){
					ipc.send('reload_url',${name})
				}else{
					ipc.send('reload_url',${defaultPage.url})
				}
    	`
		};
		const submenu = icons.map(ic => {
			const key = Object.keys(ic)[0]
			return {
				label: ic[key],
				click: () => {
					const jsString = commonJS(key, ic[key])
					console.log(jsString)
					if (this.mainWindow.currentName !== ic[key]) {
						this.mainWindow.webContents.executeJavaScript(jsString)
						this.mainWindow.currentName = ic[key]
					} else {
						console.log('currently in the same view', ic[key])
					}
				}
			}
		})

		const mainMenuTemplate = [
			{},
			{
				label: 'File',
				submenu,
			},
			{
				label: "Edit",
				submenu: [
					{label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
					{label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
					{type: "separator"},
					{label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
					{label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
					{label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
					{label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"},
				]
			},
			{
				label: 'Test',
				submenu: [
					{
						label: 'test',
						click: () => {
							this.mainWindow.open('www.github.com')
						}
					}
				],
			}
		];

		const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
		Menu.setApplicationMenu(mainMenu);
	}

	getIconsFromRender() {
		this.mainWindow.webContents.executeJavaScript(`
      const icons = Array.from(document.querySelectorAll("ul.gb_ia.gb_ba li"))
                  .reduce((all, item) => {
                      return [
                        ...all,
                        {[item.id]: item.getElementsByClassName('gb_3')[0].innerHTML}
                      ]
                    }, [])
                    console.log(icons)
      ipc.send('menu_icons',icons)
    `);
	}

	addPlaytimeObserver() {
		const obserJS = fs.readFileSync(path.join(__dirname, 'renderjs/observer.js'), "utf8");
		console.log(obserJS)
		this.mainWindow.webContents.executeJavaScript(obserJS)
	}

	/**
	 * Remove the listener to monitor the play time.
	 */
	removePlaytimeObserver() {
		this.mainWindow.webContents.executeJavaScript(`
      observer.disconnect();
    `)
	}

}

new GoogleSuit()
