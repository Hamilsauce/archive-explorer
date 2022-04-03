import { Folder } from '/models/folder.model.js'
import { Node } from '/models/node.model.js'
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class ConnectedNode extends Node {
  constructor(model, parent, attributes, connectionFn, selected$) {
    if (!model.name === 'root')
      if (!(model && parent && connectionFn)) throw new Error(`Connected Node missing model, parent, or connection required for instantiation.`);
    super(model.name)
    this.self = document.createElement('li');

    this._name;
    this._boxContent;
    this._childList;
    this.selectedSubscription;

    this.parent = parent;
    this._children = model.children
    this.childNodes = new Map(model.children.map((x, i) => [x.name, x]));
    this._nodeType = model.nodeType
    this.selected$ = selected$

    this.init(attributes)

    Object.assign(this, model);


    // this.self.addEventListener('click', this.handleClick.bind(this));
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
        this._nodeType === 'folder' ? this._children
          .reduce((list, curr, i, arr) => {
            return  list + `\n<li class="box">${curr.name}</li>`
        }, '') : ''
      }</ul>
    `;
  }

  get path() {
    if (this.parent) {
      return `${this.parent.path}/${this.name}`
    }

    return this.name;
  }


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
  };
}


