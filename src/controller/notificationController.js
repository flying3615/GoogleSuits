const {nativeImage, Notification} = require('electron');
const notifier = require('node-notifier');
const path = require('path');
class NotificationController {

	constructor(window) {
		this.notifier = notifier;
		this.window = window
		this.int()
	}

	int() {
		this.notifier.on('click', (notifierObject, options) => {
			console.log('click msg')
			this.window.show()
		})
	}

	notify(iconUrl, title, message) {

		this.notifier.notify({
				icon: path.join(__dirname, iconUrl),
				wait: true,
				title,
				message,
			})
	}
}


module.exports = NotificationController