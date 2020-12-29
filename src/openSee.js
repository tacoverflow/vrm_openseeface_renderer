const dgram = require('dgram');

const listenAddress = "127.0.0.1";
const listenPort = 11573;
let openSeeDataMap; 
let socket;


function start(){
  //if (openSeeDataMap == null)
  //  openSeeDataMap = new Dictionary<int, OpenSeeData>();
  const buffer = new ArrayBuffer(65535);

  if (socket === undefined) {
    socket = dgram.createSocket('udp4');
    
    socket.on('listening', () => {
      console.log('socket is listening');
    });
    
    socket.on('message', (msg, rinfo) => {
      console.log(`server got: ${Buffer.byteLength(msg, 'utf8')} from ${rinfo.address}:${rinfo.port}`);
    })
    
    socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      socket.close();
    });
    
    socket.bind(listenPort, listenAddress, ()=>{ console.log('socket connected.')});
  }

  //receiveThread = new Thread(() => performReception());
  //receiveThread.Start();
}

start();
