// @ts-check

import base from './.prettier/base.js'
import overrides from './.prettier/overrides.js'
import plugins from './.prettier/plugins.js'

/** @type {import('prettier').Config} */
export default {
    ...base,
    ...plugins,
    ...overrides,
}
