import * as THREE from 'three'
import earcut from 'earcut'

export default class IJSONHelper {
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
    this.lineMaterial = new THREE.LineBasicMaterial( {color: 0x000000} );
  }
  
  parseCellSpaceGeometry(indoor) {
    if(indoor.CellSpace) {
      var cells = indoor.CellSpace
      for(const [key, value] of Object.entries(cells)) {
		var cell = value
		var id = key
		
        var cellGeometry = []

        var solids = cell.geometry.coordinates
        for(var solid of solids) {			
			
			for(var surfaces of solid){
				var vertexs = []
				
				for(var i = 0; i < surfaces[0][0].length; i++){
					for(var j = 0; j < surfaces[0][0][i].length; j++){
						vertexs = vertexs.concat(surfaces[0][0][i][j])
					}
				}	
				
				this.transformCoordinates(vertexs);

				var triangulatedSurface = this.triangulate(vertexs, []);
				cellGeometry = cellGeometry.concat(triangulatedSurface);
			}
        }
        this.cellDirectory[ id ] = cellGeometry;
      }
    }
  }
  
  parseCellSpaceBoundaryGeometry(indoor) {
    var cellBoundaries = indoor.CellSpaceBoundary
	
	if(cellBoundaries != undefined){
		for(const [key, value] of Object.entries(cellBoundaries)) {

		  var cb = value
		  var id = key
		  var cbGeometry = []
		  
		  var surfaces = cb.geometry.coordinates
		  for(var surface of surfaces){
			  
			var polygon = []
			for(var point of surface){
				polygon = polygon.concat(point)
			}
			
			this.transformCoordinates(polygon)
			
			var triangulatedSurface = this.triangulate(polygon, []);
			cbGeometry = cbGeometry.concat(triangulatedSurface);
			
		  }
		  
		  this.cellBoundaryDirectory[ id ] = cbGeometry;
		  
		}
	}
	
  }
  
  parseStateGeometry(indoor) {
     
	for(const [key, value] of Object.entries(indoor.State)) {
	
		this.transformCoordinates(value.geometry.coordinates[0])
        this.stateDirectory[key] = value.geometry.coordinates[0]
    }
    
  }
  
  parseTransitionGeometry(indoor) {
     
	for(const [key, value] of Object.entries(indoor.Transition)) {
	
		var transition = value;
		var line = [];
		for(var point of transition.geometry.coordinates){
			this.transformCoordinates(point)
			line = line.concat(point)
		}
		
        this.transitionDirectory[key] = line
    }
    
  }

  makeGeometry (indoor) {
    this.calCenter(indoor.bbox);
	
	if(indoor.CellSpace != undefined) this.parseCellSpaceGeometry(indoor)
    if(indoor.CellSpaceBoundary != undefined) this.parseCellSpaceBoundaryGeometry(indoor)
    if(indoor.State != undefined) this.parseStateGeometry(indoor)
	if(indoor.Transition != undefined) this.parseTransitionGeometry(indoor)

  }
  
  createCellObject (cell, key){
	 
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
	  var solids = cell.geometry.coordinates
		
		var solids = cell.geometry.coordinates
        for(var solid of solids) {			
			
			for(var surfaces of solid){
				var polygon = []
				
				for(var i = 0; i < surfaces[0][0].length; i++){
					for(var j = 0; j < surfaces[0][0][i].length; j++){
						polygon = polygon.concat(surfaces[0][0][i][j])
					}
				}
				
				this.transformCoordinates(polygon);
				
				var geometry = new THREE.Geometry();
				for(var k = 0; k < polygon.length; k += 3){
					geometry.vertices.push(new THREE.Vector3( polygon[k], polygon[k + 1], polygon[k + 2]));
				}
				
				var line = new THREE.Line( geometry, this.lineMaterial  );
				cellgroup.add(line);
			}
        }
	
	return cellgroup;
  }
  
  createCellSpaceBoundaryObject (indoor) {
	  
	var cbs = indoor.CellSpaceBoundary;
    for(const [key, value] of Object.entries(cbs)) {
      var cb = value

      var cbGroup = new THREE.Group();
      cbGroup.name = key;
      var cbGeom = this.cellBoundaryDirectory[key];

      var geometry = new THREE.BufferGeometry();

      var polygon = cbGeom
      var vertices = []
	  
      for(var k = 0; k < polygon.length; k += 3) {
          vertices.push(polygon[k], polygon[k + 1], polygon[k + 2])
      }

      geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )
      geometry.computeBoundingSphere()
      var mesh = new THREE.Mesh( geometry, this.cbMaterial )
      cbGroup.add(mesh);
      
    }
	
	return cbGroup;
	  
  }
  
  createStateObject (indoor) {
	  
	  var states = indoor.State;
	  var sGroup = new THREE.Group();
	  sGroup.name = 'sGroup';
	  
	  for(const [key, value] of Object.entries(states)) {
		
		var box = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2)
		box.center()
		var coordinate = this.stateDirectory[key]
		var mesh = new THREE.Mesh( box, this.stateMaterial )
        mesh.position.set(coordinate[0], coordinate[1], coordinate[2])
        sGroup.add(mesh)
		
	}
	
	return sGroup;
	  
  }
  
  createTransitionObject (indoor) {
	  
	  var transitions = indoor.Transition;
	  var tGroup = new THREE.Group();
	  tGroup.name = 'tGroup';
	  
	  for(const [key, value] of Object.entries(transitions)) {
		
		var lineGeom = this.transitionDirectory[key]
		var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array( lineGeom );
        geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) )
		
		var line = new THREE.Line( geometry, this.transitionMaterial );
        tGroup.add(line)
	}
	
	return tGroup;
	  
  }

  createObject (indoor) {
	  console.log('IJSONHelper.createObject');
    var group = new THREE.Group();
    group.name = 'IndoorFeatures';

    var primalSpaceFeatures = new THREE.Group();
    primalSpaceFeatures.name = 'PrimalSpaceFeatures';

    var cellSpaces = new THREE.Group();
    cellSpaces.name = 'CellSpace';
	if(indoor.CellSpace != undefined){
		var cells = indoor.CellSpace;
		for(const [key, value] of Object.entries(cells)) {
			var cellgroup = this.createCellObject(value, key);
			cellSpaces.add(cellgroup);
			this.allGeometries[key] = cellgroup;
			this.information[key] = value;
		}
	}
	
    var cellBoundaries = new THREE.Group();
    cellBoundaries.name = 'CellSpaceBoundary';
	if(indoor.CellSpaceBoundary != undefined) cellBoundaries.add( this.createCellSpaceBoundaryObject(indoor) )
	

	var multiLayeredGraph = new THREE.Group();
	
	if(indoor.State != undefined) multiLayeredGraph.add( this.createStateObject(indoor) )	
	if(indoor.Transition != undefined) multiLayeredGraph.add( this.createTransitionObject(indoor) )

	
    primalSpaceFeatures.add( cellSpaces );
    primalSpaceFeatures.add( cellBoundaries );
	
    group.add(primalSpaceFeatures);
	group.add(multiLayeredGraph);
    //group.rotation.x = - 90 * ( Math.PI / 180 );
	
	var yM  = (new THREE.Matrix4()).identity();
	yM.makeScale(-1, 1, 1);
	group.applyMatrix(yM);
	
    group.rotateX(Math.PI / 2);
		

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
