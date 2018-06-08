import State from './State'
import Transition from './Transition'

export default class SpaceLayer {
  constructor() {
    this.id
    this.nodes = []
    this.edges = []
  }

  fromJSON(content, parser) {
    this.id = content.id;

    var nodesArr = content.nodes
    parser.parseNodes(nodesArr, this)

    var edgesArr = content.edges
    parser.parseEdges(edgesArr, this)
  }
}
