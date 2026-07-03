const { app, BrowserWindow } = require("electron")
const { spawn } = require("child_process")
const path = require("path")

const ROLE = process.env.ROLE || "dev"
const PORT = 4173
const isDev = !app.isPackaged

let mainWindow
let server

function startServer() {
  return new Promise((resolve, reject) => {
    const cmd = isDev ? "npx" : "node"
    const args = isDev
      ? ["next", "dev", "-p", String(PORT)]
      : [path.join(process.resourcesPath, "next", "start.js"), "-p", String(PORT)]

    server = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ROLE },
    })

    const onData = (data) => {
      const text = data.toString()
      if (text.includes("Local:") || text.includes("ready") || text.includes("started")) {
        resolve()
      }
    }

    server.stdout.on("data", onData)
    server.stderr.on("data", onData)
    server.on("error", reject)
    setTimeout(() => reject(new Error("Timeout starting server")), 45000)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: `EduConecta — ${ROLE}`,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  mainWindow.loadURL(`http://localhost:${PORT}/login`)
  mainWindow.on("closed", () => { mainWindow = null })
}

app.whenReady().then(async () => {
  try {
    await startServer()
    createWindow()
  } catch (err) {
    console.error("Error:", err)
    app.quit()
  }
})

app.on("window-all-closed", () => {
  if (server) server.kill()
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (mainWindow === null) createWindow()
})

app.on("before-quit", () => {
  if (server) server.kill()
})
