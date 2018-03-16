import * as THREE from 'three'
import earcut from 'earcut'

export default class IJSONHelper {
  constructor() {
    this.scale = 0;
  	this.translate = [];

    this.cellDirectory = {};
    this.cellBoundaryDirectory = {};
    this.allGeometries = {};
    this.information = {};

    this.cellMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, opacity:0.3, transparent: true, side: THREE.DoubleSide} );
    this.cbMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide} );
    this.lineMaterial = new THREE.LineBasicMaterial( {color: 0x000000} );
  }

  makeGeometry (indoor) {
    this.calCenter(indoor.bbox);

    // Cells
    var cells = indoor.CellSpace;
    for(const [key, value] of Object.entries(cells)) {

      var cell = value

      var id = key
      var surface = cell.geometry.coordinates

      var exterior = []
      for(var vertex of surface) {
        exterior = exterior.concat(vertex)
      }
      this.transformCoordinates(exterior);
      //var triangulatedSurface = this.triangulate(exterior, []);
      this.cellDirectory[ id ] = exterior;
    }
  }

  createObject (indoor) {
    var group = new THREE.Group();
    group.name = 'IndoorFeatures';

    var primalSpaceFeatures = new THREE.Group();
    primalSpaceFeatures.name = 'PrimalSpaceFeatures';

    var cellSpaces = new THREE.Group();
    cellSpaces.name = 'CellSpace';

    var cells = indoor.CellSpace;
    for(const [key, value] of Object.entries(cells)) {
      var cell = value

      var cellgroup = new THREE.Group();
      cellgroup.name = key;
      var cellGeoms = this.cellDirectory[key];

      var shape = new THREE.Shape()
      shape.moveTo(cellGeoms[0], cellGeoms[1])
      for(var i = 1; i < cellGeoms.length / 3; i++) {
        shape.lineTo ( cellGeoms[i * 3], cellGeoms[i * 3 + 1])
      }

      var extrudeSettings = {
      	steps: 2,
      	amount: cell.geometry.properties.height * this.scale,
        bevelEnabled: false
      };

      var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
      geometry.computeBoundingSphere()
      geometry.computeFaceNormals()
      geometry.computeVertexNormals()

      var mesh = new THREE.Mesh( geometry, this.cellMaterial );
      mesh.position.set( cellGeoms[0], cellGeoms[1], cellGeoms[2] - (cell.geometry.properties.height * this.scale / 2));

      cellgroup.add(mesh);

      cellSpaces.add(cellgroup);
      this.allGeometries[key] = cellgroup;
      this.information[key] = cell;
    }

    primalSpaceFeatures.add( cellSpaces );
    group.add(primalSpaceFeatures);
    group.rotation.x = - 90 * ( Math.PI / 180 );
    //group.rotateX(Math.PI / 2)

    return group;
  }

  calCenter(minmax) {
    var boundingBoxLength = [minmax[0] - minmax[3], minmax[1] - minmax[4], minmax[2] - minmax[5]];
    var maxLength = Math.max(boundingBoxLength[0], boundingBoxLength[1], boundingBoxLength[2]);
    this.scale = 5 / maxLength;
    this.translate = [-(boundingBoxLength[0] / 2) - minmax[3], -(boundingBoxLength[1] / 2) - minmax[4], -minmax[5]];
  }

  transformCoordinates (vertices) {
      for (var i = 0; i < vertices.length / 3; i++) {
          vertices[i * 3] = (vertices[i * 3] + this.translate[0]) * this.scale;
          vertices[i * 3 + 1] = (vertices[i * 3 + 1] +this.translate[1]) * this.scale;
          vertices[i * 3 + 2] = (vertices[i * 3 + 2] +this.translate[2]) * this.scale;
      }

      /*
      for (var i = 0; i < vertices.length / 3; i++) {
          vertices[i * 3] = Math.floor( vertices[i * 3] * 10000) / 10000
          vertices[i * 3 + 1] = Math.floor( vertices[i * 3 + 1] * 10000) / 10000
          vertices[i * 3 + 2] = Math.floor( vertices[i * 3 + 2] * 10000) / 10000
      }
      */

  }

  calVector (vertices) {
      var vecx = [vertices[3] - vertices[0] , vertices[6] - vertices[0]];
      var vecy = [vertices[4] - vertices[1] , vertices[7] - vertices[1]];
      var vecz = [vertices[5] - vertices[2] , vertices[8] - vertices[2]];

      var nx = Math.abs(vecy[0] * vecz[1] - vecz[0] * vecy[1]);
      var ny = Math.abs(-(vecx[0] * vecz[1] - vecz[0] * vecx[1]));
      var nz = Math.abs(vecx[0] * vecy[1] - vecy[0] * vecx[1]);

      return [nx, ny, nz];
  }

  triangulate (vertices, interior) {
    var partition = [];
    var newvertices = [];
    var newinterior = [];

    var vector = this.calVector(vertices);

    var nx = vector[0];
    var ny = vector[1];
    var nz = vector[2];

    var max = Math.max(nx, ny, nz);

    if(nz == max){
        for(var i = 0; i < vertices.length / 3; i++) {
            newvertices.push(vertices[i * 3]);
            newvertices.push(vertices[i * 3 + 1]);
        }

        for(var i = 0; i < interior.length / 3; i++) {
            newinterior.push(interior[i * 3]);
            newinterior.push(interior[i * 3 + 1]);
        }
    }
    else if(nx == max){
        for(var i = 0; i < vertices.length / 3; i++) {
            newvertices.push(vertices[i * 3 + 1]);
            newvertices.push(vertices[i * 3 + 2]);
        }
        for(var i = 0; i < interior.length / 3; i++) {
            newinterior.push(interior[i * 3 + 1]);
            newinterior.push(interior[i * 3 + 2]);
        }
    }
    else {
        for(var i = 0; i < vertices.length / 3; i++) {
            newvertices.push(vertices[i * 3]);
            newvertices.push(vertices[i * 3 + 2]);
        }
        for(var i = 0; i < interior.length / 3; i++) {
            newinterior.push(interior[i * 3]);
            newinterior.push(interior[i * 3 + 2]);
        }
    }

    var interiorStartIndex = (newvertices.length / 2) - 1;
    var polygonwithhole = newvertices.concat(newinterior);

    var triangle = earcut(polygonwithhole, [interiorStartIndex]);

    var concatVertices = vertices.concat(interior);


    for(var i = 0; i < triangle.length; i++) {
        partition.push(concatVertices[triangle[i] * 3]);
        partition.push(concatVertices[triangle[i] * 3 + 1]);
        partition.push(concatVertices[triangle[i] * 3 + 2]);
    }

    return partition;

  }
}
