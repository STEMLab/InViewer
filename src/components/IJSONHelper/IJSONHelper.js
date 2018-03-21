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
    var cells = indoor.CellSpace
    for(const [key, value] of Object.entries(cells)) {

      var cell = value

      var id = key
      var surface = cell.geometry.coordinates

      var exterior = []
      for(var vertex of surface) {
        exterior = exterior.concat(vertex)
      }
      this.transformCoordinates(exterior);
      this.cellDirectory[ id ] = exterior;
    }

    var cellBoundaries = indoor.CellSpaceBoundary
    for(const [key, value] of Object.entries(cells)) {

      var cb = value

      var id = key
      var line = cb.geometry.coordinates

      var points = []
      for(var vertex of line) {
        points = points.concat(vertex)
      }

      this.transformCoordinates(points);
      this.cellBoundaryDirectory[ id ] = points;
    }
    console.log(cellBoundaries)
  }

  createObject (indoor) {
    var group = new THREE.Group();
    group.name = 'IndoorFeatures';

    var primalSpaceFeatures = new THREE.Group();
    primalSpaceFeatures.name = 'PrimalSpaceFeatures';

    var cellSpaces = new THREE.Group();
    cellSpaces.name = 'CellSpace';

    var cellBoundaries = new THREE.Group();
    cellBoundaries.name = 'CellBoundary';

    var cells = indoor.CellSpace;
    for(const [key, value] of Object.entries(cells)) {
      var cell = value
      var height = cell.geometry.properties.height

      var cellgroup = new THREE.Group();
      cellgroup.name = key;
      var cellGeoms = this.cellDirectory[key];

      var zBottom = cellGeoms[2]
      var zTop = cellGeoms[2] + (height * this.scale)

      var bottom = []
      var top = []
      for(var i = 0; i < cellGeoms.length / 3; i++) {
        bottom.push (cellGeoms[i * 3], cellGeoms[i * 3 + 1], zBottom)
        top.push(cellGeoms[i * 3], cellGeoms[i * 3 + 1], zTop)
      }
      bottom.push (bottom[0], bottom[1], bottom[2])
      top.push(top[0], top[1], top[2])

      var sides = []
      for(var i = 0; i < bottom.length / 3; i++) {
        var current = i * 3
        var next = ((i + 1) * 3) % (bottom.length)
        var side = []
        side.push(bottom[current], bottom[current + 1], zBottom)
        side.push(bottom[next], bottom[next + 1], zBottom)
        side.push(bottom[next], bottom[next + 1], zTop)
        side.push(bottom[current], bottom[current + 1], zTop)
        side.push(bottom[current], bottom[current + 1], zBottom)
        //console.log(side)
        sides.push(side)
      }

      var vertices = []
      vertices = vertices.concat(this.triangulate(bottom, []))
      vertices = vertices.concat(this.triangulate(top, []))

      for(var side of sides) {
        vertices = vertices.concat(this.triangulate(side, []))
      }

      var lineVertices = []
      lineVertices = lineVertices.concat(bottom)
      lineVertices = lineVertices.concat(top)
      for(var side of sides) {
        lineVertices = lineVertices.concat(side)
      }

      //lineVertices.push(top)

      var geom = new THREE.BufferGeometry();
      geom.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )
      geom.computeBoundingSphere();

      var lineGeom = new THREE.BufferGeometry();
      lineGeom.addAttribute('position', new THREE.Float32BufferAttribute( lineVertices, 3 ) )
      var line = new THREE.Line( lineGeom, this.lineMaterial );
      //line.position.set(0, 0, cellGeoms[2] - (cell.geometry.properties.height * this.scale / 2));
      cellgroup.add(line);

      var mesh = new THREE.Mesh( geom, this.cellMaterial );
      //mesh.position.set( 0, 0, cellGeoms[2] - (cell.geometry.properties.height * this.scale / 2));

      cellgroup.add(mesh);

      cellSpaces.add(cellgroup);
      this.allGeometries[key] = cellgroup;
      this.information[key] = cell;
    }

    var cellBoundaries = indoor.CellSpaceBoundary
    for(const [key, value] of Object.entries(cells)) {
      var cb = value
      var height = cb.geometry.properties.height

      var cbgroup = new THREE.Group();
      cbgroup.name = key;
      var cbGeoms = this.cellBoundaryDirectory[key];

      var zBottom = cbGeoms[2]
      var zTop = cbGeoms[2] + (height * this.scale)

      var lines = []
      for(var i = 0; i < cbGeoms.length / 3; i++) {
        var current = i * 3
        var next = ((i + 1) * 3) % (cbGeoms.length)
        var line = []
        line.push(cbGeoms[current], cbGeoms[current + 1], zBottom)
        line.push(cbGeoms[next], cbGeoms[next + 1], zBottom)
        line.push(cbGeoms[next], cbGeoms[next + 1], zTop)
        line.push(cbGeoms[current], cbGeoms[current + 1], zTop)
        line.push(cbGeoms[current], cbGeoms[current + 1], zBottom)

        lines.push(line)
      }

      vertices = []
      for(var line of lines) {
        vertices = vertices.concat(this.triangulate(line, []))
      }

      var geom = new THREE.BufferGeometry();
      geom.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )
      geom.computeBoundingSphere();

      var mesh = new THREE.Mesh( geom, this.cbMaterial );
      //mesh.position.set( 0, 0, cellGeoms[2] - (cell.geometry.properties.height * this.scale / 2));

      cbgroup.add(mesh);

      cellBoundaries.add(cbgroup);
      this.allGeometries[key] = cbgroup;
      this.information[key] = cb;
    }

    primalSpaceFeatures.add( cellSpaces );
    primalSpaceFeatures.add( cellBoundaries );
    group.add(primalSpaceFeatures);
    //group.rotation.x = - 90 * ( Math.PI / 180 );
    group.rotateX(Math.PI / 2)

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
