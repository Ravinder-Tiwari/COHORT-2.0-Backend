import app from "./src/app.js"
import { worker } from './src/workers/worker.js';


worker()
app.listen(3000,()=>{
    console.log("server is running on port 3000")
})