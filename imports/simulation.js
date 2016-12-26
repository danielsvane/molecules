import OrbitControls from "three-js/addons/OrbitControls";
import THREELib from "three-js";
import isosurface from "isosurface";

let THREE = THREELib(["OrbitControls"]);
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 20;
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
let controls = new THREE.OrbitControls( camera, renderer.domElement );

controls.enableZoom = true;

export default class Simulation {

  constructor(){

    this.render();

    this.addAtom();
  }

  addAtom(){
    var geometry = new THREE.SphereGeometry( 2, 32, 32 );
    var material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: false
    });
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = -5;
    scene.add( sphere );
  }

  render(){
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

}
