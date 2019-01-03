const fs = require("fs");
const storage = require("electron-json-storage");
const remote = require("electron").remote;
const w = remote.getCurrentWindow();
const { dialog, shell } = remote;
const components = {
	title: document.getElementById("title"),
	altmenu: document.getElementById("altmenu"),

	sidebarContainer: document.getElementById("sidebar"),
	sidebarHandle: document.getElementById("sidebar-handle"),
	sidebar: document.getElementById("sidebar-content"),

	fileView: document.getElementById("file-view"),
	panel: document.getElementById("panel"),

	contextContainer: document.getElementById("context"),
	dialogContainer: document.getElementById("dialog"),

	minimizeApp: document.getElementById("action-minimize"),
	maximizeApp: document.getElementById("action-maximize"),
	closeApp: document.getElementById("action-close")
}

const dialogs = {
	// placeholders
	about() { return document.createElement("div") },
	settings() { return document.createElement("div") },
	extensions() { return document.createElement("div") }
}

const menus = {
	"File": {
		"New File": undefined,		// new file
		"New": undefined,			// list of new items
		"divider0": "-",			//
		"Save": undefined,			// save (but autosave tho)
		"Save As": undefined,		// save as a different file
		"divider1": "-",			//
		"Open File": undefined,		// open a file
		"Open Project": undefined,	// open a folder
		"Open Recent": undefined,	// open a recent file or project
		"divider2": "-",			//
		"Import": undefined			// copy file from another project
	},
	"Edit": {
		"Cut": undefined,	// cut to clipboard
		"Copy": undefined,	// copy to clipboard
		"Paste": undefined	// paste from clipboard
	},
	"View": {
		"Side Bar": undefined,		// toggle sidebar
		"Status Bar": undefined,	// toggle status bar
		"divider0": "-",			//
		"Editor": undefined			// toggle main editor (why did I think)
	},
	"Tools": {
		"Refresh": () => window.location.reload(),				// refresh window
		"divider0": "-",										//
		"Extensions": () => showDialog(dialogs.extensions())	// open extensions dialog
	},
	"Help": {
		"About": () => showDialog(dialogs.about())	// about application
	}
}

let settings; // this should be const but callbacks are a fucking gay in the ass

let currentDir = "C:"
let sidebarResizing = false;

getSettings().then((_settings) => {
	settings = _settings;

	{ // set variables
		let style = "";

		Object.keys(settings.colors).forEach((v) => {
			style += `--${v}: ${settings.colors[v]};`
		});

		let s = document.createElement("style");
		s.innerText = `:root {${style}}`;
		document.head.appendChild(s);
	}

	{ // create event handlers
		{ // set context menu actions
			document.addEventListener("mouseup",  () => components.contextContainer.classList.add("hidden"));
		}
	
		{ // keyboard shortcuts
			document.addEventListener("keyup", (e) => {
				// context menus
				if (!components.contextContainer.classList.contains("hidden")) {
					switch (e.key.toLowerCase()) {
						case "escape": {
							hideContext();
						} break;
	
						case "arrowup": {
							console.log("context menu up");
						} break;
	
						case "arrowdown": {
							console.log("context menu down");
						} break;
					}
				return }
				
				// dialogs
				if (!components.dialogContainer.classList.contains("hidden")) {
					switch (e.key.toLowerCase()) {
						case "escape": {
							hideDialog();
						} break;
					}
				return }
			});
		}
	
		{ // sidebar
			let handle = components.sidebarHandle;
	
			handle.addEventListener("mousedown", () => sidebarResizing = true);
	
			document.addEventListener("mousemove", (e) => {
				if (sidebarResizing) components.sidebarContainer.style.width = e.clientX + "px";
			});
	
			document.addEventListener("mouseup", () => sidebarResizing = false);
		}
	
		{ // action buttons
			components.minimizeApp.onclick = () => w.minimize();
			components.maximizeApp.onclick = () => toggleMaximize();
			components.closeApp.onclick = () => window.close();
		}
	}

	updateWorkspace();
});

function updateWorkspace() {
	generateMenu(menus);
	setTitle("Despacito");
}

function showDialog(dialog) {
	if (dialog != "") {
		if (typeof dialog == "string") {
			components.dialogContainer.innerHTML = dialog
		} else {
			components.dialogContainer.innerHTML = "";
			components.dialogContainer.appendChild(dialog);
		}
	}
	components.dialogContainer.classList.remove("hidden");
}

function hideDialog() {
	components.dialogContainer.classList.add("hidden");
}

function spawnContext(menu, x, y) {
	components.contextContainer.innerHTML = "";

	Object.keys(menu).forEach((item) => {
		let button = document.createElement("div");
		
		if (menu[item] == "-") {
			button.classList.add("divider");
		} else {
			button.classList.add("context-item");
			button.innerText = item;
			button.onmouseup = typeof menu[item] == "object" ? undefined /* open child submenu */ : menu[item];
		}

		components.contextContainer.appendChild(button);
	});

	components.contextContainer.style.left = `${x}px`;
	components.contextContainer.style.top = `${y}px`;

	components.contextContainer.classList.remove("hidden");
}

function hideContext() {
	components.contextContainer.classList.add("hidden");
}

function generateMenu(menu) {
	components.altmenu.innerHTML = "";

	Object.keys(menu).forEach((item) => {
		let button = document.createElement("div"); components.altmenu.appendChild(button);
		button.classList.add("menu-item", "button-small");
		button.innerText = item;
		button.addEventListener("click", (e) => spawnContext(menu[item], button.offsetLeft, button.offsetTop + button.clientHeight));
	});
}

function setTitle(title) {
	document.title = `${title} - Customa Explorer}`;
	components.title.innerText = `${title} - Customa Explorer`;
}

function toggleMaximize() {
	if (w.isMaximized()) {
		components.maximizeApp.classList.add("button-maximize");
		components.maximizeApp.classList.remove("button-maximized");
		w.unmaximize();
	} else {
		components.maximizeApp.classList.add("button-maximized");
		components.maximizeApp.classList.remove("button-maximize");
		w.maximize();
	}
}

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
	
		storage.get("settings", defaults, (e, data) => {
			if (e) error(e);

			resolve(data);
		});
	});
}
