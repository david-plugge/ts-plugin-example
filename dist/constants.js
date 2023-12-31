"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_LAYOUT_PROPS = exports.ALLOWED_PAGE_PROPS = exports.DISALLOWED_SERVER_REACT_APIS = exports.LEGACY_CONFIG_EXPORT = exports.ALLOWED_EXPORTS = exports.NEXT_TS_ERRORS = void 0;
exports.NEXT_TS_ERRORS = {
    INVALID_SERVER_API: 71001,
    INVALID_ENTRY_EXPORT: 71002,
    INVALID_OPTION_VALUE: 71003,
    MISPLACED_CLIENT_ENTRY: 71004,
    INVALID_PAGE_PROP: 71005,
    INVALID_CONFIG_OPTION: 71006,
    INVALID_CLIENT_ENTRY_PROP: 71007,
    INVALID_METADATA_EXPORT: 71008,
    INVALID_ERROR_COMPONENT: 71009,
};
exports.ALLOWED_EXPORTS = [
    'config',
    'generateStaticParams',
    'metadata',
    'generateMetadata',
];
exports.LEGACY_CONFIG_EXPORT = 'config';
exports.DISALLOWED_SERVER_REACT_APIS = [
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useDeferredValue',
    'useImperativeHandle',
    'useInsertionEffect',
    'useReducer',
    'useRef',
    'useSyncExternalStore',
    'useTransition',
    'Component',
    'PureComponent',
    'createContext',
    'createFactory',
    'experimental_useOptimistic',
    'useOptimistic',
];
exports.ALLOWED_PAGE_PROPS = ['params', 'searchParams'];
exports.ALLOWED_LAYOUT_PROPS = ['params', 'children'];
