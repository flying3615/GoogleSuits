/**
 * Holds application configuration and exports a single instance so it can be
 * read from any other module that needs to know a particular value
 */
import path from 'path'

const STORE = {
	defaultPage: {
		url: 'https://mail.google.com',
		name: 'Mail'
	},

	mainWindow: {
		show: false,
		transparent: true,
		// frame: false,
		width: 1000,
		height: 600,
		webPreferences: {
			nativeWindowOpen: true,
			javascript: true,
			preload: path.join(__dirname, '../preload.js'),
		},
	},
}

class Configuration {

	get(name, dflt) {
		return STORE[name] || dflt
	}

	set(name, value) {
		// TODO not support '...' ?
		// if (typeof value === 'object') {
		//   STORE[name] = {
		//     ...STORE[name],
		//     ...value
		//   }
		// } else {
		STORE[name] = value
		// }
	}

	getAll() {
		return STORE
	}

}

// export default new Configuration()
module.exports = new Configuration()