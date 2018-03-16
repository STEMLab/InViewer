import IGMLParser from './IGMLParser'

export default class Indoor {
  constructor() {
      this.minmax = [];

      //to deal with xlinks
      this.placeholder = {};
      this.gmlIdMap = {};

      this.cells = [];
      this.cellBoundaries = [];
      this.multiLayeredGraph = []; //Graph array
  }

  fromJSON(content) {
    var parser = new IGMLParser();
    parser.parse(content);

    this.minmax = parser.minmax;
    this.cells = parser.cells;
    this.cellBoundaries = parser.cellBoundaries;
    this.multiLayeredGraph = parser.multiLayeredGraph;
  }
}
