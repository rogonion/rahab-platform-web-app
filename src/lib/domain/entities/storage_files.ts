export enum FieldColumn {
	ID = 'id',
	DirectoryGroupsID = 'directory_groups_id',
	DirectoryID = 'directory_id',
	StorageFileMimeType = 'storage_file_mime_type',
	OriginalName = 'original_name',
	Tags = 'tags',
	EditAuthorized = 'edit_authorized',
	EditUnauthorized = 'edit_unauthorized',
	ViewAuthorized = 'view_authorized',
	ViewUnauthorized = 'view_unauthorized',
	SizeInBytes = 'size_in_bytes',
	CreatedOn = 'created_on',
	LastUpdatedOn = 'last_updated_on',
	DeactivatedOn = 'deactivated_on',
	FullTextSearch = 'full_text_search'
}

export const RepositoryName = 'storage_files'

export interface Interface {
	id?: string[]
	directory_groups_id?: string[]
	directory_id?: string[]
	storage_file_mime_type?: string[]
	original_name?: string[]
	tags?: string[]
	edit_authorized?: boolean[]
	edit_unauthorized?: boolean[]
	view_authorized?: boolean[]
	view_unauthorized?: boolean[]
	size_in_bytes?: number[]
	created_on?: string[]
	last_updated_on?: string[]
	deactivated_on?: string[]
	full_text_search?: string[]
}
