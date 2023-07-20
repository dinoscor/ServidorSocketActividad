import cors from 'cors';
import express, { Express } from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import { IMensaje } from './interfaces/mensaje.interface';

dotenv.config();

// Instanciamos express
const app: Express = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
// Creamos servidor socket en tiempo real
// Debemos crear un servidor http
const httpServer = http.createServer(app);
// Y luego crear un servidor de sockets basado en el servidor http anterior
const io = new Server(httpServer);

// io va a ser el canal sobre el que va a circular la información en tiempo real
// En síntesis, io va a recibir información de los clientes que se conecten y
// también va a enviarles información
// Lo primero que debemos hacer es aceptar conexiones de los clientes que se conecten
// La manera de hacerlo es utilizar el canal io para implementar el evento on 'connection'
// Ese evento se va a disparar cuando un cliente se conecte al servidor vía socket
// El parámetro socket contendrá información sobre el cliente que se conecte. Viene a ser
// como la request en las peticiones http bajo REST. Socket es tipo TypeScript bajo el cual se da estructura
// a la información que viene. En REST tenemos req:Request. En sockets tenemos socket:Socket
io.on('connection', (socket: Socket) => {
  // Cuando un cliente se conecta al servidor, esa conexión se identifica mediante un id. Así
  // io tiene control sobre todas las conexiones
  console.log(`Cliente conectado. Id sesión: ${socket.id}`);

  // Vamos a suponer que cuando recibimos una conexión nueva queremos que el cliente que se conecte
  // reciba una confirmación de que se ha conectado correctamente. En este caso, vamos a construir un mensaje
  // basado en la interface y se lo vamos a emitir
  const mensajeRespuesta: IMensaje = {
    nombre: 'Servidor',
    msg: 'Bienvenido a mi servidor en tiempo real',
    fecha: new Date()
  };
  // emit va a emitir al cliente conectado una señal o evento que deberá recibir para actuar y, por ejemplo,
  // sacar el mensaje en el html. El evento tiene un nombre que decidimos nostros. En este caso, lo llamamos
  // mensaje-bienvenida y llevará consigo la información
  socket.emit('mensaje-bienvenida', mensajeRespuesta);

  const mensajeRespuestaNuevoUsuario: IMensaje = {
    nombre: 'Servidor',
    msg: 'Nuevo usuario conectado',
    fecha: new Date()
  };
  // broadcast.to permite enviar a todos excepto al que se ha conectado un evento 'usuario-conectado' (puede ser
  // cualquier nombre). El array vacío es porque dentro del array podemos enviarlo a las salas queramos. El array
  // vacío la envía a todas. El tema de las salas no lo vamos.
  // Ahora cada cliente que se conecte podrá saber cuándo se conecta un nuevo usuario. Para eso deberá escuchar el evento
  // 'usuario-conectado
  socket.broadcast.to([]).emit('usuario-conectado', mensajeRespuestaNuevoUsuario);

  socket.on('mensaje-to-server', (data: IMensaje) => {
    console.log(data);
    // io-->emite a todos
    // socket-->emite al cliente que ha producido el evento mensaje-to-server
    io.emit('mensaje-from-server', data);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log('Servidor en ejecución en puerto ' + process.env.PORT);
});