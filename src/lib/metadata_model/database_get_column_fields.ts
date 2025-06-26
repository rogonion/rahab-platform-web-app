import { type IMetadataModel, type IDatabaseColumnFields, IsGroupFieldsValid, FgProperties, IsGroupReadOrderOfFieldsValid } from './metadata_model'

/**
 * Extracts database fields from {@linkcode metadatamodel} if {@linkcode tableCollectionUID} matches.
 *
 * Throws an error if {@linkcode metadatamodel} or {@linkcode tableCollectionName} is not valid.
 *
 * Will not add field if {@linkcode FgProperties.DATABASE_FIELD_COLUMN_NAME} is not found or duplicate is detected.
 *
 * @param metadatamodel Expected to be presented as if converted from JSON.
 * @param tableCollectionName Extract only fields whose {@linkcode FgProperties.DATABASE_TABLE_COLLECTION_NAME} match this value.
 * @param tableCollectionUID Extract only fields whose {@linkcode FgProperties.DATABASE_TABLE_COLLECTION_UID} match this value.
 * @param skipIfFGDisabled Do not include field if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE} is true. Default false.
 * @param skipIfDataExtraction Do not include field if property {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION} is true. Default false.
 * @returns Database column fields with their properties as well as their read order.DatabaseSetFieldValue
 */
export function DatabaseGetColumnFields(
	metadatamodel: IMetadataModel | any,
	tableCollectionUID: string,
	skipIfFGDisabled: boolean = false,
	skipIfDataExtraction: boolean = false
): IDatabaseColumnFields {
	if (typeof tableCollectionUID !== 'string') {
		throw 'argument tableCollectionUID is not a string.'
	}

	try {
		let x = new _(tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
		x.GetDatabaseColumnFields(metadatamodel)
		return x.DatabaseColumnFields
	} catch (e) {
		throw e
	}
}

class _ {
	private _databaseColumnFields: IDatabaseColumnFields = {
		column_fields_read_order: [],
		fields: {}
	}
	private _tableCollectionUID: string
	private _skipIfFGDisabled: boolean = true
	private _skipIfDataExtraction: boolean = true

	constructor(tableCollectionUID: string, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
		this._tableCollectionUID = tableCollectionUID
		this._skipIfFGDisabled = skipIfFGDisabled
		this._skipIfDataExtraction = skipIfDataExtraction
	}

	get DatabaseColumnFields() {
		return this._databaseColumnFields
	}

	/**
	 *
	 * @param mmGroup Current Metadata Model Group
	 *
	 * mm - Alias for metadata model
	 *
	 * fg - Alias for field group
	 */
	GetDatabaseColumnFields(mmGroup: IMetadataModel | any) {
		if (!IsGroupFieldsValid(mmGroup)) {
			throw `${this.GetDatabaseColumnFields.name}: argument mmGroup is not an object.`
		}

		const mmGroupFields = mmGroup[FgProperties.GROUP_FIELDS][0]
		if (!IsGroupFieldsValid(mmGroupFields)) {
			throw `${this.GetDatabaseColumnFields.name}: argument mmGroup ${FgProperties.GROUP_FIELDS}[0] is not an object.`
		}

		const mmGroupReadOrderOfFields = mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw `${this.GetDatabaseColumnFields.name}: argument mmGroup ${FgProperties.GROUP_READ_ORDER_OF_FIELDS} is not an array.`
		}

		for (const fgKey of mmGroupReadOrderOfFields) {
			if (!IsGroupFieldsValid(mmGroupFields[fgKey])) {
				continue
			}

			if (
				(this._skipIfDataExtraction && mmGroupFields[fgKey][FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) ||
				(this._skipIfFGDisabled && mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_DISABLE])
			) {
				continue
			}

			if (typeof mmGroupFields[fgKey][FgProperties.FIELD_GROUP_KEY] !== 'string') {
				continue
			}

			if (
				Array.isArray(mmGroupFields[fgKey][FgProperties.GROUP_FIELDS]) &&
				typeof mmGroupFields[fgKey][FgProperties.DATABASE_FIELD_COLUMN_NAME] === 'undefined' &&
				!mmGroupFields[fgKey][FgProperties.GROUP_EXTRACT_AS_SINGLE_FIELD]
			) {
				this.GetDatabaseColumnFields(mmGroupFields[fgKey])
				continue
			}

			if (
				typeof mmGroupFields[fgKey][FgProperties.DATABASE_TABLE_COLLECTION_UID] !== 'string' ||
				mmGroupFields[fgKey][FgProperties.DATABASE_TABLE_COLLECTION_UID] !== this._tableCollectionUID
			) {
				continue
			}

			const fieldColumnName = mmGroupFields[fgKey][FgProperties.DATABASE_FIELD_COLUMN_NAME]
			if (typeof fieldColumnName !== 'string' || fieldColumnName.length === 0) {
				console.error(`field column name for key ${fgKey} not found or empty!`, structuredClone(mmGroupFields[fgKey]))
				continue
			}

			if (typeof this._databaseColumnFields.fields[fieldColumnName] === 'object') {
				console.error(
					`duplicate field column name ${fieldColumnName} detected!`,
					structuredClone(this._databaseColumnFields),
					structuredClone(mmGroup)
				)
				continue
			}

			this._databaseColumnFields.column_fields_read_order.push(fieldColumnName)
			this._databaseColumnFields.fields[fieldColumnName] = structuredClone(mmGroupFields[fgKey])
		}
	}
}
