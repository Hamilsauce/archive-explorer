import { Folder } from '/models/folder.model.js'
import { Node } from '/models/node.model.js'
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class ConnectedNode extends Folder {
  constructor(model, parent, attributes, connectionFn, selected$) {
    if (!model.name === 'root')
      if (!(model && parent && connectionFn)) throw new Error(`Connected Node missing model, parent, or connection required for instantiation.`);

    super(model)

    this.childNodes = new Map(model.children.map((x, i) => [x.name, x]));
    this.self = document.createElement('li');

    this._name;
    this._boxContent;
    this._childList;
    this.selectedSubscription;

    this._parent = parent;
    this._children = model.children
    this._nodeType = model.nodeType
    this.selected$ = selected$

    this.init(attributes)
    Object.assign(this, model);
  }

  init(attrs) {
    this.self.innerHTML = this.template();

    if (attrs) {
      for (let attr of Object.keys(attrs)) {
        if (attr === 'dataset') { Object.entries(attrs[attr]).forEach(([prop, val]) => this.self.dataset[prop] = val) }
        else if (attr === 'classList') { this.self.classList.add(...attrs[attr], 'node') }
        else if (attr === 'style') {
          if (typeof attrs[attr] === 'string') this.self.style = `${this.self.style} ${attrs[attr]}`
          else Object.entries(attrs[attr]).forEach(([prop, val]) => this.self.style[prop] = val);
        }
        else this.self.setAttribute(attr, attrs[attr])
      }
    }

    if (this.selected$) {
      this.selectedSubscription = this.selected$
        .pipe(tap(this.setActiveState.bind(this)))
        .subscribe()
    }
  }

  setActiveState(val) {
    this.dataset.open = val
    this.dataset.selected = val
    return val
  }

  template(opts) {
    return `  
      <div class="node-content">${this._name || this.content}</div>
      <ul class="child-list">${
        this._nodeType === 'folder' ? this.children
          .reduce((list, curr, i, arr) => {
            return  list + `\n<li class="box">${curr.name}</li>`
        }, '') : ''
      }</ul>
    `;
  }

  // get content() {
  //   return Array.from(this.childNodes.values());
  // }

  // hasNode(nodeName) {
  //   return this.childNodes.has(nodeName);
  // }

  // insertNode(node) {
  //   if (this.hasNode(node.name)) return true;

  //   if (node === this) throw new Error('Folder cannot contain itself');

  //   let parent = this.parent;

  //   while (parent !== null) {
  //     if (parent === node) {
  //       throw new Error('Folder cannot contain one of its ancestors');
  //     }
  //     parent = parent.parent;
  //   }

  //   this.childNodes.set(node.name, node);
  //   node.parent = this;

  //   return this.hasNode(node.name);
  // }

  // getNode(nodeName) {
  //   return this.childNodes.get(nodeName) || null;
  // }

  // removeNode(nodeName) {
  //   const node = this.getNode(nodeName);

  //   if (node) {
  //     this.childNodes.delete(nodeName);
  //     node.parent = null;
  //   }

  //   return !this.hasNode(nodeName);
  // }


  get boxContent() {
    // console.log('this', this)
    return this.self.querySelector('.node-content')
  }

  get childList() { return this.self.querySelector('.child-list') }

  get childElements() { return [...this.childList.children('.child-list')].filter(_ => _.classList.contains('node')) }
  get children() { return this._children }
  set children(val) { this._children = val }
  get isOpen() { return this.dataset.open === 'true' ? true : false }

  set isOpen(val) { this.dataset.open = val === true ? 'true' : 'false' }

  get isSelected() { return this.dataset.selected === 'true' ? true : false }
  set isSelected(val) { this.dataset.selected = val === true ? 'true' : 'false' }
  get dataset() { return this.self.dataset }
  get name() { return this._name }
  set name(nameVal) {
    this.nodeContent.textContent = nameVal.trim();
    this._name = nameVal;
  }
}
