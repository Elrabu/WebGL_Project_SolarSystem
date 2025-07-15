async function main() {
	await initialize();
	requestAnimationFrame(render);
}

// this data is set in initialize() and used in render()
let gl;
let program;
let vao;
let uniformModelMatrixLocation;
let uniformViewMatrixLocation;
let uniformProjectionMatrixLocation;


let cameraRotation = { x: 0, y: 0 };
let isMouseDown = false;
let cameraZoom = 2.0; //standart camera zoom


function setupCameraRotation() {
	const canvas = document.querySelector("canvas");
	// set isMouseDown to true if mouse button 0 is pressed while the cursor is on the canvas
	canvas.onmousedown = function(event) { if(event.button === 0) {isMouseDown = true} };
	// set isMosueDown to false if mouse button 0 is released (no matter where the cursor is)
	document.onmouseup = function(event) { if(event.button === 0) {isMouseDown = false} };
	// update the camera rotation when the mouse is moved
	document.onmousemove = function(event) {
		if (isMouseDown) {
			cameraRotation.x += event.movementY * 0.2;
			cameraRotation.y += event.movementX * 0.2;
		}
	};
}

function setupCameraZoom() { // function to control zoom
	const canvas = document.querySelector("canvas");
	canvas.addEventListener("wheel", (event) => {
		event.preventDefault();

		const zoomSpeed = 0.1;
		cameraZoom += event.deltaY * zoomSpeed * 0.01;

		// Clamp zoom to avoid flipping or going through the mesh
		cameraZoom = clamp(cameraZoom, 0.2, 10.0);
	});
}

function clamp(value, min, max) { //set lowest and highest possible value
	return Math.max(min, Math.min(value, max));
}

async function initialize() {

	setupCameraRotation();
	setupCameraZoom();

	const canvas = document.querySelector("canvas"); // get the html canvas element
	// everytime we talk to WebGL we use this object
	gl = canvas.getContext("webgl2", { alpha: false });

	if (!gl) { console.error("Your browser does not support WebGL2"); }
	// set the resolution of the html canvas element
	canvas.width = 500; canvas.height = 350;

	// set the resolution of the framebuffer
	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.enable(gl.DEPTH_TEST); // enable z-buffering

	// loadTextResource returns a string that contains the content of a text file
	const vertexShaderText = await loadTextResource("shader.vert");
	const fragmentShaderText = await loadTextResource("shader.frag");
	// compile GLSL shaders - turn shader code into machine code that the GPU understands
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

	// link the two shaders - create a program that uses both shaders
	program = createProgram(gl, vertexShader, fragmentShader);
	const textureLocation = gl.getUniformLocation(program, "u_texture");
	gl.useProgram(program);
	gl.uniform1i(textureLocation, 0); // use texture unit 0

	uploadAttributeData(sphereMesh); //input mesh to upload

	uniformModelMatrixLocation = gl.getUniformLocation(program, "u_modelMatrix");
	uniformViewMatrixLocation = gl.getUniformLocation(program, "u_viewMatrix");
	uniformProjectionMatrixLocation = gl.getUniformLocation(program, "u_projectionMatrix");

	//create texture for the sun
	texture = gl.createTexture();
	const image = new Image();
	image.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	image.src = "textures/sun.jpg";

	//create earth texture:
	texture2 = gl.createTexture();
	const image2 = new Image();
	image2.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	image2.src = "textures/earth.jpg";

	//create moon texture:
	texture3 = gl.createTexture();
	const image3 = new Image();
	image3.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture3);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	image3.src = "textures/moon.jpg";
}

function uploadAttributeData(mesh) {
	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	const indexBuffer = gl.createBuffer();
	// gl.ELEMENT_ARRAY_BUFFER tells WebGL that this buffer should be treated as an index list
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);

	const posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.positions), gl.STATIC_DRAW);
	const posAttributeLocation = gl.getAttribLocation(program, "a_position");
	gl.vertexAttribPointer(posAttributeLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(posAttributeLocation);

	//upload UV Data
	const uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.uvs), gl.STATIC_DRAW);
	const uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
	gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(uvAttributeLocation);

	//update normals:
	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
	const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
	gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(normalAttributeLocation);

	// unbind to avoid accidental modification
	gl.bindVertexArray(null); // before other unbinds
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function render(time) {
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//set up light from Sun
	const lightPosition = [0.0, 0.0, 0.0]; // Sun at origin
	const lightPosLocation = gl.getUniformLocation(program, "u_lightPos");
	gl.uniform3fv(lightPosLocation, lightPosition);
	const isSunLocation = gl.getUniformLocation(program, "u_isSun");

	gl.useProgram(program);
	gl.bindVertexArray(vao);

	// Shared view/projection matrices
	const viewMatrix = getViewMatrix();
	const projectionMatrix = getProjectionMatrix();

	gl.uniformMatrix4fv(uniformViewMatrixLocation, true, viewMatrix);
	gl.uniformMatrix4fv(uniformProjectionMatrixLocation, true, projectionMatrix);

	const numVertices = sphereMesh.indices.length; //change cubeMesh to change mesh

	//get the slider value
	let speed = document.querySelector("#slider").value; 
	//set time
	const t = time * 0.0001 * speed; //0.0001 realistic

	// First sphere (centered)
	const sunSpin = mat4RotY(t * 0.5); // same spin rate/direction as Earth
	const modelMatrix1 = mat4Mul(sunSpin, mat4Translation(0, 0, 0));
	//const modelMatrix1 = mat4Translation(0, 0, 0);
	gl.uniformMatrix4fv(uniformModelMatrixLocation, true, modelMatrix1);

	//bind the texture for the first sphere
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.activeTexture(gl.TEXTURE0);           // Use texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);  // Bind the texture

	//sun glows on its own:
	gl.uniform1i(isSunLocation, 1); 

	//draw the first sphere:
	gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);

	//second sphere (earth)
	const radius = 5.0;
	const orbitX = Math.cos(-t) * radius;
	const orbitZ = Math.sin(-t) * radius;

	//apply texture2:
	gl.bindTexture(gl.TEXTURE_2D, texture2); // second texture

	const spin = mat4RotY(t * 2.0); // spin speed (adjust as needed) (days per orbit, realisitc: 365)
	//scale the object:
	const scaleMatrix = mat4Scale(0.5, 0.5, 0.5); // scale to half size
	//calculate orbit path:
	const orbitTranslation = mat4Translation(orbitX, 0, orbitZ);
	//applied in order: orbit path + spin + scale
	const modelMatrix2 = mat4Mul(orbitTranslation, mat4Mul(spin, scaleMatrix));

	gl.uniformMatrix4fv(uniformModelMatrixLocation, true, modelMatrix2);

	//earth doesnt glow on its own:
	gl.uniform1i(isSunLocation, 0); 
	//draw second sphere:
	gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);

	//third sphere (moon)
	const moonscale = mat4Scale(0.1, 0.1, 0.1);
	const moonOrbitRadius = 1.0;
	const moonOrbitSpeed = t * 5.0; //orbit speed
	const moonX = Math.cos(-moonOrbitSpeed) * moonOrbitRadius;
	const moonZ = Math.sin(-moonOrbitSpeed) * moonOrbitRadius;

	// Moon's orbit around Earth
	const moonOrbitTranslation = mat4Translation(moonX, 0, moonZ);

	// Moon's self-rotation
	const moonSpin = mat4RotY(moonOrbitSpeed); // tidal locking: same speed as orbit

	// Moon model matrix: Earth orbit + Moon orbit + spin + scale
	const moonModelMatrix = mat4Mul(orbitTranslation,mat4Mul(moonOrbitTranslation,mat4Mul(moonSpin,moonscale))); //Earth's position + Moon's position around Earth + Moon rotation

	gl.uniformMatrix4fv(uniformModelMatrixLocation, true, moonModelMatrix)

	gl.bindTexture(gl.TEXTURE_2D, texture3);

	//moon also doesnt glow on its own:
	gl.uniform1i(isSunLocation, 0); 
	//draw moon:
	gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);

	gl.bindVertexArray(null);
	gl.useProgram(null);

	requestAnimationFrame(render);
	
}

//helper function for rendering
function getViewMatrix() {
	const vT = mat4Translation(0, 0, -5 * cameraZoom);
	const vRy = mat4RotY(cameraRotation.y * Math.PI / 180);
	const vRx = mat4RotX(cameraRotation.x * Math.PI / 180);
	return mat4Mul(vT, mat4Mul(vRx, vRy));
}

function getProjectionMatrix() {
	const canvas = document.querySelector("canvas");
	const aspectRatio = canvas.width / canvas.height;
	return perspective(45, aspectRatio, 0.1, 100);
}

function setMatrices() {
	// use row-major notation (like in maths)
	const modelMatrix = [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1,
	];

	const vT = mat4Translation(0,0,-5 * cameraZoom); // implement Camera Zoom into the Translation
	const vRy = mat4RotY(cameraRotation.y * Math.PI / 180);
	const vRx = mat4RotX(cameraRotation.x * Math.PI / 180);
	const viewMatrix = mat4Mul(vT, mat4Mul(vRx, vRy));

	const canvas = document.querySelector("canvas");
	const aspectRatio = canvas.width / canvas.height;
	const projectionMatrix = perspective(45, aspectRatio, 0.1, 100);

	// we set transpose to true to convert to column-major
	gl.uniformMatrix4fv(uniformModelMatrixLocation, true, modelMatrix);
	gl.uniformMatrix4fv(uniformViewMatrixLocation, true, viewMatrix);
	gl.uniformMatrix4fv(uniformProjectionMatrixLocation, true, projectionMatrix);
}

main();
