import tsModule from 'typescript/lib/tsserverlibrary';
import path from 'node:path';
import { config } from './rules/config';
import {
	createContext,
	getSource,
	isDefaultFunctionExport,
	isPositionInsideNode,
	isTyped,
} from './utils';
import { Context } from 'node:vm';

const createTSPlugin: tsModule.server.PluginModuleFactory = ({
	typescript: ts,
}) => {
	function create(info: tsModule.server.PluginCreateInfo) {
		const context = createContext(ts, info);

		context.log(
			'Starting Next.js TypeScript plugin: ' +
				info.project.getCurrentDirectory(),
		);

		const proxy: tsModule.LanguageService = Object.create(null);

		let k: keyof tsModule.LanguageService;
		for (k in info.languageService) {
			const x: any = info.languageService[k];
			proxy[k] = (...args: unknown[]) => x.apply(info.languageService, args);
		}

		// Auto completion
		proxy.getCompletionsAtPosition = (
			fileName,
			position,
			options,
			formattingSettings,
		) => {
			let prior = info.languageService.getCompletionsAtPosition(
				fileName,
				position,
				options,
				formattingSettings,
			) || {
				isGlobalCompletion: false,
				isMemberCompletion: false,
				isNewIdentifierLocation: false,
				entries: [],
			};

			debugger;

			if (!/\+page\.(js|ts)/.test(path.basename(fileName))) {
				return prior;
			}

			config.addCompletionsAtPosition(context, fileName, position, prior);

			return prior;
		};

		proxy.getCompletionEntryDetails = (
			fileName,
			position,
			entryName,
			formatOptions,
			source,
			preferences,
			data,
		) => {
			const entryCompletionEntryDetails = config.getCompletionEntryDetails(
				context,
				entryName,
				data,
			);
			if (entryCompletionEntryDetails) return entryCompletionEntryDetails;

			return info.languageService.getCompletionEntryDetails(
				fileName,
				position,
				entryName,
				formatOptions,
				source,
				preferences,
				data,
			);
		};

		proxy.getQuickInfoAtPosition = (fileName, position) => {
			const prior = info.languageService.getQuickInfoAtPosition(
				fileName,
				position,
			);

			const overriden = config.getQuickInfoAtPosition(
				context,
				fileName,
				position,
			);

			return overriden ?? prior;
		};

		proxy.getSemanticDiagnostics = (fileName) => {
			const prior = info.languageService.getSemanticDiagnostics(fileName);
			const source = getSource(info.languageService, fileName);
			if (!source) return prior;

			ts.forEachChild(source, (node) => {
				if (ts.isImportDeclaration(node)) {
					// import ...
					// TODO: only allow client imports
				} else if (
					ts.isVariableStatement(node) &&
					node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
				) {
					// export const ...
					const diagnostics =
						config.getSemanticDiagnosticsForExportVariableStatement(
							context,
							source,
							node,
						);
					prior.push(...diagnostics);
				} else if (
					ts.isFunctionDeclaration(node) &&
					node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
				) {
					// export function ...
					// TODO: load function
				} else if (isDefaultFunctionExport(ts, node)) {
					// export default function ...
				} else if (ts.isExportDeclaration(node)) {
					// export { ... }
				}
			});

			return prior;
		};

		proxy.getDefinitionAndBoundSpan = (fileName, position) => {
			const source = getSource(info.languageService, fileName);

			if (source) {
				const res = ts.forEachChild<tsModule.DefinitionInfoAndBoundSpan | void>(
					source,
					(node) => {
						if (isPositionInsideNode(position, node)) {
							if (
								ts.isVariableStatement(node) &&
								node.modifiers?.some(
									(m) => m.kind === ts.SyntaxKind.ExportKeyword,
								) &&
								ts.isVariableDeclarationList(node.declarationList)
							) {
								for (const declaration of node.declarationList.declarations) {
									if (
										isPositionInsideNode(position, declaration) &&
										declaration.name.getText() === 'metadata'
									) {
										const metadataExport = declaration;

										if (isTyped(metadataExport)) return;
									}
								}
							}
						}
					},
				);

				if (res) {
					return res;
				}
			}

			return info.languageService.getDefinitionAndBoundSpan(fileName, position);
		};

		return proxy;
	}

	return { create };
};

export = createTSPlugin;
