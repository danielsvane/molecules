// var s = 0.001;
// var tinyChangeX = new THREE.Vector3( s, 0, 0 );
// var tinyChangeY = new THREE.Vector3( 0, s, 0 );
// var tinyChangeZ = new THREE.Vector3( 0, 0, s );
//
// var upTinyChangeInX, upTinyChangeInY, upTinyChangeInZ;
// var downTinyChangeInX, downTinyChangeInY, downTinyChangeInZ;
// var tinyChangeInX, tinyChangeInY, tinyChangeInZ;
//
// var vertexNormals = [];
// var normal;
//
// var map = function(p) {
//   return p.length() - 1;
// };
//
// for (var i = 0; i < geometry.vertices.length; ++i) {
//     vertex = geometry.vertices[i];
//
//     upTinyChangeInX   = map( vertex.clone().add(tinyChangeX) );
//     downTinyChangeInX = map( vertex.clone().sub(tinyChangeX) );
//     tinyChangeInX = upTinyChangeInX - downTinyChangeInX;
//
//     upTinyChangeInY   = map( vertex.clone().add(tinyChangeY) );
//     downTinyChangeInY = map( vertex.clone().sub(tinyChangeY) );
//     tinyChangeInY = upTinyChangeInY - downTinyChangeInY;
//
//     upTinyChangeInZ   = map( vertex.clone().add(tinyChangeZ) );
//     downTinyChangeInZ = map( vertex.clone().sub(tinyChangeZ) );
//     tinyChangeInZ = upTinyChangeInZ - downTinyChangeInZ;
//
//     normal = new THREE.Vector3(tinyChangeInX, tinyChangeInY, tinyChangeInZ);
//     normal.normalize();
//     vertexNormals.push(normal);
// }
//
// for (var i = 0; i < geometry.faces.length; ++i) {
//     f = geometry.faces[i];
//     f.vertexNormals = [
//         vertexNormals[f.a],
//         vertexNormals[f.b],
//         vertexNormals[f.c]
//     ];
// }
