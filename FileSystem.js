// import { Relayer, CHANNEL_NAMES } from '/MessageRelayer.js';
// import { ConnectedNode } from '/components/connected-node.component.js'
// import { PathNavigator } from '/PathNavigator.js'
// import { Folder } from '/models/folder.model.js'
// import initializePath from '/Pathogen.js'

const { forkJoin, asObservable, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const USE_SEED = 'tree'

const SelectorMap = {
  content: 'fs-#content',

}

class UI {
  constructor(selectorMap = {}) {
    this.root;
  };
  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}



export class FileSystem {
  constructor(selector, options) {
    this.seeds = { ...options.seeds }

    this.ui = {
      view: document.querySelector('#file-system'),
      get children() {
        return [...this.view.children].filter(_ => _.classList.contains('node'))
      }
    }


    this.sendNodeSelection = Relayer.connect(this, 'fs').send

    this.currentPathEmitter$ = new Subject().pipe(
      tap(node => this.sendNodeSelection({
        action: 'pathchange',
        source: this,
        payload: { path: node }
      })));

    this.pathogen = initializePath(this.currentPathEmitter$)

this.pushToPath$ = 
    this.pathogen.update(this._currentFolder.path) //= [...this._currentPath, val]

    this.self = document.querySelector('#file-system');
    // this.self = new Folder('root')
    this.childNodes = new Map();


    this.nodeState = {
      _observable$: null,
      subject$: new Subject().pipe(),
      get observable$() {
        if (!this._observable$) this._observable$ = this.subject$.asObservable()
        return this._observable$;
      },
    }

    this.selectedNode$ = fromEvent(this.self, 'click')
      // Transforms clicks into node
      .pipe(
        filter(evt => evt.path.some(el => el instanceof Element && el.classList.contains('node'))),
        map(evt => this.childNodes.get(evt.target.closest('.node[data-node-type=folder]'))),
      )
      
      .subscribe(console.log)


    this.pathState$ = this.selectedNode$
      .pipe(
        map(node => {
          if (node.isOpen === false) this.currentFolder = node
          return node;
        }),
        
        tap(node => this.currentPathEmitter$),
      )
      .subscribe(this.nodeState.subject$)



    // const root = this.seeds[USE_SEED]
console.log('root', root)
    // this.rootNode = new ConnectedNode(root, null);
    this.rootNode.self = this.self;

    this.currentFolder = this.rootNode
    // this.currentPath = [this.currentFolder]

  }

  /* ~~ END OF CONSTRUCTOR ~~ */

  get currentFolder() { return this._currentFolder; }

  set currentFolder(val) {
    this._currentFolder = val

    // this.renderCurrentFolder(this.currentFolder)

    this.pathogen.update(this._currentFolder.path) //= [...this._currentPath, val]
  }

  set currentPath(val) { this._currentPath = val }

  get currentPath() { return this._currentPath.map(folder => `${folder.name}`); }

  get active() { return this.self.querySelector('.selected'); }

  get children() { return [...this.self.children]; }

  renderCurrentFolder(curr) {
    while (this.self.firstChild) {
      this.self.remove(this.self.firstChild)
    }

    this.createNode()


    // this.rootNode.children.forEach((item, i) => {
    //   const n = this.createNode(item)
    //   this.childNodes.set(n.self, n)
    // });

    return
  }

  createNode(node, parent = this, before) {
    parent = this.rootNode ? this.rootNode : parent.closest('.node').querySelector('.child-list')

    const nodeAttrs = {
      classList: ['transparency', 'node'],
      dataset: {
        selected: 'false',
        open: 'false',
        nodeType: node.nodeType || 'node',
        nodeId: node.id || null,
      }
    }

    const connectedNode = new ConnectedNode(
      node, parent, nodeAttrs, null,
      this.nodeState.observable$.pipe(
        map(node => node === connectedNode ? true : false),
        tap(x => console.log('connectedNode nodestats', x)),
      )
    )

    // this.childNodes.set(connectedNode.self, connectedNode)

    this.append(connectedNode.self, parent.self, before, )
    return connectedNode
  }

  hasItem(itemName) { return this.childNodes.has(itemName); }

  insertItem(item) {
    if (this.hasItem(item.name)) return true;
    if (item === this) throw new Error('Folder cannot contain itself');

    let parent = this.parent;

    while (parent !== null) {
      if (parent === item) throw new Error('Folder cannot contain one of its ancestors');

      parent = parent.parent;
    }

    this.childNodes.set(item.name, item);
    item.parent = this;

    return this.hasItem(item.name);
  }

  getItem(itemName) { return this.childNodes.get(itemName) || null; }

  removeItem(itemName) {
    const item = this.getItem(itemName);

    if (item) {
      this.childNodes.delete(itemName);
      item.parent = null;
    }

    return !this.hasItem(itemName);
  }

  createFolder(model, parent = this.rootNode) {
    const newFolder = new ConnectedNode(model, parent);
    const inserted = this.currentFolder.insertItem(newFolder);

    this.printCurrentFolder()
    return this;
  }

  openFolder(path) {
    if (!path) return null;

    let folder = this.getFolderFromPath(path);

    if (!(folder && folder instanceof Folder)) return null;

    const folderPath = [folder];
    let parent = folder.parent;

    while (parent) {
      folderPath.unshift(parent);
      parent = parent.parent;
    }

    this.currentFolder = folder;
    this.currentPath = folderPath;

    this.printCurrentFolder()
    return folder;
  }

  printCurrentFolder() {
    console.log(
      `\n[${this.currentPath.join('/')}]:` +
      (this.currentFolder.content.map(item =>
        `\n[${item.constructor.name.substring(0,1)}]-> ${item.name}`).join('') || '\n(empty)')
    )
  }

  getNodeChildren(node) { return [...node.querySelector('ul').querySelectorAll('.node')] }

  append(element, parent, position, callback = () => {}) {
    if (position) { parent.insertBefore(element, position); }
    else { parent.appendChild(element); }

    callback(element, parent);
    return element;
  }


  getFolderFromPath = folderPath => {
    if (folderPath.match(/^(root\/?|\/)$/g)) {
      return this.rootNode;
    }

    if (folderPath.match(/^\.\/?$/g)) {
      return this.currentFolder;
    }

    let folder = folderPath.match(/^(root\/?|\/)/g) ? this.rootNode : this.currentFolder;
    const paths = folderPath.replace(/^(root\/|\.\/|\/)/g, '').split('/');

    while (paths.length) {
      folder = folder.getItem(paths.shift());

      if (!folder || !(folder instanceof Folder)) {
        return null
      }
    }

    if (paths.length === 0) {
      return folder;
    }

    return null;
  }


  focus(target) {
    window.clearTimeout(this.id);
    this.id = window.setTimeout(() => document.hasFocus() && target.focus(), 100);
  }

  select(target) {
    const summary = target.querySelector('summary');

    if (summary) { target = summary; }

    [...this.self.querySelectorAll('.selected')]
    .forEach(e => e.classList.remove('selected'));

    target.classList.add('selected');

    this.focus(target);
    this.emit('select', target);
  }


  siblings(element = this.self.querySelector('a, details')) {
    if (this.self.contains(element)) {
      if (element.dataset.type === undefined) {
        element = element.parentElement;
      }
      return [...element.parentElement.children]
        .filter(e => {
          return e.dataset.type === SimpleTree.FILE || e.dataset.type === SimpleTree.FOLDER;
        })
        .map(e => {
          if (e.dataset.type === SimpleTree.FILE) {
            return e;
          }
          else { return e.querySelector('summary'); }
        });
    } else { return []; }
  }

  unloadFolder(summary) {
    const details = summary.closest('details');
    details.open = false;
    const focused = this.active();

    if (focused && this.self.contains(focused)) {
      this.select(details);
    }

    [...details.children].slice(1)
      .forEach(e => e.remove());

    details.dataset.loaded = false;
  }
}
