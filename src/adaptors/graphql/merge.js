export default function merge(objA, objB) {
  const dst = { ...objA };
  for (const key in objB) {
    if (objB.hasOwnProperty(key)) {
      dst[key] = dst[key] || {};
      mergeOne(dst[key], objB[key]);
    }
  }
  return dst;
}

function mergeOne(objA, objB) {
  for (const key in objB) {
    if (!objB.hasOwnProperty(key)) {
      continue;
    }
    objA[key] = objB[key];
  }
}
