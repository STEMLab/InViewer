import * as log from 'loglevel';

export default class LineString {
  constructor() {
    this.id;
    this.points = [];
  }

  fromJSON(content, parser) {
    this.id = content.id;
    var geometry = content.posOrPointPropertyOrPointRep;
    if (typeof geometry !== 'undefined') {
      parser.parsePosOrPointPropertyOrPointRep(geometry, this.points);
      for (var key in parser.placeHolder) {
        if (key == this.id) {
          var temp = new LineString();
          temp.id = this.id + "_1";
          for (var i = this.points.length - 3; i >= 0; i -= 3) {
            temp.points.push(this.points[i]);
            temp.points.push(this.points[i + 1]);
            temp.points.push(this.points[i + 2]);
          }
          parser.placeHolder[key].push(temp);
          break;
        }
      }
      parser.gmlIdMap[this.id] = this;
    } else {
      //assign xlinks
      var xlink = content.baseCurve.href;
      xlink = xlink.substr(1, xlink.length);
      for (var id in parser.gmlIdMap) {
        if (id === xlink) {
          var linestring = new LineString();
          linestring.id = parser.gmlIdMap[xlink].id + "_1";
          for (var i = parser.gmlIdMap[xlink].points.length - 3; i >= 0; i -= 3) {
            linestring.points.push(parser.gmlIdMap[xlink].points[i]);
            linestring.points.push(parser.gmlIdMap[xlink].points[i + 1]);
            linestring.points.push(parser.gmlIdMap[xlink].points[i + 2]);
          }
          this.geometry.push(linestring);
          break;
        }
      }
      if (this.geometry == 'undefined') {
        parser.placeHolder[xlink] = this.geometry;
      }
    }
  }
}
