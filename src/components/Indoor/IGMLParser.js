import * as log from 'loglevel'

import CellSpace from './Cellspace'
import CellSpaceBoundary from './CellSpaceBoundary'

import SpaceLayer from './SpaceLayer'
import State from './State'
import Transition from './Transition'

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
    if (igmlContent == undefined) {
      log.debug("target IndoorGML is empty")
      return
    }

    var primalSpace = igmlContent.value.primalSpaceFeatures
    if (primalSpace !== undefined) {
      var cells = primalSpace.primalSpaceFeatures.cellSpaceMember
      if (cells !== undefined) {
        for (var cell of cells) {
          var c = new CellSpace()
          c.fromJSON(cell.cellSpace, this)
          this.cells.push(c)
        }
      }

      var cellboundarys = primalSpace.primalSpaceFeatures.cellSpaceBoundaryMember
      if (cellboundarys !== undefined) {
        for (var cellboundary of cellboundarys) {
          var cb = new CellSpaceBoundary()
          cb.fromJSON(cellboundary.cellSpaceBoundary, this)
          this.cellBoundaries.push(cb)
        }
      }
    }

    if (igmlContent.value.multiLayeredGraph !== undefined) {
      var mg = igmlContent.value.multiLayeredGraph.multiLayeredGraph;
      var layers = mg.spaceLayers;
      if (typeof layers !== 'undefined') {
        for (var layer of layers) {
          var layerMember = layer.spaceLayerMember
          for (var member of layerMember) {
            var spaceLayer = member.spaceLayer
            var spaceLayerId = spaceLayer.id

            var sl = new SpaceLayer();
            sl.fromJSON(spaceLayer, this);
            this.multiLayeredGraph.push(sl);
          }
        }
      }
    }
  }

  parseNodes(nodesArr, spaceLayer) {
    if (nodesArr !== undefined) {
      for (var nodes of nodesArr) {
        var stateMembers = nodes.stateMember;
        if (stateMembers !== undefined) {
          for (var stateMember of stateMembers) {
            var newState = new State();
            newState.fromJSON(stateMember.state, this)
            spaceLayer.nodes.push(newState)
          }
        }
      }
    }
  }

  parseEdges(edgeArr, spaceLayer) {
    if (edgeArr !== undefined) {
      for (var edges of edgeArr) {
        var transitionMembers = edges.transitionMember;
        if (transitionMembers !== undefined) {
          for (var transitionMember of transitionMembers) {
            var newTransition = new Transition();
            newTransition.fromJSON(transitionMember.transition, this)
            spaceLayer.edges.push(newTransition)
          }
        }
      }
    }
  }

  parsePosOrPointPropertyOrPointRep(points, target) {
    if (points.value !== undefined) {
      var point = [points.value[0], points.value[2], -points.value[1]];
      target.push(point[0], point[1], point[2]);
      this.setMinMax(point)
    } else {
      for (var i = 0; i < points.length; i++) {
        var point = [points[i].value.value[0], points[i].value.value[2], -points[i].value.value[1]];
        target.push(point[0], point[1], point[2]);
        this.setMinMax(point)
      }
    }
  }

  setMinMax(point) {
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
