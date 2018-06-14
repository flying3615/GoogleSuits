import {nativeImage, Notification} from 'electron';
import notifier from 'node-notifier';
import path from 'path';
import Config from '../config'

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