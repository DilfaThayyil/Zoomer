import express, { Application } from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'

interface Rooms{
    [roomId:string] : string[]
}

const app : Application = express()
const server = http.createServer(app)
const io = new Server(server)

const rooms : Rooms = {}

io.on("connection", socket => {
    socket.on("join room", roomID => {
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });
    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    }); 

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    })
})

server.listen(3000,()=>{
    console.log(`server is listening on port 8000`)
})