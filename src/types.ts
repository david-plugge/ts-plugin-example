import tsModule from 'typescript/lib/tsserverlibrary';

export interface Context {
	ts: typeof tsModule;
	info: tsModule.server.PluginCreateInfo;
	log(message: string): void;
}
