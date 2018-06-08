import LineString from './LineString'

export default class Transition {
  constructor() {
    this.id
    this.name
    this.geometry //LineString
    this.duality
    this.connects = []
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

    var connects = content.connects;
    if (typeof connects !== 'undefined') {
      for(var c of connects) {
        this.connects.push(c.href)
      }
    }

    var geometry = content.geometry
    if (typeof geometry !== 'undefined') {
      var l = new LineString()
      l.fromJSON(geometry.abstractCurve.value, parser)
      this.geometry = l;
    }
  }
}
