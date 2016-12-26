import OrbitControls from "three-js/addons/OrbitControls";
import THREELib from "three-js";
import isosurface from "isosurface";
import Algebrite from "/imports/algebrite";
import katex from "katex";
import $ from "jquery";
import './main.html';

//window.Algebrite = Algebrite;

Template.simulation.onRendered(() => {

  let THREE = THREELib(["OrbitControls"]);
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera( 75, $(".simulation").width()/$(".simulation").height(), 0.1, 1000 );
  let renderer = new THREE.WebGLRenderer({antialias: true});
  let controls = new THREE.OrbitControls( camera, renderer.domElement );
  let light = new THREE.HemisphereLight( 0xffffff, 0x444444, 1 );

  scene.background = new THREE.Color(0x333333);
  renderer.setSize( $(".simulation").width(), $(".simulation").height() );
  $(".simulation").html( renderer.domElement );
  camera.position.z = 10;
  camera.position.x = 10;
  camera.position.y = 10;
  camera.lookAt(new THREE.Vector3(0,0,0));
  controls.enableZoom = true;
  scene.add(light);

  let render = function () {
    requestAnimationFrame( render );
    renderer.render(scene, camera);
  };

  render();

  let replaceSingle = function(string, target, source){
    return string.replace(new RegExp("([^a-zA-Z]|^)("+target+")([^a-zA-Z]|$)", "g"), "$1"+source+"$3");
  }

  class Simulation {

    constructor(){
      this.exp = /([^a-zA-Z]|^)(x)([^a-zA-Z]|$)/g;
    }

    getLegendrePolynomial(l){
      let eq = "1/(2^l*l!)*d((x^2-1)^l, x, l)";
      eq = eq.replace(/l/g, l);
      eq = Algebrite.simplify(eq).toString();

      console.log("legendre polynomial: ", eq);
      return eq;
    }

    getLegendreFunction(l, m){
      // https://en.wikipedia.org/wiki/Associated_Legendre_polynomials
      let eq = "(1-x^2)^(m/2)*d(P_l, x, m)";
      eq = eq.replace(/P_l/g, this.getLegendrePolynomial(l));
      eq = eq.replace(/l/g, l);
      eq = eq.replace(/m/g, m);
      eq = eq.replace(this.exp, "$1cos(t)$3");
      eq = Algebrite.simplify(eq).toString();

      console.log("legendre function: ", eq);
      return eq;
    }

    getSphericalHarmonics(l, m){
      // https://en.wikipedia.org/wiki/Spherical_harmonics
      let eq = "(-1)^m*sqrt((2*l+1)/(4*pi)*(l-m)!/(l+m)!)*P_lm*exp(i*m*p)";
      eq = replaceSingle(eq, "P_lm", this.getLegendreFunction(l, m));
      eq = replaceSingle(eq, "l", l);
      eq = replaceSingle(eq, "m", m);
      eq = replaceSingle(eq, "a", 1);

      res = Algebrite.simplify(eq);
      katex.render("Y^"+m+"_{"+l+"} = " + res.toLatexString(), $("#harmonic")[0], {displayMode: true});

      console.log("spherical harmonic: ", res.toString());
      return eq.toString();
    }

    getRadialWave(l, n){
      let eq = "sqrt((2/(n*a))^3*(n-l-1)!/(2*n*((n+l)!)^3))*exp(-r/(n*a))*(2*r/(n*a))^l*L_pq";
      eq = replaceSingle(eq, "L_pq", this.getLaguerre(2*l+1, n-l-1));
      eq = replaceSingle(eq, "x", "r*2/(n*a)");
      eq = replaceSingle(eq, "l", l);
      eq = replaceSingle(eq, "n", n);
      eq = replaceSingle(eq, "a", 1);

      res = Algebrite.simplify(eq);

      katex.render("R_{"+n+l+"} = " + res.toLatexString(), $("#radial")[0], {displayMode: true});

      console.log("radial wave: ", res.toString());
      return res.toString();
    }

    getLaguerre(p, q){
      // https://en.wikipedia.org/wiki/Laguerre_polynomials
      q = p+q;
      let eq = "(-1)^p*d(L_q, x, p)";
      eq = eq.replace(/([^a-zA-Z]|^)(p)([^a-zA-Z]|$)/g, "$1"+p+"$3");
      eq = eq.replace(/L_q/g, this.getAssociatedLaguerre(q));
      eq = eq.replace(/q/g, q);
      eq = Algebrite.simplify(eq).toString();

      console.log("laguerre polynomial: ", eq);
      return eq;
    }

    getAssociatedLaguerre(q){
      let eq = "exp(x)*d(exp(-x)*x^q, x, q)";
      eq = eq.replace(/q/g, q);
      eq = Algebrite.simplify(eq).toString();

      console.log("associated laguerre: ", eq);
      return eq;
    }

    getWaveFunction(l, m, n){
      let eq = "(R_ln)*(Y_lm)";
      eq = replaceSingle(eq, "R_ln", this.getRadialWave(l, n));
      eq = replaceSingle(eq, "Y_lm", this.getSphericalHarmonics(l, m));

      let res = Algebrite.simplify(eq);
      let conj = Algebrite.simplify(Algebrite.multiply(Algebrite.conj(eq), res));
      //let foo = Algebrite.simplify("("+res.toString()+")*("+conj+")");
      console.log(Algebrite.eval(conj).cons);

      katex.render("\\psi_{"+n+l+m+"} = " + res.toLatexString(), $("#wave")[0], {displayMode: true});
      katex.render("|\\psi_{"+n+l+m+"}|^2 = " + conj.toLatexString(), $("#wavesquared")[0], {displayMode: true});

      console.log("wave function: ", res.toString());
      console.log("complex conjugated wave function: ", conj.toString());
      return Algebrite.float(conj);
    }

    addAtom(eq){
      let res = 10;
      let bound = 10;

      let mesh = isosurface.surfaceNets([res,res,res], function(x,y,z) {
        let r = Math.sqrt(x*x + y*y + z*z);
        let t = Math.acos(z/r);
        let p = Math.atan(y/x);

        // let rofl = replaceSingle(eq, "r", r);
        // rofl = replaceSingle(rofl, "t", theta);
        // rofl = replaceSingle(rofl, "p", phi);
        // console.log(eq);
        //let number = Algebrite.float(rofl).d;
        //console.log(r);
        //console.log(number);
        //return Algebrite.eval(eq, "r", r, "t", t, "p", p).d - 1e-8;
        return Math.pow(r*Math.exp(-r)*Math.cos(t), 2) - 0.00001
      }, [[-bound,-bound,-bound], [bound,bound,bound]])

      let geometry = new THREE.Geometry();

      for(let vertex of mesh.positions){
        geometry.vertices.push(new THREE.Vector3().fromArray(vertex));
      }

      for(let face of mesh.cells){
        geometry.faces.push(new THREE.Face3(face[0], face[1], face[2]));
      }

      geometry.mergeVertices();
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      let material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: false,
        side: THREE.DoubleSide
      });

      let obj = new THREE.Mesh(geometry, material);
      scene.add(obj);
    }
  }

  let simulation = new Simulation();

  // simulation.getSphericalHarmonics(1, 1);
  //simulation.getLegendreFunction(1, 1);
  //simulation.getLaguerre(2, 2);
  //let dada = simulation.getWaveFunction(1, 0, 2)
  let eq = simulation.getWaveFunction(2, 0, 3);
  console.log(Algebrite.eval(eq, "r", "(1, 2)"));
  // console.log(eq);
  // eq = replaceSingle(eq, "r", 50);
  // console.log(eq);
  // console.log(Algebrite.float(eq).d);
  simulation.addAtom(dada);
  //simulation.getRadialWave(0, 2);
});
