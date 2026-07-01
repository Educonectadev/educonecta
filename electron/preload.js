const { contextBridge } = require("electron")

contextBridge.exposeInMainWorld("electronRole", process.env.ROLE)
