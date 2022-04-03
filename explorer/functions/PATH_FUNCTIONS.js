
const buildLookupTable = (collectionMap, fieldName) => {
  return [...collectionMap.entries()].reduce(
    (table, [k, v], i, coll) => {
      let parentId = v.parentId
      let parent
      let path = v.name

      while (parentId !== null) {
        parent = Store.folderMap.get(parentId)
        parentId = parent.parentId
        path = parent.name + '/' + path
      }

      return table.set(path, k)
      return table
    }, new Map());
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

const folderNameTable = buildLookupTable(Store.folderMap, 'name')

const music2WorkOn = Store.folder('ql327yhsyidgakxnykw')

music2WorkOn.path = getPath(music2WorkOn)
