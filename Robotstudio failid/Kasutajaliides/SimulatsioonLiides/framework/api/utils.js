/**
 * Shallow compare does check for equality. When comparing scalar values (numbers, strings)
 * it compares their values. When comparing objects, it does not compare their attributes -
 * only their references are compared (e.g. "do they point to same object?").
 * @param {object} object1
 * @param {object} object2
 * @returns {boolean} true if objects are shallow equal
 * @private
 */
export function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}
