import {extraNumFromString} from "./util"

import NotificationController from './controller/notificationController'
import Config from './config'
import {app, BrowserWindow, Menu, ipcMain, shell} from 'electron';
import path from 'path'
import fs from 'fs'

let currentMailNum = 0

class GoogleSuit {

	constructor(notificationController) {
		this.mainWindow = null
		this.notificationController = notificationController
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

		this.mainWindow = new BrowserWindow(Config.get('mainWindow'));

		this.notificationController.window = this.mainWindow

		const debug = true
		if (debug) {
			this.openDevTool()
		}

		// and load the index.html of the app.
		// mainWindow.loadURL(`file://${__dirname}/index.html`);
		this.mainWindow.loadURL(Config.get('defaultPage').url);
		this.mainWindow.currentName = Config.get('defaultPage').name

		this.getIconsFromRender()
		this.ipcSubscriber()

		// gracefully show
		this.mainWindow.once('ready-to-show', () => {
			this.mainWindow.show()
		})

		this.mainWindow.on('closed', () => {
			// this.removeObserver()
			this.mainWindow = null;
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

		this.addMailObserver()

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
			let newMailNum = extraNumFromString(msg)
			if (newMailNum > currentMailNum) {
				console.log('send notification ', newMailNum);
				this.notificationController.notify(
					'resource/icon/48-mail-message-icon.png',
					'Msg',
					'Body'
				)
			}
			currentMailNum = newMailNum
		});

	}

	loadMenus(icons) {
		const commonJS = (id, name) => {
			const indexColon = id.indexOf(':')
			const escapId = id.slice(0, indexColon) + '\\\\' + id.slice(indexColon)

			return `
				const ${name} = document.querySelector("#${escapId} a").getAttribute("href")
				ipc.send('reload_url',${name})
    	`
			//TODO bug here!!!
			// return `
			// const ${name} = document.querySelector("#${escapId} a").getAttribute("href")
			// if (${name} !== undefined) {
			// 	ipc.send('reload_url',${name})
			// }else{
			// 	ipc.send('reload_url',${defaultPage.url})
			// }
			// `
		};
		const submenu = icons.map(ic => {
			const key = Object.keys(ic)[0]
			return {
				label: ic[key],
				click: () => {
					const jsString = commonJS(key, ic[key])
					// console.log(jsString)
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
		const getIconsJS = fs.readFileSync(path.join(__dirname, 'renderjs/getIcons.js'), "utf8");
		this.mainWindow.webContents.executeJavaScript(getIconsJS);
	}

	addMailObserver() {
		const obserJS = fs.readFileSync(path.join(__dirname, 'renderjs/observer.js'), "utf8");
		// console.log(obserJS)
		this.mainWindow.webContents.executeJavaScript(obserJS)
	}

	/**
	 * Remove the listener to monitor the play time.
	 */
	removeObserver() {
		this.mainWindow.webContents.executeJavaScript(`
      observer.disconnect();
    `)
	}
}

new GoogleSuit(new NotificationController())
