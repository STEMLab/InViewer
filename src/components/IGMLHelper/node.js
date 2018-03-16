export default class Node {
  constructor() {
    this.parent;
    this.group;
    this.children = [];
    this.childTrue;
  }

  init(group, parent) {
    this.parent = parent;
    this.group = group;
    var children = group.children;
    this.childTrue = children.length;

    for (var c of children) {
      var child = new node();
      child.init(c, this);
      this.children.push(child);
    }
  }

  setChild(flag) {
    this.group.visible = flag;
    for (var child of this.children) {
      child.setChild(flag);
    }
  }

  setParent() {
    if (this.childTrue == 0) {
      this.group.visible = false;
    } else {
      this.group.visible = true;
    }
    if (this.parent !== null) {
      if (this.group.visible == true) {
        this.parent.childTrue++;
      } else {
        this.parent.childTrue--;
      }
      this.parent.setParent();
    }
  }

  change(group) {
    if (this.group == group) {
      if (this.parent !== null) {
        if (group.visible == true) {
          this.parent.childTrue++;
        } else {
          this.parent.childTrue--;
        }
        this.parent.setParent();
      }

      for (var child of this.children) {
        child.setChild(group.visible);
      }
    } else if (this.children !== 'undefined') {
      for (var child of this.children) {
        child.change(group);
      }
    }
  }
}
