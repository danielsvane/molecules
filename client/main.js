// import { Template } from 'meteor/templating';
// import { ReactiveVar } from 'meteor/reactive-var';
// import OrbitControls from "three-js/addons/OrbitControls";
// import THREELib from "three-js";
//
// import './main.html';
//
// let THREE = THREELib(["OrbitControls"]);
//
// var scene = new THREE.Scene();
// scene.background = new THREE.Color(0x333333)
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
//
// var renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
//
// var geometry = new THREE.SphereGeometry( 2, 32, 32 );
// var material = new THREE.MeshLambertMaterial({
//   color: 0xffffff,
//   wireframe: false
// });
// var sphere = new THREE.Mesh( geometry, material );
// sphere.position.x = -5;
// scene.add( sphere );
//
// var geometry = new THREE.SphereGeometry( 2, 32, 32 );
// var material = new THREE.MeshLambertMaterial({
//   color: 0xffffff,
//   wireframe: false
// });
// var sphere = new THREE.Mesh( geometry, material );
// scene.add( sphere );
// sphere.position.x = 5;
//
// var light = new THREE.HemisphereLight( 0xffffff, 0x444444, 1 );
// scene.add( light );
//
// // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// // var cube = new THREE.Mesh( geometry, material );
// // scene.add( cube );
//
// camera.position.z = 20;
//
// controls = new THREE.OrbitControls( camera, renderer.domElement );
// //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
// // controls.enableDamping = true;
// // controls.dampingFactor = 2;
// controls.enableZoom = true;
//
// var render = function () {
//   requestAnimationFrame( render );
//
//
//
//   renderer.render(scene, camera);
// };
//
// render();
