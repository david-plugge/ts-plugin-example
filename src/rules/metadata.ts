import { Context } from '../types';
import tsModule from 'typescript/lib/tsserverlibrary';
import { getSource } from '../utils';

const TYPE_ANOTATION = ': Metadata';
const TYPE_ANOTATION_ASYNC = ': Promise<Metadata>';
const TYPE_IMPORT = `\n\nimport type { Metadata } from 'next'`;

function updateVirtualFileWithType(
	{ ts, info }: Context,
	fileName: string,
	node: tsModule.VariableDeclaration | tsModule.FunctionDeclaration,
	isGenerateMetadata?: boolean,
) {
	const source = getSource(info.languageService, fileName);
	if (!source) return;

	// We annotate with the type in a virtual language service
	const sourceText = source.getFullText();
	let nodeEnd: number;
	let annotation: string;

	if (ts.isFunctionDeclaration(node)) {
		if (isGenerateMetadata) {
			nodeEnd = node.body!.getFullStart();
			const isAsync = node.modifiers?.some(
				(m) => m.kind === ts.SyntaxKind.AsyncKeyword,
			);
			annotation = isAsync ? TYPE_ANOTATION_ASYNC : TYPE_ANOTATION;
		} else {
			return;
		}
	} else {
		nodeEnd = node.name.getFullStart() + node.name.getFullWidth();
		annotation = TYPE_ANOTATION;
	}

	const newSource =
		sourceText.slice(0, nodeEnd) +
		annotation +
		sourceText.slice(nodeEnd) +
		TYPE_IMPORT;
	const { languageServiceHost } = getProxiedLanguageService();
	languageServiceHost.addFile(fileName, newSource);

	return [nodeEnd, annotation.length];
}
