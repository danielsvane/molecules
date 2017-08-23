import OrbitControls from "three-js/addons/OrbitControls";
import THREELib from "three-js";
import isosurface from "isosurface";
import Algebrite from "/imports/client/algebrite";
import katex from "katex";
import $ from "jquery";
import nearley from "nearley";
import grammar from "/imports/client/arithmetic";

let parse = function(eq){
  let parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  eq = eq.replace(/([^\/\+\-])(\s)([^\/\+\-])/g, "$1*$3");
  eq = eq.replace(/([^\/\+\-])(\s)([^\/\+\-])/g, "$1*$3"); // run it twice would be nice
  console.log("replaced wave function: ", eq);
  return parser.feed(eq).results[0];
}

let replaceSingle = function(string, target, source){
  return string.replace(new RegExp("([^a-zA-Z]|^)("+target+")([^a-zA-Z]|$)", "g"), "$1"+source+"$3");
}

let THREE = THREELib(["OrbitControls"]);

export default class Simulation {

  constructor(n, l, m, radius, theta, phi, particleCount){
    this.exp = /([^a-zA-Z]|^)(x)([^a-zA-Z]|$)/g;
    this.bounds = radius;
    this.particleCount = particleCount;
    this.phi = phi;
    this.theta = theta;
    this.eq = "";
  }

  init(){
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 75, $(".simulation").width()/$(".simulation").height(), 0.1, 1000 );
    let renderer = new THREE.WebGLRenderer({antialias: false});

    scene.background = new THREE.Color(0x333333);
    renderer.setSize( $(".simulation").width(), $(".simulation").height() );
    camera.position.z = this.bounds;
    camera.position.x = this.bounds;
    camera.position.y = this.bounds;
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.up = new THREE.Vector3( 0, 0, 1 );

    let controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableKeys = false;

    this.THREE = THREE;
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.spriteMap = new THREE.TextureLoader().load( "circle.png" );
    this.sphereMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthTest: false});

    $(".simulation").html( renderer.domElement );

    console.log("initialized simulation");
  }

  render(){
    requestAnimationFrame( this.render.bind(this) );
    this.renderer.render(this.scene, this.camera);
  }

  createSphere(){
    let geometry = new THREE.SphereBufferGeometry(this.bounds, 32, 32, 0, this.phi, 0, this.theta);
    let sphere = new THREE.Mesh(geometry, this.sphereMaterial);
    sphere.rotateX(Math.PI/2);
    sphere.name = "sphere";
    this.scene.add(sphere);
  }

  removeObject(name){
    this.scene.remove( this.scene.getObjectByName(name) );
  }

  // Returns the possible values of l a given n
  getls(n){
    let res = [];
    for(let l=0; l<=n-1; l++) res.push(l);
    return res;
  }

  // Returns the possible values of m a given l
  getms(l){
    let res = [];
    for(let m=0; m<=l; m++){
      if(m === -0) m = 0;
      res.push(m);
    }
    return res;
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
    let eq = "(1-x^2)^(abs(m)/2)*d(P_l, x, abs(m))";
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
    let eq = "e*sqrt((2*l+1)/(4*pi)*(l-abs(m))!/(l+abs(m))!)*(P_lm)*exp(i*(m)*p)";
    let e = (m>0) ? "(-1)^(m)" : "1";
    eq = replaceSingle(eq, "e", e);
    eq = replaceSingle(eq, "P_lm", this.getLegendreFunction(l, m));
    eq = replaceSingle(eq, "l", l);
    eq = replaceSingle(eq, "m", m);
    eq = replaceSingle(eq, "a", 1);

    res = Algebrite.simplify(eq);
    katex.render("Y^{"+m+"}_{"+l+"} = " + this.replaceLatex(res.toLatexString()), $("#harmonic")[0], {displayMode: true});

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

    katex.render("R_{"+n+l+"} = " + this.replaceLatex(res.toLatexString()), $("#radial")[0], {displayMode: true});

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
    let conj = Algebrite.simplify(Algebrite.multiply(Algebrite.real(eq), Algebrite.real(eq)));


    katex.render("\\psi_{"+n+l+m+"} = " + this.replaceLatex(res.toLatexString()), $("#wave")[0], {displayMode: true});
    katex.render("|\\psi_{"+n+l+m+"}|^2 = " + this.replaceLatex(conj.toLatexString()), $("#wavesquared")[0], {displayMode: true});

    console.log("wave function: ", res.toString());
    console.log("complex conjugated wave function: ", conj.toString());

    let float = Algebrite.float(conj).toString();
    console.log("floated wave function: ", float.toString());

    let parsed = parse(float);
    console.log("parsed wave function: ", parsed);
    console.log("");

    this.eq = parsed;
    this.compileFunction(parsed);
    return parsed;
  }

  replaceLatex(latex){
    latex = replaceSingle(latex, "t", "\\theta");
    latex = replaceSingle(latex, "p", "\\phi");
    return latex;
  }

  addAtom(eq){
    let res = 10;
    let bound = 40;

    let mesh = isosurface.marchingCubes([res,res,res], function(x,y,z) {
      let r = Math.sqrt(x*x + y*y + z*z);
      let t = Math.acos(z/r);
      let p = Math.atan(y/x);

      return Algebrite.eval(eq, "r", r, "t", t, "p", p).d - 1e-6;
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

  drawCoordinateSystem(){
    let bounds = this.bounds;
    this.coordinateSystem = [];
    this.coordinateSystem.push(this.drawAxis(bounds, 0, 0, "x"));
    this.coordinateSystem.push(this.drawAxis(0, bounds, 0, "y"));
    this.coordinateSystem.push(this.drawAxis(0, 0, bounds, "z"));
  }

  updateCoordinateSystem(){
    this.updateAxis(this.coordinateSystem[0], "x");
    this.updateAxis(this.coordinateSystem[1], "y");
    this.updateAxis(this.coordinateSystem[2], "z");
  }

  updateAxis(axis, direction){
    axis.line.geometry.vertices[0][direction] = -this.bounds;
    axis.line.geometry.vertices[1][direction] = this.bounds;
    axis.labelNegative.position[direction] = -this.bounds-0.3;
    axis.labelPositive.position[direction] = this.bounds+0.3;
    axis.line.geometry.verticesNeedUpdate = true;
  }

  drawAxis(x, y, z, label){
    let material = new this.THREE.LineBasicMaterial({
      color: 0x000000
    });
    material.transparent = true;
    material.opacity = 0.2;

    let geometry = new this.THREE.Geometry();
    geometry.vertices.push(
      new this.THREE.Vector3( -x, -y, -z ),
      new this.THREE.Vector3( x, y, z )
    );
    let line = new this.THREE.Line( geometry, material );
    this.scene.add( line );

    let labelPositive = this.makeTextSprite(label);
    labelPositive.position[label] = this.bounds+0.3;
    this.scene.add(labelPositive);

    let labelNegative = this.makeTextSprite("-"+label);
    labelNegative.position[label] = -this.bounds-0.3;
    this.scene.add(labelNegative);

    return {line: line, labelPositive: labelPositive, labelNegative: labelNegative};
  }

  makeTextSprite( message ){
    let fontsize = 25;
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    var context = canvas.getContext('2d');
    context.font = fontsize+"px sans-serif";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText( message, canvas.width/2, canvas.height/2+fontsize/4);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( { map: texture, opacity: 0.5 } );
    var sprite = new THREE.Sprite( spriteMaterial );

    let scale = 0.7;
    sprite.scale.set(scale, scale, scale);

    return sprite;
  }

  generateRandomPoint(bounds){
    let x = Math.random()*bounds*2-bounds;
    let y = Math.random()*bounds*2-bounds;
    let z = Math.random()*bounds*2-bounds;
    // If point is outside of sphere, find a new one
    if(Math.sqrt(x*x+y*y+z*z) < bounds) return {x: x, y: y, z: z};
    else return this.generateRandomPoint(bounds);
  }

  generatePoints(bounds, eq){
    let multiplier = 2;
    let values = [];
    let points = [];

    for(let x=-bounds*multiplier; x<bounds*multiplier; x++){
      for(let y = -bounds*multiplier; y<bounds*multiplier; y++){
        for(let z = -bounds*multiplier; z<bounds*multiplier; z++){
          let p = {x: x/multiplier, y: y/multiplier, z: z/multiplier};
          let val = this.getFunctionValue(eq, p.x, p.y, p.z);
            points.push(p);
            values.push(val);
        }
      }
    }

    return {values: values, points: points};
  }

  generateRandomPoints(bounds){
    let values = [];
    let points = [];

    _.times(this.particleCount, (n) => {
      let p = this.generateRandomPoint(bounds);
      let val = this.getFunctionValue(p.x, p.y, p.z);
      points.push(p);
      values.push(val);
    });

    return {values: values, points: points};
  }

  addCloud(){

    let g = this.generateRandomPoints(this.bounds);
    let values = g.values;
    let points = g.points;

    // Normalise the opacities
    let positions = [];
    let alphas = [];

    let max = 0;
    for(let i in values){
      if(values[i] > max) max = values[i];
    }
    for(let i in values){
      values[i] = values[i]/max;
      if(values[i] > 0.02){
        positions.push(points[i]);
        alphas.push(values[i]);
      }
    }

    this.createPointCloud(positions, alphas);
  }

  createPointCloud(points, values){

    let geometry = new THREE.BufferGeometry();

    // uniforms
    let uniforms = {
        color: { value: new THREE.Color( 0xffffff ) },
        texture: { value: this.spriteMap }
    };

    // point cloud material
    let material = new THREE.ShaderMaterial({
        uniforms:       uniforms,
        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        transparent:    true,
        depthTest: false
    });


    let positions = new Float32Array(points.length*3);
    let alphas = new Float32Array(points.length);

    for(let i in points){
      positions[i*3] = points[i].x;
      positions[i*3+1] = points[i].y;
      positions[i*3+2] = points[i].z;

      alphas[i] = values[i];
    }

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

    let pointCloud = new THREE.Points(geometry, material);
    pointCloud.name = "cloud";

    this.scene.add(pointCloud);
  }

  compileFunction(eq){
    this.functionValue = Function('r', 't', 'p', "return "+eq);
  }

  getFunctionValue(x, y, z){
    let r = Math.sqrt(x*x + y*y + z*z);
    let t = Math.acos(z/r);
    let p = Math.atan2(y, x);

    // Check if the generated point lies within the boundaries defined by theta and phi.
    // Phi needs to be adjusted by pi, as atan2 returns between -pi and pi.
    if(t < this.theta && p < this.phi-Math.PI) return this.functionValue(r, t, p);
    else return 0;
  }

  update(){
    this.removeObject("cloud");
    this.addCloud();
  }
}
