import { Relayer, CHANNEL_NAMES } from '/MessageRelayer.js';
import { ConnectedNode } from '/components/connected-node.component.js'
// import { PathNavigator } from '/PathNavigator.js'
import { Folder } from '/models/folder.model.js'
import initializePath from '/Pathogen.js'

const { forkJoin, asObservable, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const USE_SEED = 'tree'


export class FileSystemView {
  constructor(options) {
    this.seeds = { name: 'folder1' }
    this.view = document.querySelector('#file-system');
    this.self = this.view
    this.childNodes = new Map();

    this.pathSubject$ = new Subject()
 
    this.pathogen = initializePath(this.pathSubject$)

    this.nodeState = {
      _observable$: null,
      subject$: new Subject().pipe(),
      get observable$() {
        if (!this._observable$) this._observable$ = this.subject$.asObservable()
        return this._observable$;
      },
    }


    Relayer.connect(this, 'fs', msg => !['folder', 'file'].includes(msg.action.split(':')[0]) &&
      msg.target !== this.childNodes.get(this.children[1])
    )

    this.pathSubject$
      .pipe(
        map(val => this.send({
          action: 'pathchange',
          source: this,
          payload: { path: val }
        })),
      )
      .subscribe()

    // this.messages$.pipe().subscribe()

    this.childClicks$ = fromEvent(this.self, 'click')
      .pipe(
        filter(evt => evt.path.some(el => el instanceof Element && el.classList.contains('node'))),
        map(evt => this.childNodes.get(evt.target.closest('.node'))),
        tap(node => this.path$._path),
        map(node => {
          if (node.isOpen === false) this.currentFolder = node
          return node;
        }),
      )
      .subscribe(this.nodeState.subject$)

    const root = this.seeds[USE_SEED]

    this.rootNode = new ConnectedNode(root, null);
    this.rootNode.self = this.self;

    this.currentFolder = this.rootNode
    this.currentPath = [this.currentFolder]

    this.rootNode.children.forEach((item, i) => {
      const n = this.createNode(item)
      this.childNodes.set(n.self, n)
    });
    const me = this
    console.log({ me });

  } // END CONSTRUXTOR

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

  get currentFolder() { return this._currentFolder; }

  set currentFolder(val) {
    this._currentFolder = val
    this.pathogen.update(this._currentFolder.path) //= [...this._currentPath, val]
  }

  set currentPath(val) { this._currentPath = val }

  get currentPath() { return this._currentPath.map(folder => `${folder.name}`); }

  get active() { return this.self.querySelector('.selected'); }

  get children() { return [...this.self.children]; }

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
      )
    )

    this.childNodes.set(connectedNode.self, connectedNode)

    this.append(connectedNode.self, parent.self, before, )
    return connectedNode
  }

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







// export class FileSystem {
//   constructor(selector, options) {
//     this.seeds = { ...options.seeds }
//     this.self = document.querySelector('#file-system');
//     this.path$ = new PathNavigator()

//     this.childNodes = new Map();

//     this.pathSubject$ = new Subject()
//     this.pathogen = initializePath(this.pathSubject$)

//     this.nodeState = {
//       _observable$: null,
//       subject$: new Subject().pipe(),
//       get observable$() {
//         if (!this._observable$) this._observable$ = this.subject$.asObservable()
//         return this._observable$;
//       },
//     }


//     Relayer.connect(this, 'fs', msg => !['folder', 'file'].includes(msg.action.split(':')[0]) &&
//       msg.target !== this.childNodes.get(this.children[1])
//     )

//     this.pathSubject$
//       .pipe(
//         map(val => this.send({
//           action: 'pathchange',
//           source: this,
//           payload: { path: val }
//         })),
//       )
//       .subscribe()

//     this.messages$.pipe().subscribe()

//     this.childClicks$ = fromEvent(this.self, 'click')
//       .pipe(
//         filter(evt => evt.path.some(el => el instanceof Element && el.classList.contains('node'))),
//         map(evt => this.childNodes.get(evt.target.closest('.node'))),
//         tap(node => this.path$._path),
//         map(node => {
//           if (node.isOpen === false) this.currentFolder = node
//           return node;
//         }),
//       )
//       .subscribe(this.nodeState.subject$)

//     const root = this.seeds[USE_SEED]

//     this.rootNode = new ConnectedNode(root, null);
//     this.rootNode.self = this.self;

//     this.currentFolder = this.rootNode
//     this.currentPath = [this.currentFolder]

//     this.rootNode.children.forEach((item, i) => {
//       const n = this.createNode(item)
//       this.childNodes.set(n.self, n)
//     });
//   }

//   hasItem(itemName) { return this.childNodes.has(itemName); }

//   insertItem(item) {
//     if (this.hasItem(item.name)) return true;
//     if (item === this) throw new Error('Folder cannot contain itself');

//     let parent = this.parent;

//     while (parent !== null) {
//       if (parent === item) throw new Error('Folder cannot contain one of its ancestors');

//       parent = parent.parent;
//     }

//     this.childNodes.set(item.name, item);
//     item.parent = this;

//     return this.hasItem(item.name);
//   }

//   getItem(itemName) { return this.childNodes.get(itemName) || null; }

//   removeItem(itemName) {
//     const item = this.getItem(itemName);

//     if (item) {
//       this.childNodes.delete(itemName);
//       item.parent = null;
//     }

//     return !this.hasItem(itemName);
//   }

//   get currentFolder() { return this._currentFolder; }

//   set currentFolder(val) {
//     this._currentFolder = val
//     this.pathogen.update(this._currentFolder.path) //= [...this._currentPath, val]
//   }

//   set currentPath(val) { this._currentPath = val }

//   get currentPath() { return this._currentPath.map(folder => `${folder.name}`); }

//   get active() { return this.self.querySelector('.selected'); }

//   get children() { return [...this.self.children]; }

//   createFolder(model, parent = this.rootNode) {
//     const newFolder = new ConnectedNode(model, parent);
//     const inserted = this.currentFolder.insertItem(newFolder);

//     this.printCurrentFolder()
//     return this;
//   }

//   openFolder(path) {
//     if (!path) return null;

//     let folder = this.getFolderFromPath(path);

//     if (!(folder && folder instanceof Folder)) return null;

//     const folderPath = [folder];
//     let parent = folder.parent;

//     while (parent) {
//       folderPath.unshift(parent);
//       parent = parent.parent;
//     }

//     this.currentFolder = folder;
//     this.currentPath = folderPath;

//     this.printCurrentFolder()
//     return folder;
//   }

//   printCurrentFolder() {
//     console.log(
//       `\n[${this.currentPath.join('/')}]:` +
//       (this.currentFolder.content.map(item =>
//         `\n[${item.constructor.name.substring(0,1)}]-> ${item.name}`).join('') || '\n(empty)')
//     )
//   }

//   getNodeChildren(node) { return [...node.querySelector('ul').querySelectorAll('.node')] }

//   createNode(node, parent = this, before) {
//     parent = this.rootNode ? this.rootNode : parent.closest('.node').querySelector('.child-list')

//     const nodeAttrs = {
//       classList: ['transparency', 'node'],
//       dataset: {
//         selected: 'false',
//         open: 'false',
//         nodeType: node.nodeType || 'node',
//         nodeId: node.id || null,
//       }
//     }

//     const connectedNode = new ConnectedNode(
//       node, parent, nodeAttrs, null,
//       this.nodeState.observable$.pipe(
//         map(node => node === connectedNode ? true : false),
//       )
//     )

//     this.childNodes.set(connectedNode.self, connectedNode)

//     this.append(connectedNode.self, parent.self, before, )
//     return connectedNode
//   }

//   append(element, parent, position, callback = () => {}) {
//     if (position) { parent.insertBefore(element, position); }
//     else { parent.appendChild(element); }

//     callback(element, parent);
//     return element;
//   }


//   getFolderFromPath = folderPath => {
//     if (folderPath.match(/^(root\/?|\/)$/g)) {
//       return this.rootNode;
//     }

//     if (folderPath.match(/^\.\/?$/g)) {
//       return this.currentFolder;
//     }

//     let folder = folderPath.match(/^(root\/?|\/)/g) ? this.rootNode : this.currentFolder;
//     const paths = folderPath.replace(/^(root\/|\.\/|\/)/g, '').split('/');

//     while (paths.length) {
//       folder = folder.getItem(paths.shift());

//       if (!folder || !(folder instanceof Folder)) {
//         return null
//       }
//     }

//     if (paths.length === 0) {
//       return folder;
//     }

//     return null;
//   }


//   focus(target) {
//     window.clearTimeout(this.id);
//     this.id = window.setTimeout(() => document.hasFocus() && target.focus(), 100);
//   }

//   select(target) {
//     const summary = target.querySelector('summary');

//     if (summary) { target = summary; }

//     [...this.self.querySelectorAll('.selected')]
//     .forEach(e => e.classList.remove('selected'));

//     target.classList.add('selected');

//     this.focus(target);
//     this.emit('select', target);
//   }


//   siblings(element = this.self.querySelector('a, details')) {
//     if (this.self.contains(element)) {
//       if (element.dataset.type === undefined) {
//         element = element.parentElement;
//       }
//       return [...element.parentElement.children]
//         .filter(e => {
//           return e.dataset.type === SimpleTree.FILE || e.dataset.type === SimpleTree.FOLDER;
//         })
//         .map(e => {
//           if (e.dataset.type === SimpleTree.FILE) {
//             return e;
//           }
//           else { return e.querySelector('summary'); }
//         });
//     } else { return []; }
//   }

//   unloadFolder(summary) {
//     const details = summary.closest('details');
//     details.open = false;
//     const focused = this.active();

//     if (focused && this.self.contains(focused)) {
//       this.select(details);
//     }

//     [...details.children].slice(1)
//       .forEach(e => e.remove());

//     details.dataset.loaded = false;
//   }
// }
