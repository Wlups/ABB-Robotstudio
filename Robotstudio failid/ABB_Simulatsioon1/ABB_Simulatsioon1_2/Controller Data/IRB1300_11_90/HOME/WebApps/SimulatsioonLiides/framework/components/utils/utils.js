import {Component_A} from '../basic/as-component.js';

/**
 * Formats the options string into an array of option objects.
 * @param {Any} optionItems - The option items to be formatted.For example, `text1|value1`
 * @param {Func} errorCallback - The error handling function.
 * @param {String} componentName - The name of the target component.
 * @returns {Array<Object>} The formatted options array.
 */
export function formatOptionsString(optionItems, errorCallback, componentName) {
  if (optionItems) {
    try {
      var items = optionItems.split(';');
      return items.map((item) => {
        var kv = item.split('|');
        if (kv.length != 2) throw 'Invalid format';
        return {
          text: kv[0] ? Component_A.dynamicText(kv[0].replace(/^\n+/, '')) : '',
          value: kv[1],
        };
      });
    } catch (error) {
      errorCallback(error, componentName);
    }
  } else {
    return [];
  }
}

/**
 * Counts the number of decimal places in a given number.
 * @param {number} num - The number to be evaluated. For example, `123.456`.
 * @returns {number} The number of decimal places. Returns 0 if there are no decimal places.
 *
 * @example
 * // Returns 3
 * getDecimalPlaces(123.456);
 *
 * @example
 * // Returns 6
 * getDecimalPlaces(123.456789);
 *
 * @example
 * // Returns 0
 * getDecimalPlaces(123);
 */
export function getDecimalPlaces(n) {
  if (typeof n !== 'number') return 0;
  const numStr = n.toString();

  const decimalPointIndex = numStr.indexOf('.');

  if (decimalPointIndex === -1) {
    return 0;
  }

  return numStr.length - decimalPointIndex - 1;
}
