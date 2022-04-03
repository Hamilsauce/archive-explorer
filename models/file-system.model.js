const { iif, ReplaySubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { race, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;
const { fromFetch } = rxjs.fetch;
import { Message } from './message.model.js'


import { Folder } from '/_collapsible-node/models/folder.model.js'
import { Relayer, CHANNEL_KEY } from '../MessageRelayer.js';
import { File } from '/_collapsible-node/models/file.model.js'
import { CollapsibleNode } from '../COLLAPSIBLE-TREE-STABLE/CollapsibleNode.component.js'

export class FileSystem {
  constructor() {
    this.self = new Folder('root');
    this.currentFolder = this.self;
    this.currentFolderPath = [this.currentFolder]; // as stack
  }

  get currentFolder() { return this.currentFolder; }

  get currentFolderPath() { return this.currentFolderPath.map(folder => `${folder.name}`); }

  get root() { return this.self; }

  get parent() { return null; }

  get name() { return this.root.name; }

  get copy() {
    const fsCopy = new FileSystem();

    this.root.content.forEach(node => {
      const nodeCopy = node.copy;
      nodeCopy.name = node.name;
      fsCopy.insertNode(nodeCopy);
    })

    return fsCopy;
  }

  get content() {return this.currentFolder.content;}

  createFile(fileName, ...options) {
    const newFile = new File(fileName, ...options);
    const inserted = this.insertNode(newFile);

    return inserted ? newFile : null;
  }

  createFolder(folderName, type = '') {
    console.log('folderName', folderName)
    const newFolder = new Folder(folderName, type);
    const inserted = this.currentFolder.insertNode(newFolder);

    if (!inserted) throw Error('[FILE SYSTEM]: Failed to insert newly created folder')

    this.printCurrentFolder();

    return this;
  }

  insertNode(node) {
    return this.currentFolder.insertNode(node);
  }

  getNode(nodeName) {
    return this.currentFolder.getNode(nodeName);
  }

  hasNode(nodeName) {
    return this.currentFolder.hasNode(nodeName);
  }

  removeNode(nodeName) {
    return this.currentFolder.removeNode(nodeName);
  }

  renameNode(currentName, newName) {
    const node = this.getNode(currentName);

    if (node) {
      node.name = newName;
      this.removeNode(currentName);
      this.insertNode(node);
      return node;
    }

    return null;
  }

  copyNode(nodeName) {
    const node = this.getNode(nodeName);

    if (node) {
      const nodeCopy = node.copy;
      this.insertNode(nodeCopy);
      return nodeCopy;
    }

    return null;
  }

  printCurrentFolder() {
    console.log(
      `\n[${this.currentFolderPath.join('/')}]:` +
      (this.currentFolder.content.map(node =>
        `\n[${node.constructor.name.substring(0,1)}]-> ${node.name}`).join('') || '\n(empty)')
    )
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
    this.currentFolderPath = folderPath;

    this.printCurrentFolder()
    return folder;
  }

  goBack(steps = 1) {
    if (isNaN(steps) || steps <= 0 || steps >= this.currentFolderPath.length) return null;

    let folder = this.currentFolder;
    let stepsMoved = steps;

    while (folder && stepsMoved > 0) {
      folder = folder.parent;
      stepsMoved -= 1;
    }

    if (folder && folder !== this.currentFolder) {
      this.currentFolder = folder;
      this.currentFolderPath = this.currentFolderPath
        .slice(0, this.currentFolderPath.length - (steps - stepsMoved));
    }

    return folder;
  }

  goBackToFolder(folderName) {
    const folderIndex = this.currentFolderPath.lastIndexOf(folderName, this.currentFolderPath.length - 2);

    if (folderIndex < 0) return null;

    const folder = folderIndex === 0 ? this.root : this.currentFolderPath[folderIndex];

    this.currentFolder = folder;
    this.currentFolderPath = this.currentFolderPath.slice(0, folderIndex + 1)
    this.printCurrentFolder()
    return folder;
  }

  findNode(nodeNameOrValidatorFunc, fromFolder = this.root) {
    return this.setupAndFind(nodeNameOrValidatorFunc, fromFolder);
  }

  findAllNodes(nodeNameOrValidatorFunc, fromFolder = this.root) {
    return this.setupAndFind(nodeNameOrValidatorFunc, fromFolder, true);
  }

  moveNodeTo(nodeName, folderPath) {
    const node = this.getNode(nodeName);

    if (node) {
      const folder = this.getFolderFromPath(folderPath);

      if (folder && folder instanceof Folder) {
        folder.insertNode(node);
        return folder;
      }
    }
    this.printCurrentFolder()

    return null;
  }

  setupAndFind = (nodeNameOrValidatorFunc, fromFolder, multiple) => {
    if (typeof nodeNameOrValidatorFunc === 'function') {
      return this.findNode(nodeNameOrValidatorFunc, fromFolder, multiple);
    }

    const func = (node) => node.name === nodeNameOrValidatorFunc;
    return this.findNode(func, fromFolder, multiple);
  }

  findNode = (isNode, folder, multiple = false) => {
    let match = multiple ? [] : null;
    let folderectories = [];

    for (const node of folder.content) {
      if (isNode(node)) {
        if (multiple) {
          match.push(node)
        } else {
          match = node;
          break;
        }
      }

      if (node instanceof Folder) {
        folderectories.push(node);
      }
    }

    if ((match === null || multiple) && folderectories.length) {
      for (const subFolder of folderectories) {
        const found = this.findNode(isNode, subFolder, multiple);
        if (multiple) {
          match.push(...found)
        } else if (found) {
          match = found;
          break;
        }
      }
    }

    return match;
  }

  getFolderFromPath = folderPath => {
    if (folderPath.match(/^(root\/?|\/)$/g)) {
      return this.root;
    }

    if (folderPath.match(/^\.\/?$/g)) {
      return this.currentFolder;
    }

    let folder = folderPath.match(/^(root\/?|\/)/g) ? this.root : this.currentFolder;
    const paths = folderPath.replace(/^(root\/|\.\/|\/)/g, '').split('/');

    while (paths.length) {
      folder = folder.getNode(paths.shift());

      if (!folder || !(folder instanceof Folder)) {
        return null
      }
    }

    if (paths.length === 0) {
      return folder;
    }

    return null;
  }
}
