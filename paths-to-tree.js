let paths1 = [
  "About.vue",
  "Categories/Index.vue", "Categories/Demo.vue", "Categories/Flavors.vue", "Categories/Types/Index.vue", "Categories/Types/deeperTypes/deeeep.vue", "Categories/Types/deeperTypes/superDeeper/Index.vue", "Categories/Types/Other.vue"
];

export const pathsToTree = (paths) => {
  let result = [];
  let level = { result };

  paths.forEach(path => {
    path.split('/')
      .reduce((r, name, i, a) => {
        if (!r[name]) {
          r[name] = { result: [] };
          r.result.push({ name, children: r[name].result })
        }

        return r[name];
      }, level)
  })

  return result
}
