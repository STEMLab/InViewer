import * as log from 'loglevel'

import CellSpace from './Cellspace'
import CellSpaceBoundary from './CellSpaceBoundary'

export default class IGMLParser {
  constructor() {
    this.minmax = [];

    //to deal with xlinks
    this.placeholder = {};
    this.gmlIdMap = {};

    this.cells = [];
    this.cellBoundaries = [];
    this.multiLayeredGraph = []; //Graph array

    this.floorflag = 0
  }

  parse(igmlContent) {
    //log.trace(igmlContent);

    var primalSpace = igmlContent.value.primalSpaceFeatures;

    if(primalSpace !== 'undefined') {
      var cells = primalSpace.primalSpaceFeatures.cellSpaceMember;
      if (typeof cells !== 'undefined') {
        for(var cell of cells) {
          var c = new CellSpace();
          c.fromJSON(cell.cellSpace, this);
          this.cells.push(c);
        }
      }

      var cellboundarys = primalSpace.primalSpaceFeatures.cellSpaceBoundaryMember;
      // var cellboundarys = primalspace.primalSpaceFeatures.cellSpaceBoundaryMember;
      if (typeof cellboundarys !== 'undefined') {
        for(var cellboundary of cellboundarys) {
          var cb = new CellSpaceBoundary();
          cb.fromJSON(cellboundary.cellSpaceBoundary, this);
          this.cellBoundaries.push(cb);
        }
      }
    }

    //var layers = igmlContent.value.multiLayeredGraph.multiLayeredGraph.spaceLayers;

    /*
    if(layers !== 'undefined') {
      for(var layer of layers) {
        var layerMember = layer.spaceLayerMember;
        for(var graph of layerMember) {
          var g = new Graph();
          g.fromJSON(graph, this);
          this.multiLayeredGraph.push(g);
        }
      }
    }
    */
  }

  parsePosOrPointPropertyOrPointRep(points, target) {
    for (var i = 0; i < points.length; i++) {
      var point = [points[i].value.value[0], points[i].value.value[2], -points[i].value.value[1]];
      target.push(point[0], point[1], point[2]);
      if (this.floorflag == 0) {
        this.floorflag = 1;
        this.minmax = [point[0], point[1], point[2], point[0], point[1], point[2]];
      } else {
        this.minmax[0] = Math.max(this.minmax[0], point[0]);
        this.minmax[1] = Math.max(this.minmax[1], point[1]);
        this.minmax[2] = Math.max(this.minmax[2], point[2]);
        this.minmax[3] = Math.min(this.minmax[3], point[0]);
        this.minmax[4] = Math.min(this.minmax[4], point[1]);
        this.minmax[5] = Math.min(this.minmax[5], point[2]);
      }
    }
  }

}
