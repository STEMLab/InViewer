import * as log from 'loglevel';

export default class Point {
  constructor() {
    this.id
    this.coordinates = []
  }

  fromJSON(content, parser) {
    this.id = content.id
    var pos = content.pos;
    if (typeof pos !== 'undefined') {
        parser.parsePosOrPointPropertyOrPointRep(pos, this.coordinates);
    }
  }
}
