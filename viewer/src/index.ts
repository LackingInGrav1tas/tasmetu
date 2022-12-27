import { app, BrowserWindow } from "electron"

app.on("ready", () => createWindow())
app.on("window-all-closed", () =>
{
    if (process.platform !== "darwin") app.quit()
})

function createWindow()
{
    let win = new BrowserWindow({ width: 1280, height: 720 })
    win.loadFile("../src/index.html")
}
