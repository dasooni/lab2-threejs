/*
Dasmit Sethi, VT22
*/

var container;
var camera, scene, renderer;
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Object3D ("Group") nodes and Mesh nodes
var sceneRoot = new THREE.Group();
var viewRoot = new THREE.Group();

var sunSpin = new THREE.Group();

var earthOrbit = new THREE.Group();
var earthSpin = new THREE.Group();
var earthTrans = new THREE.Group();

var moonOrbit = new THREE.Group();
var moonSpin = new THREE.Group();
var moonTrans = new THREE.Group();

var saturnOrbit = new THREE.Group();
var saturnSpin = new THREE.Group();
var saturnTrans = new THREE.Group();

var earthMesh, moonMesh, sunMesh, saturnMesh;
const light = new THREE.PointLight(0xff0000, 1, 100 );
const amLight = new THREE.AmbientLight( 0x202020 );

var animation = true;

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    // mouseX, mouseY are in the range [-1, 1]
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function createSceneGraph() {
    scene = new THREE.Scene();

    // Top-level node
    scene.add(sceneRoot);

    //LIGHTS
    scene.add(light);
    scene.add(amLight);

    //main node
    sceneRoot.add(viewRoot);

    //first branch from main node: sunspin object, and mesh
    viewRoot.add(sunSpin);
    sunSpin.add(sunMesh);

    //second branch from main node: earth orbit, spin and translation objects and finally mesh
    viewRoot.add(earthOrbit);
    earthOrbit.add(earthTrans);
    earthTrans.add(earthSpin);
    earthSpin.add(earthMesh);

    //first branch from earth-translation node: moon orbit, translation, spin and finally mesh
    earthTrans.add(moonOrbit); 
    moonOrbit.add(moonTrans);
    moonTrans.add(moonSpin);
    moonSpin.add(moonMesh);

    //third branch from main node: saturn orbit, spin and translation then mesh
    viewRoot.add(saturnOrbit);
    saturnOrbit.add(saturnTrans);
    saturnTrans.add(saturnSpin);
    saturnSpin.add(saturnMesh);


}

function init() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    
    var texloader = new THREE.TextureLoader();

    //Geometry & material
    var geometryEarth = new THREE.SphereGeometry(1,32, 16, 0);
    //var materialEarth = new THREE.MeshLambertMaterial();
    var materialEarth = new THREE.MeshPhongMaterial();

    materialEarth.combine = 0;
    materialEarth.needsUpdate = true;
    materialEarth.wireframe = false;   

    var geometryMoon = new THREE.SphereGeometry(1, 32, 16, 0);
    var materialMoon = new THREE.MeshBasicMaterial();

    var geometrySun = new THREE.SphereGeometry(1,32,16,0);
    var materialSun = new THREE.MeshBasicMaterial();

    var geometrySaturn = new THREE.SphereGeometry(1,32,16,0);
    var materialSaturn = new THREE.MeshBasicMaterial();
    //

    //TEXTURES
	const earthTexture = texloader.load('tex/2k_earth_daymap.jpg');
    materialEarth.map = earthTexture;

    const moonTexture = texloader.load('tex/2k_moon.jpg');
    materialMoon.map = moonTexture;

    const sunTexture = texloader.load('tex/2k_sun.jpg');
    materialSun.map = sunTexture;

    const saturnTexture = texloader.load('tex/2k_saturn.jpg');
    materialSaturn.map = saturnTexture;
    //
    
    // Task 8: material using custom Vertex Shader and Fragment Shader
    
	var uniforms = THREE.UniformsUtils.merge( [
	    { 
	    	colorTexture : { value : new THREE.Texture() },
	    	specularMap : { value : new THREE.Texture() }
    	},
	    THREE.UniformsLib[ "lights" ]
	] );

	const shaderMaterial = new THREE.ShaderMaterial({
		uniforms : uniforms,
		vertexShader : document.getElementById('vertexShader').textContent.trim(),
		fragmentShader : document.getElementById('fragmentShader').textContent.trim(),
		lights : true
	});
	shaderMaterial.uniforms.colorTexture.value = earthTexture;
	
	const specularMap = texloader.load('tex/2k_earth_specular_map.jpg');
	shaderMaterial.uniforms.specularMap.value = specularMap;
	
    //

    // MESH
    earthMesh = new THREE.Mesh(geometryEarth, shaderMaterial);
    earthMesh.scale.set(0.8,0.8,0.8);

    moonMesh = new THREE.Mesh(geometryMoon, materialMoon);
    moonMesh.rotation.z = 5.15 * Math.PI / 180;
    moonMesh.scale.set(0.2, 0.2, 0.2);

    sunMesh = new THREE.Mesh(geometrySun, materialSun);

    saturnMesh = new THREE.Mesh(geometrySaturn, materialSaturn);
    //

    //LIGHTS
    light.position.set(0,0,0);
    light.castShadow = true;
    //

    //Call scene graph
    createSceneGraph();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    var checkBoxAnim = document.getElementById('animation');
    animation = checkBoxAnim.checked;
    checkBoxAnim.addEventListener('change', (event) => {
    	animation = event.target.checked;
    });

	var checkBoxWireframe = document.getElementById('wireframe');
    earthMesh.material.wireframe = checkBoxWireframe.checked;
    checkBoxWireframe.addEventListener('change', (event) => {
    	earthMesh.material.wireframe = event.target.checked;
    });
}

earthSpin.rotation.x = 23.44 * Math.PI / 180;

function render() {
    // Set up the camera
    camera.position.x = mouseX * 10;
    camera.position.y = -mouseY * 10;
    camera.lookAt(scene.position);

    // Perform animations
    if (animation) {

        sunSpin.rotation.y += 0.1/25; //sun spin on its own axis
        earthOrbit.rotation.y += 0.1 / 365; //earth orbits the sun 

        earthSpin.rotation.y += 0.1 ; //earth spin its own axis

        moonOrbit.rotation.y += 0.1 / 27.3; //moon orbits the earth
        //moonSpin.rotation.y += 0.1 / 27.3; //moon spins its own axis

        saturnOrbit.rotation.y += 0.1 / (365 * 29.5);
        saturnSpin.rotation.y += 0.1 / 35;

        earthTrans.position.x = 7; //move earth position
        moonTrans.position.x = 3; //move moon position
        saturnTrans.position.x = 15; //move saturn position
        
    }

    // Render the scene
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate); // Request to be called again for next frame
    render();
}

init(); // Set up the scene
animate(); // Enter an infinite loop
