const THREE = require('three');

const nPoints = 68;

function readFloat(data) {
	let { buffer=[], offset=0} = data;
	let view = new DataView(new ArrayBuffer(4));
	for(let i=0; i < 4; i++){
		view.setUint8(i, buffer[offset + i]);
	}
  let value = view.getFloat32(0);
  data.offset += 4;
  return value;
}

function readDouble(data) {
	let { buffer=[], offset=0} = data;
	let view = new DataView(new ArrayBuffer(8));
	for(let i=0; i < 8; i++){
		view.setUint8(i, buffer[offset + i]);
	}
  let value = view.getFloat64(0);
  data.offset += 8;
  return value;
}

function readInt(data) {
	let { buffer=[], offset=0} = data;
	let view = new DataView(new ArrayBuffer(4));
	for(let i=0; i < 4; i++){
		view.setUint8(i, buffer[offset + i]);
	}
  let value = view.getInt32(0);
  data.offset += 4;
  return value;
}

function readQuaternion(data) {
	let x = readFloat(data);
  let y = readFloat(data);
  let z = readFloat(data);
  let w = readFloat(data);
  let q = new Quaternion({x, y, z, w});
  return q;
}

function readVector3(data) {
	let x = readFloat(data);
  let y = readFloat(data)*-1.0;
  let z = readFloat(data);
  let v = new Vector3({x, y, z});
  return v;
}

function readVector2(data) {
	let x = readFloat(data);
  let y = readFloat(data);
  let v = new Vector2({x, y});
  return v;
}

function swapX(v=new Vector3()) {
  v.x = -v.x;
  return v;
}

class Quaternion extends THREE.Quaternion {
	constructor(data={}) {
		let {x=0.0, y=0.0, z=0.0, w=0.0} = data;
		super(x, y, z, w);
	}
}

class Vector2 extends THREE.Vector2 {
	constructor(data={}) {
		let {x=0.0, y=0.0} = data;
		super(x, y);
	}
}

class Vector3 extends THREE.Vector3 {
	constructor(data={}) {
		let {x=0.0, y=0.0, z=0.0} = data;
		super(x, y, z);
	}
	static right = new Vector3({x:1.0, y:0.0, z:0.0});
	static left = new Vector3({x:-1.0, y:0.0, z:0.0});
	static forward = new Vector3({x:0.0, y:0.0, z:1.0});
	static backward = new Vector3({x:0.0, y:0.0, z:-1.0});
}

class OpenSeeFeatures {
	constructor(){
  	this.EyeLeft = 0.0;
  	this.EyeRight = 0.0;
  	this.EyebrowSteepnessLeft = 0.0;
  	this.EyebrowUpDownLeft = 0.0;
  	this.EyebrowQuirkLeft = 0.0;
  	this.EyebrowSteepnessRight = 0.0;
  	this.EyebrowUpDownRight = 0.0;
  	this.EyebrowQuirkRight = 0.0;
  	this.MouthCornerUpDownLeft = 0.0;
  	this.MouthCornerInOutLeft = 0.0;
  	this.MouthCornerUpDownRight = 0.0;
  	this.MouthCornerInOutRight = 0.0;
  	this.MouthOpen = 0.0;
  	this.MouthWide = 0.0;
	}
}

class OpenSeeData {
	constructor(){
		this.time = 0.0;
  	this.id = 0;
  	this.cameraResolution = new Vector2();
  	this.rightEyeOpen = 0.0;
  	this.leftEyeOpen = 0.0;
  	this.rightGaze = new Quaternion();
  	this.leftGaze = new Quaternion();
  	this.got3DPoints = false;
  	this.fit3DError = 0.0;
  	this.rotation = new Vector3();
  	this.translation = new Vector3();
  	this.rawQuaternion = new Quaternion();
  	this.rawEuler = new Vector3();
  	this.confidence = new Array(nPoints);
  	this.points = new Array(nPoints);
  	this.points3D = new Array(nPoints + 2);
  	this.features = new OpenSeeFeatures();
	}
  
  readFromPacket(data={buffer:[], offset:0}) {
    this.time = readDouble(data);
    this.id = readInt(data);
    this.cameraResolution = readVector2(data);
    this.rightEyeOpen = readFloat(data);
    this.leftEyeOpen = readFloat(data);
    
		let got3D = data.buffer[data.offset];
    data.offset++;
    if (got3D != 0)
        this.got3DPoints = true;
    
		this.fit3DError = readFloat(data);
    
		this.rawQuaternion = readQuaternion(data);
    let convertedQuaternion = new Quaternion({
			x: -this.rawQuaternion.x,
			y:  this.rawQuaternion.y,
			z: -this.rawQuaternion.z,
			w:  this.rawQuaternion.w
		});
    
		this.rawEuler = readVector3(data);

    this.rotation = this.rawEuler * 1;
    this.rotation.z = (this.rotation.z - 90) % 360;
    this.rotation.x = -(this.rotation.x + 180) % 360;

    let x = readFloat(data);
    let y = readFloat(data);
    let z = readFloat(data);
    this.translation = new Vector3({y: -y, x: x, z: -z});

    for (let i = 0; i < nPoints; i++) {
      this.confidence[i] = readFloat(data);
    }

    for (let i = 0; i < nPoints; i++) {
      this.points[i] = readVector2(data);
    }

    for (let i = 0; i < nPoints + 2; i++) {
      this.points3D[i] = readVector3(data);
    }
    
		// rightGaze = THREE.Quaternion.LookRotation(swapX(points3D[66]) - swapX(points3D[68])) * Quaternion.AngleAxis(180, Vector3.right) * Quaternion.AngleAxis(180, Vector3.forward);
    this.rightGaze = Quaternion.setFromUnitVectors(swapX(points3D[66]), swapX(points3D[68])) * Quaternion.setFromAxisAngle(Vector3.right, 180) * Quaternion.setFromAxisAngle(Vector3.forward, 180);
    this.leftGaze = Quaternion.setFromUnitVectors(swapX(points3D[67]), swapX(points3D[69])) * Quaternion.setFromAxisAngle(Vector3.right, 180) * Quaternion.setFromAxisAngle(Vector3.forward, 180);
    
    this.features.EyeLeft = readFloat(data);
    this.features.EyeRight = readFloat(data);
    this.features.EyebrowSteepnessLeft = readFloat(data);
    this.features.EyebrowUpDownLeft = readFloat(data);
    this.features.EyebrowQuirkLeft = readFloat(data);
    this.features.EyebrowSteepnessRight = readFloat(data);
    this.features.EyebrowUpDownRight = readFloat(data);
    this.features.EyebrowQuirkRight = readFloat(data);
    this.features.MouthCornerUpDownLeft = readFloat(data);
    this.features.MouthCornerInOutLeft = readFloat(data);
    this.features.MouthCornerUpDownRight = readFloat(data);
    this.features.MouthCornerInOutRight = readFloat(data);
    this.features.MouthOpen = readFloat(data);
    this.features.MouthWide = readFloat(data);
  }
}

module.exports = { OpenSeeData, OpenSeeFeatures, Vector2, Vector3, Quaternion }
