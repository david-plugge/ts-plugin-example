import tsModule from 'typescript/lib/tsserverlibrary';
import { Context } from './types';

export function createContext(
	ts: typeof tsModule,
	info: tsModule.server.PluginCreateInfo,
): Context {
	return {
		ts,
		info,
		log: (message) => {
			info.project.projectService.logger.info('my-ts-plugin: ' + message);
		},
	};
}

export function removeStringQuotes(str: string): string {
	return str.replace(/^['"`]|['"`]$/g, '');
}

export function getSource(
	languageService: tsModule.LanguageService,
	fileName: string,
) {
	return languageService.getProgram()?.getSourceFile(fileName);
}

export function isPositionInsideNode(position: number, node: tsModule.Node) {
	const start = node.getFullStart();
	return start <= position && position <= node.getFullWidth() + start;
}

export const isDefaultFunctionExport = (
	ts: typeof tsModule,
	node: tsModule.Node,
): node is tsModule.FunctionDeclaration => {
	if (ts.isFunctionDeclaration(node)) {
		let hasExportKeyword = false;
		let hasDefaultKeyword = false;

		if (node.modifiers) {
			for (const modifier of node.modifiers) {
				if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
					hasExportKeyword = true;
				} else if (modifier.kind === ts.SyntaxKind.DefaultKeyword) {
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

export function isTyped(
	node: tsModule.VariableDeclaration | tsModule.FunctionDeclaration,
) {
	return node.type !== undefined;
}
