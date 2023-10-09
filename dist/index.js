"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("./rules/config");
const utils_1 = require("./utils");
const createTSPlugin = ({ typescript: ts, }) => {
    function create(info) {
        const context = (0, utils_1.createContext)(ts, info);
        context.log('Starting Next.js TypeScript plugin: ' +
            info.project.getCurrentDirectory());
        const proxy = Object.create(null);
        let k;
        for (k in info.languageService) {
            const x = info.languageService[k];
            proxy[k] = (...args) => x.apply(info.languageService, args);
        }
        // Auto completion
        proxy.getCompletionsAtPosition = (fileName, position, options, formattingSettings) => {
            let prior = info.languageService.getCompletionsAtPosition(fileName, position, options, formattingSettings) || {
                isGlobalCompletion: false,
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
                entries: [],
            };
            debugger;
            if (!/\+page\.(js|ts)/.test(node_path_1.default.basename(fileName))) {
                return prior;
            }
            config_1.config.addCompletionsAtPosition(context, fileName, position, prior);
            return prior;
        };
        proxy.getCompletionEntryDetails = (fileName, position, entryName, formatOptions, source, preferences, data) => {
            const entryCompletionEntryDetails = config_1.config.getCompletionEntryDetails(context, entryName, data);
            if (entryCompletionEntryDetails)
                return entryCompletionEntryDetails;
            return info.languageService.getCompletionEntryDetails(fileName, position, entryName, formatOptions, source, preferences, data);
        };
        proxy.getQuickInfoAtPosition = (fileName, position) => {
            const prior = info.languageService.getQuickInfoAtPosition(fileName, position);
            const overriden = config_1.config.getQuickInfoAtPosition(context, fileName, position);
            return overriden ?? prior;
        };
        proxy.getSemanticDiagnostics = (fileName) => {
            const prior = info.languageService.getSemanticDiagnostics(fileName);
            const source = (0, utils_1.getSource)(info.languageService, fileName);
            if (!source)
                return prior;
            ts.forEachChild(source, (node) => {
                if (ts.isImportDeclaration(node)) {
                    // import ...
                    // TODO: only allow client imports
                }
                else if (ts.isVariableStatement(node) &&
                    node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
                    // export const ...
                    const diagnostics = config_1.config.getSemanticDiagnosticsForExportVariableStatement(context, source, node);
                    prior.push(...diagnostics);
                }
                else if (ts.isFunctionDeclaration(node) &&
                    node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
                    // export function ...
                    // TODO: load function
                }
                else if ((0, utils_1.isDefaultFunctionExport)(ts, node)) {
                    // export default function ...
                }
                else if (ts.isExportDeclaration(node)) {
                    // export { ... }
                }
            });
            return prior;
        };
        return proxy;
    }
    return { create };
};
module.exports = createTSPlugin;
