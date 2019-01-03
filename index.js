const { app, BrowserWindow } = require('electron');
const storage = require("electron-json-storage");
const path = require("path");
const url = require("url");

let window;

function getSettings() {
	return new Promise((resolve, error) => {
		let defaults = {
			colors: {
				ColAppBackground: "#161616",
				ColBackground1: "#161616",
				ColBackground2: "#212121",
				ColAccent: "#D81B60",
			}
		}
	
		storage.has("settings", (err, settingsSet) => {
			if (err) error(err);

			if (settingsSet) {
				storage.get("settings", defaults, (e, data) => {
					if (e) error(e);

					resolve(data);
				});
			} else {
				storage.set("settings", defaults, (e) => {
					if (e) error(e);

					resolve(defaults);
				});
			}
		});
	});
}

async function createWindow() {
	getSettings().then((settings) => {
		window = new BrowserWindow({
			icon: path.join(__dirname, 'src/img/icon.png'),
			minWidth: 800,
			minHeight: 600,
			resizable: true,
			title: "Customa Explorer",
			backgroundColor: settings.colors.ColAppBackground,
			frame: false
		});
	
		window.loadURL(url.format({
			pathname: path.join(__dirname, 'src/index.html'),
			protocol: "file:",
			slashes: true
		}));
	
		window.focus();
	
		window.on("closed", app.quit);
	}).catch((e) => {
		console.error(e);

		app.quit();
	});
}

app.on("window-all-closed", app.quit);
app.on("ready", createWindow);
