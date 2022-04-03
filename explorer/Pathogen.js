const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

function coroutine(generatorFunction) {
  return function(...args) {
    let generatorObject = generatorFunction(...args);

    generatorObject.next();
    return generatorObject;
  };
}

const getPath = (item) => {
  const collection = item.nodeType === 'folder' ? Store.folderMap : Store.fileMap
  const folderMap = Store.folderMap;

  let parentId = item.parentId
  let parent
  let path = item.name

  while (parentId !== null) {
    parent = folderMap.get(parentId)
    parentId = parent.parentId
    path = parent.name + '/' + path
  }

  return path
}



export class Pathogen {
  constructor(root) {
    this.currentPath = [{ name: 'init', isRoot: true }]
    this.currentFolder = currentPath[currentPath.length - 1]
    this.previousPath = []

  };

  getPath(item) {
    const collection = item.nodeType === 'folder' ? Store.folderMap : Store.fileMap
    const folderMap = Store.folderMap;

    let parentId = item.parentId
    let parent
    let path = item.name
    const p = this.currentPath
      .map((node, i) => {
        return node.name
      });
      
    while (parentId !== null) {
      parent = this.currentPath.get(parentId)
      parentId = parent.parentId
      path = parent.name + '/' + path
    }

    return path
  }
  get currentPath() { return this._currentPath };
  set currentPath(newValue) { this._currentPath = newValue };
}


const initializePathKeeper = () => {
  let p;

  const keepPath = coroutine(function*(receiver$) {
    let currentPath = [{ name: 'init', isRoot: true }]
    let currentFolder = currentPath[currentPath.length - 1]
    let previousPath = []

    try {
      while (true) {
        let newPath = yield;
        currentPath = newPath.split('/').join('/').replace('//', '/')
        receiver$.next(currentPath);
      }
    } finally {
      console.error('~LAST. in the FINALLY branch', currentPath);
      receiver$.return();
    }
  });

  return (receiver$) => {
    p = keepPath(receiver$);

    return {
      update: (value) => p.next(value),
      currentPath$: receiver$,
    }
  }
}

export default initializePathKeeper()
