import db from './firebase.js'
export const firestoreBatchUpdate = async (collectionName, data, updateFn = (doc) => {return doc}) => {
  if (!collectionName) return;
  console.log('(collectionName, data) => {', (collectionName, data))
  let batchCount = Math.round(data.length / 500)
  let batchCursor = 1
  let cursor = 0

  console.log('START BATCHES');
  console.log(`batchCount , batchCursor, cursor`);
  console.table([batchCount, batchCursor, cursor])
  console.log({ db });
  while (batchCursor <= batchCount && cursor < data.length) {
    // console.log(' collction', collection)

    const batch = db.batch();

    console.log('NEW BATCH')
    console.log(`batchCount , batchCursor, cursor`);
    console.table([batchCount, batchCursor, cursor])

    while (cursor < (batchCursor * 500) && cursor < data.length) {
      const item = data[cursor];
      const updatedItem = updateFn(item)
      const res = await db.collection(collectionName)
        .doc(item.id).set(updatedItem);


      ++cursor
    }
    ++batchCursor;
    await batch.commit()
  }

  console.log('END BATCHES');
  console.log(`batchCount , batchCursor, cursor`);
  console.table([batchCount, batchCursor, cursor])
  console.timeEnd('batches')
}

export const batchToFirestore = async (collectionName, data) => {
  if (!collectionName) return;
  console.log('(collectionName, data) => {', (collectionName, data))
  let batchCount = Math.round(data.length / 500)
  let batchCursor = 1
  let cursor = 0

  console.log('START BATCHES');
  console.log(`batchCount , batchCursor, cursor`);
  console.table([batchCount, batchCursor, cursor])
  console.log({ db });
  while (batchCursor <= batchCount && cursor < data.length) {
    // console.log(' collction', collection)

    const batch = db.batch();

    console.log('NEW BATCH')
    console.log(`batchCount , batchCursor, cursor`);
    console.table([batchCount, batchCursor, cursor])

    while (cursor < (batchCursor * 500) && cursor < data.length) {
      const item = data[cursor];
      const res = await db.collection(collectionName)
        .doc(item.id).set(item);


      ++cursor
    }
    ++batchCursor;
    await batch.commit()
  }

  console.log('END BATCHES');
  console.log(`batchCount , batchCursor, cursor`);
  console.table([batchCount, batchCursor, cursor])
  console.timeEnd('batches')
}







// // db.collection(collectionName).doc(inputPun).set({
// //   Category: inputCategory,
// //   PunText: inputText
// // })


// // Get a new write batch

// // Set the value of 'NYC'
// const nycRef = doc(db, "cities", "NYC");
// batch.set(nycRef, { name: "New York City" });

// // Update the population of 'SF'
// const sfRef = doc(db, "cities", "SF");
// batch.update(sfRef, { "population": 1000000 });

// // Delete the city 'LA'
// const laRef = doc(db, "cities", "LA");
// batch.delete(laRef);

// // Commit the batch
// await batch.commit();
