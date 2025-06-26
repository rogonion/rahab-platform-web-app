import { Domain, Json, MetadataModel } from '$lib'

export function Datum(args: {
	customFetch?: Domain.Interfaces.Fetch
	fetchedData?: Domain.Entities.MetadataModel.IDatum
	telemetry?: Domain.Interfaces.ITelemetry
	directoryGroupID?: string
	currentDirectoryGroupID: string
	authContextDirectoryGroupID?: string
	verboseResponse?: boolean
	context?: string
}): Domain.Interfaces.StorageFiles.Datum {
	let d: Domain.Interfaces.StorageFiles.Datum = {
		context: args.context ? args.context : `${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} datum`,

		authcontextdirectorygroupid: args.authContextDirectoryGroupID,

		verboseresponse: args.verboseResponse || false,

		currentdirectorygroupid: args.currentDirectoryGroupID,

		fetch: args.customFetch ? args.customFetch : fetch,

		tags: [],
		updateTags(index, value) {
			if (typeof value === 'string') {
				if (value.length > 0) {
					if (index > this.tags.length - 1) {
						for (let i = this.tags.length; i <= index; i++) {
							this.tags.push('')
						}
					}
					this.tags[index] = value
				} else {
					this.deleteTags(index)
				}
			} else {
				this.deleteTags(index)
			}
		},
		deleteTags(index) {
			if (index < this.tags.length) {
				this.tags = this.tags.filter((_, tIndex) => tIndex !== index)
			}
		},

		viewAuthorized: true,

		viewUnauthorized: false,

		editAuthorized: false,

		editUnauthorized: false,

		reset() {
			this.tags = []
			this.editAuthorized = false
			this.editUnauthorized = false
			this.viewAuthorized = true
			this.viewUnauthorized = false
		},

		async update() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.StorageFiles.RepositoryName}`

			if (!this.id || !this.previousDatum) {
				throw undefined
			}

			let data: Domain.Entities.StorageFiles.Interface = {}

			if (!Json.AreValuesEqual([this.editAuthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).edit_authorized)) {
				data.edit_authorized = [this.editAuthorized]
			}

			if (!Json.AreValuesEqual([this.editUnauthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).edit_unauthorized)) {
				data.edit_unauthorized = [this.editUnauthorized]
			}

			if (!Json.AreValuesEqual([this.viewAuthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).view_authorized)) {
				data.view_authorized = [this.viewAuthorized]
			}

			if (!Json.AreValuesEqual([this.viewUnauthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).view_unauthorized)) {
				data.view_unauthorized = [this.viewUnauthorized]
			}

			if (!Json.AreValuesEqual(this.tags, (this.previousDatum as Domain.Entities.StorageFiles.Interface).tags)) {
				data.tags = this.tags
			}

			if (Object.keys(data).length === 0) {
				return {
					Type: Domain.Entities.Toast.Type.INFO,
					Message: 'No changes detected'
				}
			}

			data.id = [this.id]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}/${Domain.Entities.Url.Action.UPDATE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, this.currentdirectorygroupid)
				if (this.authcontextdirectorygroupid) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				}
				if (this.verboseresponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				this.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.UPDATE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await this.fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify([data])
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					if (fetchData.successful && fetchData.successful > 0 && !fetchData.failed) {
						if (!Json.AreValuesEqual([this.editAuthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).edit_authorized)) {
							;(this.previousDatum as Domain.Entities.StorageFiles.Interface).edit_authorized = [this.editAuthorized]
						}

						if (!Json.AreValuesEqual([this.editUnauthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).edit_unauthorized)) {
							;(this.previousDatum as Domain.Entities.StorageFiles.Interface).edit_unauthorized = [this.editUnauthorized]
						}

						if (!Json.AreValuesEqual([this.viewAuthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).view_authorized)) {
							;(this.previousDatum as Domain.Entities.StorageFiles.Interface).view_authorized = [this.viewAuthorized]
						}

						if (!Json.AreValuesEqual([this.viewUnauthorized], (this.previousDatum as Domain.Entities.StorageFiles.Interface).view_unauthorized)) {
							;(this.previousDatum as Domain.Entities.StorageFiles.Interface).view_unauthorized = [this.viewUnauthorized]
						}

						if (!Json.AreValuesEqual(this.tags, (this.previousDatum as Domain.Entities.StorageFiles.Interface).tags)) {
							;(this.previousDatum as Domain.Entities.StorageFiles.Interface).tags = this.tags
						}
					}

					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)

					return {
						Type: !fetchData.failed
							? Domain.Entities.Toast.Type.SUCCESS
							: fetchData.successful && fetchData.successful > 0
								? Domain.Entities.Toast.Type.INFO
								: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				} else {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
					return {
						Type: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				}
			} catch (e) {
				const ERROR = `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.StorageFiles.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async delete() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.StorageFiles.RepositoryName}`

			if (!this.id) {
				throw undefined
			}

			let data: Domain.Entities.StorageFiles.Interface = {
				id: [this.id]
			}
			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}/${Domain.Entities.Url.Action.DELETE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, this.currentdirectorygroupid)
				if (this.authcontextdirectorygroupid) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				}
				if (this.verboseresponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				this.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.DELETE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await this.fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify([data])
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)

					return {
						Type: !fetchData.failed
							? Domain.Entities.Toast.Type.SUCCESS
							: fetchData.successful && fetchData.successful > 0
								? Domain.Entities.Toast.Type.INFO
								: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				} else {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
					return {
						Type: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				}
			} catch (e) {
				const ERROR = `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.StorageFiles.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		}
	}

	if (args.fetchedData && args.fetchedData.metadata_model && args.fetchedData.datum) {
		const datum = args.fetchedData.datum
		const metadataModel = args.fetchedData.metadata_model
		const tableCollectionUID = metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]

		let value = undefined

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.StorageFiles.FieldColumn.ID, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.id = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.StorageFiles.FieldColumn.Tags, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.tags = value
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.StorageFiles.FieldColumn.ViewAuthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.viewAuthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.StorageFiles.FieldColumn.ViewUnauthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.viewUnauthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.StorageFiles.FieldColumn.EditAuthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.editAuthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.StorageFiles.FieldColumn.EditUnauthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.editUnauthorized = value[0]
		}
	}

	return d
}
