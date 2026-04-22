import { Server } from 'socket.io';


let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials:true
        }
    })
    console.log("Socketio server is running")
    io.on('connection',(socket)=>{
        console.log("A user connected: ", socket.id)
    })
}
export function fetIO(){
    if(!io){
        throw new Error('Socket.io is not initialized')
    }
    return io
}