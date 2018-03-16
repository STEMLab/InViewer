import Polygon from './Polygon'
import LineString from './LineString'

export default class CellSpaceBoundary {
  constructor() {
    this.id
    this.name = ""
    this.geometry = [] //Polygon array
    this.duality = ""
    this.geometryType = "3D"
  }

  fromJSON(content, parser) {
    this.id = content.id

    var n = content.name
    if (typeof n !== 'undefined') {
      this.name = n[0].value
    }

    var du = content.duality;
    if (typeof du !== 'undefined') {
      this.duality = du.href
    }

    var cellSpaceBoundaryGeometry = content.cellSpaceBoundaryGeometry

    var geod = cellSpaceBoundaryGeometry.geometry3D;
    if (typeof geod !== 'undefined') {
      var exterior = geod.abstractSurface
      if (typeof exterior !== 'undefined') {
        var polygon = new Polygon()
        polygon.fromJSON(exterior.value, parser)
        this.geometry.push(polygon);
        this.geometryType = "3D"
      }
      // Xlink
      else {
        var xlink = geod.abstractSurface.value.baseSurface.href
        xlink = xlink.substr(1, xlink.length)
        var polygon = parser.gmlIdMap.get(xlink)
        this.geometry.push(polygon);
        if(polygon == 'undefined') {
          parser.placeHolder[xlink] = this.geometry
        }
      }
      //TODO : interior
    } else {
      geod = cellSpaceBoundaryGeometry.geometry2D
      if (typeof geod !== 'undefined') {
        var curve = geod.abstractCurve;
  			if(typeof curve !== 'undefined') {
  				var linestring = new LineString();
          linestring.fromJSON(curve.value, parser)
  				this.geometry.push(linestring);
          this.geometryType = "2D"
  			}
      }
    }
  }

}
