import { app, BrowserWindow } from "electron"

app.whenReady().then(createWindow)
app.on("window-all-closed", () =>
{
    if (process.platform !== "darwin") app.quit()
})

function createWindow()
{
    let win = new BrowserWindow({
        width: 1280, height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile("../src/index.html")
}
