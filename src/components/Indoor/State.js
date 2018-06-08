import Point from './Point'

export default class State {
  constructor() {
    this.id
    this.name
    this.geometry //Point
    this.duality
    this.connects = []
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

    var connects = content.connects;
    if (typeof connects !== 'undefined') {
      for(var c of connects) {
        this.connects.push(c.href)
      }
    }

    var geometry = content.geometry
    if (typeof geometry !== 'undefined') {
      var p = new Point()
      p.fromJSON(geometry.point, parser)
      this.geometry = p
    }
  }
}
