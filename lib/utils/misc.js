/**
 * Noop function that's used for type purposes to ensure the value is an empty object
 *
 * @template T
 * @param {T} _obj
 * @param {keyof T extends never ? true : false} _objShouldBeKeyLess
 * @returns {void}
 */
export function noopExpectTypeIsKeyLess (_obj, _objShouldBeKeyLess) {}
