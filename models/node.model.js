export class Node {
  constructor(name) {
    this._name;
    this._parent = null;

    if (this.constructor.name === 'Node') {
      throw new Error('Node class is Abstract. It can only be extended')
    }

    this._name = name;
  }

  get path() {
    if (this.parent) {
      return `${this.parent.path}/${this.name}`
    }

    return this.name;
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    if (!newName || typeof newName !== 'string' || !newName.trim().length) {
      throw new Error('Node name must be a non empty string');
    }

    if (newName.includes('/')) {
      throw new Error("Node name contains invalid symbol");
    }

    if (this.parent && this.parent.hasNode(newName)) {
      throw new Error(`Node with name of "${newName}" already exists in this folder`);
    }

    this._name = newName.trim();
  }

  get parent() {
    return this._parent;
  }

  set parent(newParent) {
    console.log('this.parent, newParent', this.parent, newParent)
  if (newParent !== this.parent && this.parent !==  null) {
      const prevParent = this.parent ;
      this._parent = newParent;

      if (prevParent) {
        prevParent.removeNode(this.name)
      }

      if (newParent) {
        newParent.insertNode(this)
      }
    }
  }
}
