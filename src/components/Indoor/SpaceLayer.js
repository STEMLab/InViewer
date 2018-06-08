import State from './State'
import Transition from './Transition'

export default class SpaceLayer {
  constructor() {
    this.id
  }

  fromJSON(content, parser) {
    this.id = content.id;

    var nodesArr = content.nodes
    parser.parseNodes(nodesArr)

    var edgesArr = content.edges
    parser.parseEdges(edgesArr)
  }
}
