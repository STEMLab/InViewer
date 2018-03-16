import * as log from 'loglevel';

export default class Polygon {
  constructor() {
    this.id;
    this.exterior = []; //float array[1,2,3,4,5,6]
    this.interior = [];
  }

  fromJSON(content, parser) {
    this.id = content.id;

    var exterior = content.exterior
    if(exterior !== undefined) {
      var epoints = exterior.abstractRing.value.posOrPointPropertyOrPointRep;
      parser.parsePosOrPointPropertyOrPointRep(epoints, this.exterior);
    } else {
      console.log("weird")
    }

    var ipoints = content.interior;
    if (typeof ipoints !== 'undefined') {
      //TODO : multiple inner rings
      ipoints = ipoints[0].abstractRing.value.posOrPointPropertyOrPointRep;
      parser.parsePosOrPointPropertyOrPointRep(ipoints, this.interior);
    }

    //assign xlinks
    for (var key in parser.placeholder) {
      log.trace("key : ", key, "PlaceHolder : ", parser.placeholder);
      if (key == this.id) {
        var temp = new Polygon();
        temp.id = this.id + "_1";
        for (var i = this.exterior.length - 3; i >= 0; i -= 3) {
          temp.exterior.push(this.exterior[i]);
          temp.exterior.push(this.exterior[i + 1]);
          temp.exterior.push(this.exterior[i + 2]);
        }
        for (var i = this.interior.length - 3; i >= 0; i -= 3) {
          temp.interior.push(this.interior[i]);
          temp.interior.push(this.interior[i + 1]);
          temp.interior.push(this.interior[i + 2]);
        }
        parser.placeholder[key].push(temp);
        break;
      }
    }

    parser.gmlIdMap[this.id] = this;
  }

  reverse() {
    this.exterior.reverse()
    this.interior.reverse()
  }
}
