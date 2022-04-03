// const { iif, ReplaySubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
// const { throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;
// const { fromFetch } = rxjs.fetch;
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { date, array, utils, text } = ham;
import { CollapsibleNode } from './CollapsibleNode.component.js'

const fs = {
  clear() {
    self.innerHTML = ''
  },
  self: document.querySelector('#file-system')
}
// fs.cear()


let depthsArray = [[2, 4], [1, 5], [3, 1, 2]]

const spam = (root, n = 1, trees = [2, 1, 3, 5]) => {
  trees.forEach((tree, rootIndex) => {
    const treeNode = root.createNode({
      name: `Tree ${rootIndex + 1}`,
      nodeType: 'folder',
      isRoot: false,
      id: `Tree ${rootIndex + 1}`,
    })

    tree.forEach((depth, subTreeIndex) => {
      let depthCount = 0;

      const sub = treeNode.createNode({
        name: `Subtree ${subTreeIndex + 1}`,
        nodeType: 'folder',
        isRoot: false,
        id: `${treeNode.name} - Subtree ${subTreeIndex + 1}`,
      })

      while (depthCount < depth) {
        const depth = sub.createNode({
          name: `Child ${depthCount + 1}`,
          nodeType: 'folder',
          isRoot: false,
          id: `${sub.name} - Child ${depthCount + 1}`,
        })
        depthCount++;
      }
    });
  });
}

const rootNode = new CollapsibleNode({
  isRoot: true,
  id: utils.uuid(),
  nodeType: 'folder',
  name: 'root',
  children: [],
  nodes: [],
}, null);

export const generateTree = (parent, config) => {
  spam(rootNode, 2, depthsArray)
return  rootNode
  // parent.appendChild(rootNode.self)

}
