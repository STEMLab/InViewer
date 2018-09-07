import Polygon from './Polygon'

export default class CellSpace {
  constructor() {
    this.id;
    this.name = "";
    this.geometry = []; //Polygon array
    this.duality = "";
    this.partialboundedBy; //boundarysurface
  }

  fromJSON(content, parser) {
    this.id = content.id;

    var n = content.name;
    if (typeof n !== 'undefined') {
      this.name = n[0].value;
    }

    var du = content.duality;
    if (typeof du !== 'undefined') {
      this.duality = du.href;
    }

    var bound = content.partialboundedBy;
    if (typeof bound !== 'undefined') {
      this.partialboundedBy = bound[0].href;
    }

    var cellGeometry = content.cellSpaceGeometry

    var geod = cellGeometry.geometry3D;
    if (typeof geod !== 'undefined') {
      
	  var exteriorSurfaces = geod.abstractSolid.value.exterior.shell.surfaceMember;
      for (var surface of exteriorSurfaces) {
        var polygon = new Polygon();
        polygon.fromJSON(surface.abstractSurface.value, parser);
        this.geometry.push(polygon);
      }
	  
	  if( geod.abstractSolid.value.interior != undefined){
		var interiorSolids = geod.abstractSolid.value.interior;
		  for( var interiorSolid of interiorSolids ){
			for (var surface of interiorSolid.shell.surfaceMember) {
			  var polygon = new Polygon();
			  polygon.fromJSON(surface.abstractSurface.value, parser);
			  this.geometry.push(polygon);
			}	
		  }
	  }
    } else {
      geod = cellGeometry.geometry2D;
      if (typeof geod !== 'undefined') {
        var surface = geod.abstractSurface;
        if (typeof surface !== 'undefined') {
          var polygon = new Polygon();
          polygon.fromJSON(surface.value, parser);
          this.geometry.push(polygon);
        }
      }
    }
  }
}
