import dotenv from "dotenv";
import app from "./src/app.js";
import { connectToDb } from "./src/config/database.js";
// import { testAi } from "./src/services/ai.service.js";
import http from "http"
import { initSocket } from "./src/sockets/server.socket.js";
dotenv.config();


const httpServer = http.createServer(app)
initSocket(httpServer)

connectToDb();
// testAi()
httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});