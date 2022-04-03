import { Node } from './node.model.js';
export class Folder extends Node {

  constructor(name = '', children = [], parent, type = '') {
    super(name || 'un-named folder')
    this._type = ''
    this._children = new Map(children.map(ch => [ch.name || 'new folder', ch]));
  }

  get content() {
    return Array.from(this.children.values());
  }

  hasItem(nodeName) {
    return this.children.has(nodeName);
  }

  insertItem(node) {
    if (this.hasItem(node.name)) return this.getItem(node.name);

    if (node === this) throw new Error('Folder cannot contain itself');

    let parent = this.parent;

    while (parent !== null) {
      if (parent === node) {
        throw new Error('Folder cannot contain one of its ancestors');
      }
      parent = parent.parent;
    }

    this.children.set(node.name, node);
    node.parent = this;

    return this.getItem(node.name);
  }

  getItem(nodeName) {
    return super.children.get(nodeName) || null;
  }

  removeItem(nodeName) {
    const node = this.getItem(nodeName);

    if (node) {
      this.children.delete(nodeName);
      node.parent = null;
    }

    return !this.hasItem(nodeName);
  }
  
  get type() {
    return this._type;
  }

  get copy() {
    const folderCopy = new Folder(`${this.name} copy`, this.type);

    this.content.forEach(node => {
      const nodeCopy = node.copy;
      nodeCopy.name = node.name;
      folderCopy.insertItem(nodeCopy);
    })

    return folderCopy;
  }

  hasItem(nodeName) {
    return this._children.has(nodeName);
  }

  insertItem(node) {
    if (this.hasItem(node.name)) return true;

    if (node === this) throw new Error('Folder cannot contain itself');

    let parent = this.parent;

    while (parent !== null) {
      if (parent === node) {
        throw new Error('Folder cannot contain one of its ancestors');
      }
      parent = parent.parent;
    }

    this._children.set(node.name, node);
    node.parent = this;

    return this.hasItem(node.name);
  }

  getItem(nodeName) {
    console.log(' this', this)
    return this._children.find(_ => _.name === nodeName) //get(nodeName) || null;
  }

  removeItem(nodeName) {
    const node = this.getItem(nodeName);

    if (node) {
      this.children.delete(nodeName);
      node.parent = null;
    }

    return !this.hasItem(nodeName);
  }
}
