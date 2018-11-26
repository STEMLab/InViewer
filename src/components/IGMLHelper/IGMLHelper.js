import * as THREE from 'three'
import earcut from 'earcut'

export default class IGMLHelper {
  constructor() {
    this.scale = 0;
  	this.translate = [];

    this.cellDirectory = {};
    this.cellBoundaryDirectory = {};
    this.stateDirectory = {};
    this.transitionDirectory = {};
    this.allGeometries = {};
    this.information = {};

    this.cellMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, opacity:0.3, transparent: true, side: THREE.DoubleSide} );
    this.cbMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide} );
    this.stateMaterial = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
    this.transitionMaterial = new THREE.LineBasicMaterial( {color: 0x0000ff} );
    this.lineMaterial = new THREE.LineBasicMaterial( {color: 0x000000,linewidth: 100} );
  }

  parseCellSpaceGeometry(indoor) {
	  console.log('hi');
    if(indoor.cells) {
      var cells = indoor.cells
      for(var cell of cells) {
        var cellGeometry = []

        var surfaces = cell.geometry
        if(surfaces !== undefined) {
          for(var surface of surfaces) {
            this.transformCoordinates(surface.exterior);
            this.transformCoordinates(surface.interior);

            var triangulatedSurface = this.triangulate(surface.exterior, surface.interior);
            cellGeometry = cellGeometry.concat(triangulatedSurface);
          }
        }
        this.cellDirectory[ cell.id ] = cellGeometry;
      }
    }
	console.log(this.cellDirectory);
  }

  parseCellSpaceBoundaryGeometry(indoor) {
    var cellBoundaries = indoor.cellBoundaries
    for(var cbs of cellBoundaries) {
      var geometry
      if(cbs.geometryType === "3D") {
        this.transformCoordinates(cbs.geometry[0].exterior);
        geometry = this.triangulate(cbs.geometry[0].exterior, []);
      } else {
        this.transformCoordinates(cbs.geometry[0].points);
        geometry = cbs.geometry[0].points;
      }
      this.cellBoundaryDirectory[ cbs.id ] = geometry
    }
  }

  parseSpaceLayerGeometry(indoor) {
    if(typeof indoor.multiLayeredGraph !== 'undefined') {
      var multiLayeredGraph = indoor.multiLayeredGraph
      for(var sl of multiLayeredGraph) {
        var nodes = sl.nodes
        for(var state of nodes) {
          this.transformCoordinates(state.geometry.coordinates)
          this.stateDirectory[state.id] = state.geometry.coordinates
        }

        var edges = sl.edges;
        for(var transition of edges) {
          this.transformCoordinates(transition.geometry.points)
          this.transitionDirectory[transition.id] = transition.geometry.points
        }
      }
    }
  }

  makeGeometry (indoor) {
    this.calCenter(indoor.minmax)

    this.parseCellSpaceGeometry(indoor)
    this.parseCellSpaceBoundaryGeometry(indoor)

    // MultiLayeredGraph
    this.parseSpaceLayerGeometry(indoor)
  }

  createObject (indoor) {
    var group = new THREE.Group();
    group.name = 'IndoorFeatures';

    var primalSpaceFeatures = new THREE.Group();
    primalSpaceFeatures.name = 'PrimalSpaceFeatures';

    var cellSpaces = new THREE.Group();
    cellSpaces.name = 'CellSpace';

    var cells = indoor.cells;

    for(var cell of cells) {
      var key = cell.id;

      var cellgroup = new THREE.Group();
      cellgroup.name = key;
      var cellGeoms = this.cellDirectory[key];

      var geometry = new THREE.BufferGeometry();
      var vertices = new Float32Array( cellGeoms );
      geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )
      geometry.computeBoundingSphere()
      geometry.computeFaceNormals()
      geometry.computeVertexNormals()

      var mesh = new THREE.Mesh( geometry, this.cellMaterial );
      cellgroup.add(mesh);

      // creating surface geometries
      var surfaces = cell.geometry;
      for(var surface of surfaces) {
        var polygon = surface.exterior;

        var geometry = new THREE.Geometry();
        for(var k = 0; k < polygon.length; k += 3){
            geometry.vertices.push(new THREE.Vector3( polygon[k], polygon[k + 1], polygon[k + 2]));
        }

        var line = new THREE.Line( geometry, this.lineMaterial  );
        cellgroup.add(line);
      }

      //var line = new THREE.Line( geometry, this.lineMaterial );
      //cellgroup.add(line);

      cellSpaces.add(cellgroup);
      this.allGeometries[key] = cellgroup;
      this.information[cell.id] = cell;
    }

    var cellSpaceBoundary = new THREE.Group();
    cellSpaceBoundary.name = 'CellSpaceBoundary';

    var cbs = indoor.cellBoundaries;
    for(var cb of cbs) {
      var key = cb.id;

      var cbGroup = new THREE.Group();
      cbGroup.name = key;
      var cbGeom = this.cellBoundaryDirectory[key];

      var geometry = new THREE.BufferGeometry();

      if(cb.geometryType == "3D") {
        var polygon = cbGeom
        var vertices = []
        for(var k = 0; k < polygon.length; k += 3) {
            vertices.push(polygon[k], polygon[k + 1], polygon[k + 2])
        }

        geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )
        geometry.computeBoundingSphere()
        var mesh = new THREE.Mesh( geometry, this.cbMaterial )
        cbGroup.add(mesh);
      } else {
        var linestring = cbGeom
        //geometry.addAttribute('position', new THREE.Float32BufferAttribute( linestring.points, 3 ) )
        //geometry.computeBoundingSphere();

        //var line = new THREE.Line( line, this.lineMaterial );
        //cbGroup.add(line);
		
		
		
		var lineGeom = cbGeom

        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array( lineGeom );
        geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )

        var line = new THREE.Line( geometry, this.lineMaterial );
        cbGroup.add(line)
		
		
		
      }
      cellSpaceBoundary.add( cbGroup )
    }

    var sps = indoor.multiLayeredGraph
    var multiLayeredGraph = new THREE.Group();
    for(var sp of sps) {

      var key = sp.id
      var spGroup = new THREE.Group();
      spGroup.name = key;

      var ns = sp.nodes;
      for(var n of ns) {
        //var box = new THREE.BoxBufferGeometry(0.03, 0.03, 0.03)
        var box = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2)
		box.center()
        var coordinate = this.stateDirectory[n.id]
        var mesh = new THREE.Mesh( box, this.stateMaterial )
        mesh.position.set(coordinate[0], coordinate[1], coordinate[2])
        spGroup.add(mesh)
      }

      var es = sp.edges
      for(var e of es) {
        var lineGeom = this.transitionDirectory[e.id]

        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array( lineGeom );
        geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )

        var line = new THREE.Line( geometry, this.transitionMaterial );
        spGroup.add(line)
      }

      //spGroup.rotateX(-(Math.PI / 2))
      multiLayeredGraph.add(spGroup)
    }

    primalSpaceFeatures.add( cellSpaces );
    primalSpaceFeatures.add( cellSpaceBoundary );
    group.add(primalSpaceFeatures)
    group.add(multiLayeredGraph)

	
    var mS = (new THREE.Matrix4()).identity();
    mS.elements[0] = -1;
    //mS.elements[5] = -1;
    mS.elements[8] = -1;
	group.applyMatrix(mS);
	
	var yM  = (new THREE.Matrix4()).identity();
    yM.makeScale(1, -1, 1);
    group.applyMatrix(yM);
	
	group.rotateX(Math.PI);
	group.rotateY(Math.PI);
	
    return group;
  }

  calCenter(minmax) {
    var boundingBoxLength = [minmax[0] - minmax[3], minmax[1] - minmax[4], minmax[2] - minmax[5]];
    var maxLength = Math.max(boundingBoxLength[0], boundingBoxLength[1], boundingBoxLength[2]);
    this.scale = 20 / maxLength;
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
