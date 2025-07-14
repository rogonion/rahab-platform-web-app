import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

interface data {
	directory_group_id?: string
	current_datum?: Domain.Entities.MetadataModel.IDatum
	theme?: Domain.Entities.Theme.Theme
}

export const load: PageServerLoad = async ({ locals, fetch, params, url }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	if (url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)) {
		url.searchParams.get(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID) || data.directory_group_id
	}

	let metadataModelSearch: Domain.Interfaces.MetadataModels.Search

	if (params.id && params.id.length >= 27) {
		const authContextDirectoryGroupID = url.searchParams.get(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID) || data.directory_group_id
		try {
			metadataModelSearch = new Interfaces.MetadataModels.SearchData(
				`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
				`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}${Domain.Entities.Url.MetadataModelSearchPath}`,
				fetch
			)

			await metadataModelSearch.FetchMetadataModel(authContextDirectoryGroupID || undefined, 1, undefined)
		} catch (e) {
			if (Array.isArray(e) && e.length === 2) {
				error(e[0], e[1])
			} else {
				console.error(e)
				error(500, `Get ${Domain.Entities.StorageFiles.RepositoryName} metadata-model failed`)
			}
		}

		const metadataModelIDQP = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			metadataModelSearch.searchmetadatamodel,
			Domain.Entities.StorageFiles.FieldColumn.ID,
			metadataModelSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
			metadataModelSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]
		)

		if (metadataModelIDQP) {
			let queryCondition: MetadataModel.QueryConditions[] = [
				{
					[metadataModelIDQP.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							metadataModelSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Domain.Entities.StorageFiles.FieldColumn.ID,
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: params.id
									}
								}
							]
						]
					}
				}
			]

			try {
				await metadataModelSearch.Search(
					queryCondition,
					authContextDirectoryGroupID,
					data.directory_group_id,
					1,
					false,
					false,
					undefined
				)
			} catch (e) {
				if (Array.isArray(e) && e.length === 2) {
					error(e[0], e[1])
				} else {
					console.error(e)
					error(500, `Search ${Domain.Entities.DirectoryGroups.RepositoryName} failed`)
				}
			}

			if (Array.isArray(metadataModelSearch.searchresults.data) && metadataModelSearch.searchresults.data.length === 1) {
				data.current_datum = {
					metadata_model: metadataModelSearch.searchmetadatamodel,
					datum: metadataModelSearch.searchresults.data[0]
				}

				return data
			} else {
				error(404, 'Not Found')
			}
		} else {
			error(500, `metadataModelIDQCKey not valid`)
		}
	}
}
