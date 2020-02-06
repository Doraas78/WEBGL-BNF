
			import * as THREE from './three.js-master/build/three.module.js';

			import { PointerLockControls } from './three.js-master/examples/jsm/controls/PointerLockControls.js';


			import { ColladaLoader } from './three.js-master/examples/jsm/loaders/ColladaLoader.js';
			import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
			import { FBXLoader } from './three.js-master/examples/jsm/loaders/FBXLoader.js';



			import Stats from './three.js-master/examples/jsm/libs/stats.module.js';


		    //* Affichage des FPS *//

		    

			(function(fps){
				var script=document.createElement('script');
				script.onload=function(){
						var stats=new Stats();
						document.body.appendChild(stats.dom);
						requestAnimationFrame(function loop(){
							stats.update();
							requestAnimationFrame(loop)});
				};


			script.src='//mrdoob.github.io/stats.js/build/stats.min.js';
			document.head.appendChild(script);})()

			

			//* DECLARATION DES VARIABLES PRINCIPALES *//

			var camera, scene, renderer, controls, stats;

			var objects = [];

			var raycaster;

			var moveForward = false;
			var moveBackward = false;
			var moveLeft = false;
			var moveRight = false;
			var canJump = false;
			var loaderfbx;

			var prevTime = performance.now();
			var velocity = new THREE.Vector3();
			var direction = new THREE.Vector3();
	
			var clock = new THREE.Clock();

			var mixer,mixer2,mixer3;


			var scale = {
				x: 0,
				y: 0,
				z: 0,
			}

			var position = {
				x: 0,
				y: 0,
				z: 0,
			}

			var rotation = {
				x: 0,
				y: 0,
				z: 0,
			}

			


			init();
			animate();

			function init() {

				//* MISE EN PLACE DE LA SCENE *//

				scene = new THREE.Scene(); // scene
				scene.background = new THREE.Color( 0xcce0ff ); // couleur du plan
				scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 ); //définition du brouillard linéraire
				scene.add( new THREE.AmbientLight( 0x707070) ); // Lumière ambiance de la scène

				//PointLight(couleur, intensité); // Jeu de lumières sur la scène

				 //lumière émise à partir d'un endroit spécifique
				var frontLight = new THREE.PointLight(0xc4c4c4, 2);
				frontLight.position.set(0,100,-550); // Avant
				scene.add(frontLight);

				var backLight = new THREE.PointLight(0xc4c4c4,2);
				backLight.position.set(0,100,500); // Arrière
				scene.add(backLight);

		        camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 10000 ); // camera

				camera.position.x = -92;
				camera.position.y = 200;
				camera.position.z = 1300;

				camera.lookAt(300,-500,-500);

		
				//* MISE EN PLACE DU POINTER LOCK CONTROL, CONTROLEUR DE LA SCENE *//


				controls = new PointerLockControls( camera, document.body );


				var blocker = document.getElementById( 'blocker' );
				var instructions = document.getElementById( 'instructions' );

				instructions.addEventListener( 'click', function () {

					controls.lock();

				}, false );

				controls.addEventListener( 'lock', function () {

					instructions.style.display = 'none';
					blocker.style.display = 'none';

				} );

				controls.addEventListener( 'unlock', function () {

					blocker.style.display = 'block';
					instructions.style.display = '';

				} );

				//scene.add( controls.getObject() );

				var onKeyDown = function ( event ) {

					switch ( event.keyCode ) {

						case 38: // up
						case 87: // w
							moveForward = true;
							break;

						case 37: // left
						case 65: // a
							moveLeft = true;
							break;

						case 40: // down
						case 83: // s
							moveBackward = true;
							break;

						case 39: // right
						case 68: // d
							moveRight = true;
							break;

						case 32: // space
							if ( canJump === true ) velocity.y += 350;
							canJump = false;
							break;

					}

				};

				var onKeyUp = function ( event ) {

					switch ( event.keyCode ) {

						case 38: // up
						case 87: // w
							moveForward = false;
							break;

						case 37: // left
						case 65: // a
							moveLeft = false;
							break;

						case 40: // down
						case 83: // s
							moveBackward = false;
							break;

						case 39: // right
						case 68: // d
							moveRight = false;
							break;

					}

				};

				document.addEventListener( 'keydown', onKeyDown, false );
				document.addEventListener( 'keyup', onKeyUp, false );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

				//* MISE EN PLACE DE LA TEXTURE SOL TYPE ANIMAL CROSSING *//

					//chargement de la texture en tant que surface
					var loader = new THREE.TextureLoader();
					var ground = loader.load( 'textures & images/grass2.png' );

					// MeshLambertMaterial: définition de l'apparence de la texture sur la plaque
			        var groundMaterial = new THREE.MeshLambertMaterial( { map: ground } );

					//PlaneBufferGeometry: dimensions de la plaque définissant le sol
					var groundMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );


					groundMesh.position.y = - 250;
					groundMesh.rotation.x = - Math.PI / 2;
					groundMesh.receiveShadow = true;

					//Nombre de fois où sera répété la texture, verticalement et horizontalement sur la plaque
					ground.wrapS = ground.wrapT = THREE.RepeatWrapping;
					ground.repeat.set(35, 35);

					//anisotropy: nombre d'échantillons prélevés le long de l'axe à travers le pixel qui a la densité de texels la plus élevée
					ground.anisotropy = 128; // propriété d'être dépendant de la direction

					//DirectionalLight: Lumière émise dans une direction particulière -> 0xdfebff: couleur  1: intensité
					var light = new THREE.DirectionalLight( 0xdfebff, 1 );
			        light.castShadow = true;
			        light.position.set( 0, 1, 0 );
					scene.add( light );
					scene.add( groundMesh );




				//* OBJETS PAS ANIMES *//

				// Personnages 

						//chargment et ajout d'Isabelle
						var isa  = new GLTFLoader();
						isa.load('Objets3D/	Isabelle/scene.gltf', function(gltf){
							let isa = gltf.scene.children[0];
							isa.scale.set(15,15,15);
							isa.position.set(100, -250, 1000); //position de l'objet
							isa.rotation.set(300,0,0);
							scene.add(isa);
							isa.add( voice );
						});




				// Batiments

						//chargement et ajout de la boutique Nook 
						var nookStore  = new GLTFLoader();
						nookStore.load('Objets3D/BoutiqueNook2/scene.gltf', function(gltf){
							let nookStore = gltf.scene.children[0];
							nookStore.scale.set(150,150,150);
							nookStore.position.set(groundMesh.position.x, -120, -100); //position de l'objet
							nookStore.rotation.set(300,0,600);
							scene.add(nookStore);
						});

						//chargement et ajout de la boutique Nookway
						var nookWay  = new ColladaLoader();
						nookWay.load('Objets3D/Nookway/model.dae', function(collada){
							let nookWay = collada.scene.children[0];
							nookWay.scale.set(2,2,2);
							nookWay.position.set(900, groundMesh.position.y, -800); //position de l'objet
							nookWay.rotation.set(300,0,-12.6);
							scene.add(nookWay);
						});

						//chargement et ajout de la maison
						var house  = new GLTFLoader();
						house.load('Objets3D/House/scene.gltf', function(gltf){
							let house = gltf.scene.children[0];
							house.scale.set(5.5,5.5,5.5);
							house.position.set(-1000, -340, -800); //position de l'objet
							house.rotation.set(300,0,-12.6);
							scene.add(house);
						});

						 //chargement et ajout du musée
						var museum = new ColladaLoader();
						museum.load('Objets3D/museum/model.dae', function(collada){
						let museum = collada.scene.children[0];
						museum.scale.set(4,4,4);
						museum.position.set(900, groundMesh.position.y, 300); // position de l'objet
						museum.rotation.set(300,0,0);
						scene.add(museum);

						});



			//Autres

						//chargement et ajout de la voiture
						var car = new GLTFLoader();
						car.load('Objets3D/Car/scene.gltf', function(gltf){
						let car = gltf.scene.children[0];
						car.scale.set(85,85,85);
						car.position.set(groundMesh.position.x, -200, 800); // position de l'objet
						car.rotation.set(300,0,0);
						scene.add(car);

						});






			// Verdure


						//chargement et ajout du palmier

						var palm = new GLTFLoader();
						palm.load('Objets3D/Palm1/scene.gltf', function(gltf){

						let palm = gltf.scene.children[0];
						palm.scale.set(5.5,5.5,5.5);
						palm.position.set(300, groundMesh.position.y, 300); // position de l'objet
						scene.add(palm);

						});

						//chargement et ajout de l'arbre
						var tree = new GLTFLoader();
						tree.load('Objets3D/Tree1/scene.gltf', function(gltf){
							let tree = gltf.scene.children[0];
							tree.scale.set(50,50,50);
							tree.position.set(-920, groundMesh.position.y, -100); // position de l'objet
							scene.add(tree);

						});


		
				//* OBJETS ANIMES *//


				//personnage animé: papillon qui vole 1
				loaderfbx = new FBXLoader();
				loaderfbx.load( 'Objets3D/Butterfly1/source/butterfly animation.fbx', function ( object ) {

					mixer = new THREE.AnimationMixer( object );

					var action = mixer.clipAction( object.animations[ 0 ] );
					action.play();

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;

						}

					} );
					object.scale.set(10,10,10);
					object.position.set(-460, 70, 900);
					scene.add( object );
					console.log(loaderfbx);

				} );


				//personnage animé: papillon qui vole 2
				var loaderfbx = new FBXLoader();
				loaderfbx.load( 'Objets3D/Butterfly1/source/butterfly animation.fbx', function ( object ) {

					mixer3 = new THREE.AnimationMixer( object );

					var action = mixer3.clipAction( object.animations[ 0 ] );
					action.play();

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;

						}

					} );
					object.scale.set(10,10,10);
					object.position.set(-500, 100, 900);
					scene.add( object );

				} );

				//personnage animé: souris qui marche 
				var loader2fbx = new FBXLoader();
				loader2fbx.load( 'Objets3D/Female Tough Walk.fbx', function ( object) {

					mixer2 = new THREE.AnimationMixer( object );

					var action = mixer2.clipAction( object.animations[ 0 ] );
					action.play();

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;

						}

					} );
					object.scale.set(1.5,1.5,1.5);
					object.position.set(-500, groundMesh.position.y, 300);

					    if (object.position.z >= 30){
					    	object.position.z -= 1;
					    }

						
				
					scene.add( object );

				} );


				//* MUSIQUE DE FOND DE LA SCENE *//

				//  Ajout de la fonction pour ajouter un audio
				var listener = new THREE.AudioListener();
				camera.add( listener );

				// Création de la musique de la scène
				var sound = new THREE.Audio( listener );

				// Téléchargement de la musique et ajustements
				var audioLoader = new THREE.AudioLoader();
				audioLoader.load( 'sounds/song.mp3', function( buffer ) {
					sound.setBuffer( buffer );
					sound.setLoop( true );
					sound.setVolume( 3 );
					sound.play();
				});





				//* SON DE POSITION *//

				

				//  Ajout de la fonction pour ajouter un audio

				var listener = new THREE.AudioListener();
				camera.add( listener );

				// Création de la musique de la scène

				var voice = new THREE.PositionalAudio( listener );

				// Téléchargement de la musique et ajustements

				var audioLoader = new THREE.AudioLoader();
				audioLoader.load( 'sounds/voice.mp3', function( buffer ) {
					voice.setBuffer( buffer );
					voice.setRefDistance(1);
					voice.setLoop(true);
					voice.setVolume(100);
					voice.play();
				});

				




				displaygui();
				function displaygui() {
					var gui = new dat.GUI();
					var parameters = {
						//musique d'ambiance
						volume: 3,
						movSpeed: 1.5,

						
					}

					var sounds = gui.addFolder('Music scene');
					var soundVolume = sounds.add(parameters, 'volume').min(0).max(6).step(0.1).name('Volume');
					soundVolume.onChange(function(changed){
						sound.setVolume(changed);

					})

					/*//Vitesse de la caméra 	
					var speed = gui.addFolder('Mov Speed');
					var velocitySpeed = speed.add(parameters, 'movSpeed').min(0.5).max(2.5).step(0.01).name('Velocity');
					velocitySpeed.onChange(function(changed){
					// velocity: vitesse de déplacement sur les différents axes
					velocity.x -= velocity.x * changed * delta;
					velocity.z -= velocity.z * changed * delta;
					

					})*/

					
  				}



				//* RENDU DE LA SCENE *//
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
				document.body.appendChild( renderer.domElement );


				//

				window.addEventListener( 'resize', onWindowResize, false );




			}



			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				if ( controls.isLocked === true ) {

					raycaster.ray.origin.copy( controls.getObject().position );
					raycaster.ray.origin.y -= 10;

					var intersections = raycaster.intersectObjects( objects );

					var onObject = intersections.length > 0;

					var time = performance.now();
					var delta = ( time - prevTime ) / 1000;

					// velocity: vitesse de déplacement sur les différents axes
					velocity.x -= velocity.x * 1.5 * delta;
					velocity.z -= velocity.z * 1.5 * delta;

					velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

					direction.z = Number( moveForward ) - Number( moveBackward );
					direction.x = Number( moveRight ) - Number( moveLeft );
					direction.normalize(); // this ensures consistent movements in all directions

					if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
					if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

					if ( onObject === true ) {

						velocity.y = Math.max( 0, velocity.y );
						canJump = true;

					}

					controls.moveRight( - velocity.x * delta );
					controls.moveForward( - velocity.z * delta );

					controls.getObject().position.y += ( velocity.y * delta ); // new behavior

					if ( controls.getObject().position.y < 10 ) {

						velocity.y = 0;
						controls.getObject().position.y = 10;

						canJump = true;

					}

					prevTime = time;

				}


					var delta = clock.getDelta();
							// animation des objets FBX
							if ( mixer ) mixer.update( delta );
							if ( mixer2 ) mixer2.update (delta);
							if ( mixer3 ) mixer3.update (delta);


					renderer.render( scene, camera );



			}

		