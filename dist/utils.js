"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefaultFunctionExport = exports.isPositionInsideNode = exports.getSource = exports.removeStringQuotes = exports.createContext = void 0;
function createContext(ts, info) {
    return {
        ts,
        info,
        log: (message) => {
            info.project.projectService.logger.info('my-ts-plugin: ' + message);
        },
    };
}
exports.createContext = createContext;
function removeStringQuotes(str) {
    return str.replace(/^['"`]|['"`]$/g, '');
}
exports.removeStringQuotes = removeStringQuotes;
function getSource(languageService, fileName) {
    return languageService.getProgram()?.getSourceFile(fileName);
}
exports.getSource = getSource;
function isPositionInsideNode(position, node) {
    const start = node.getFullStart();
    return start <= position && position <= node.getFullWidth() + start;
}
exports.isPositionInsideNode = isPositionInsideNode;
const isDefaultFunctionExport = (ts, node) => {
    if (ts.isFunctionDeclaration(node)) {
        let hasExportKeyword = false;
        let hasDefaultKeyword = false;
        if (node.modifiers) {
            for (const modifier of node.modifiers) {
                if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
                    hasExportKeyword = true;
                }
                else if (modifier.kind === ts.SyntaxKind.DefaultKeyword) {
                    hasDefaultKeyword = true;
                }
            }
        }
        // `export default function`
        if (hasExportKeyword && hasDefaultKeyword) {
            return true;
        }
    }
    return false;
};
exports.isDefaultFunctionExport = isDefaultFunctionExport;
