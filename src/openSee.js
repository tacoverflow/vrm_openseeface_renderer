const dgram = require('dgram');

const packetFrameSize = 8 + 4 + 2 * 4 + 2 * 4 + 1 + 4 + 3 * 4 + 3 * 4 + 4 * 4 + 4 * 68 + 4 * 2 * 68 + 4 * 3 * 70 + 4 * 14;
const listenAddress = "127.0.0.1";
const listenPort = 11573;
let openSeeDataMap = [];
let receivedPackets = 0;
let openSeeDataMap; 
let socket;
let stopReception = false;

function performReception(buffer){
  while (!) {
    receivedBytes = Buffer.byteLength(buffer);
    if (receivedBytes < 1 || receivedBytes % packetFrameSize !== 0) {
      continue;
    }
		int i = 0;
    for (let offset = 0; offset < receivedBytes; offset += packetFrameSize) {
        OpenSeeData newData = new OpenSeeData();
        newData.readFromPacket(buffer, offset);
        openSeeDataMap[newData.id] = newData;
        i++;
    }
    trackingData = new OpenSeeData[openSeeDataMap.Count];
    openSeeDataMap.Values.CopyTo(trackingData, 0);
    
  }
}

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
