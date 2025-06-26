export * as StorageFiles from './storage_files'
export * as Directory from './directory'
export * as DirectoryGroups from './directory_groups'
export * as MetadataModels from './metadata_models'
export * from './telemetry'

export interface Fetch {
	(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
	(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
}