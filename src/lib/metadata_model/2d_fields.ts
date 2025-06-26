import {
	type IMetadataModel,
	type RepositionFields,
	IsGroupFieldsValid,
	FgProperties,
	IsGroupReadOrderOfFieldsValid,
	GroupCanBeProcessedAs2D,
	Is2DFieldViewPositionValid,
	ARRAY_PATH_REGEX_SEARCH,
	GetFieldGroupName,
	type I2DFields,
	Field2dPositionProperties
} from './metadata_model'

/**
 * Extracts fields that can be used for working with data in 2D array form like in excel or csv.
 *
 * Recommended order to Extract fields:
 * * {@linkcode Extract2DFields.Extract}
 * * {@linkcode Extract2DFields.Reposition}
 * * {@linkcode Extract2DFields.RemoveSkipped}
 * * {@linkcode Extract2DFields.Fields} to get currrent state of fields.
 */
export class Extract2DFields {
	private _fields: (IMetadataModel | any)[] = []
	private _skipIfFGDisabled: boolean = true
	private _skipIfDataExtraction: boolean = true
	private _removePrimaryKey: boolean = true
	private _metadataModel: any
	private _repositionFields: RepositionFields = {}
	private _databaseColumnNames: string[] | undefined = undefined

	/**
	 *
	 * @throws {Error} if {@linkcode metadatamodel} is not valid
	 *
	 * @param metadatamodel A valid metadata-model of type object (not array). Expected to presented as if converted from JSON.
	 * @param skipIfFGDisabled Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default true.
	 * @param skipIfDataExtraction Do not include field group if property {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION}($DATABASE_SKIP_DATA_EXTRACTION) is true. Default true.
	 * @param removePrimaryKey Remove field if {@linkcode skipIfFGDisabled} or {@linkcode skipIfDataExtraction} even if {@linkcode FgProperties.FIELD_GROUP_IS_PRIMARY_KEY} field property is true. Default true.
	 */
	constructor(
		metadatamodel: any,
		skipIfFGDisabled: boolean = true,
		skipIfDataExtraction: boolean = true,
		removePrimaryKey: boolean = true,
		databaseColumnNames: string[] | undefined = undefined
	) {
		if (!IsGroupFieldsValid(metadatamodel)) {
			throw [Extract2DFields.name, 'argument metadatamodel is not an object']
		}

		this._metadataModel = metadatamodel
		this._skipIfFGDisabled = skipIfFGDisabled
		this._skipIfDataExtraction = skipIfDataExtraction
		this._removePrimaryKey = removePrimaryKey
		this._databaseColumnNames = databaseColumnNames
	}

	/**
	 * Return information about fields that need to be repositioned based on {@linkcode FgProperties.FIELD_2D_VIEW_POSITION} when {@linkcode Extract2DFields.Extract} is called.
	 */
	get RepositionFields() {
		return this._repositionFields
	}

	/**
	 * Return {@linkcode this._fields} in its current state.
	 */
	get Fields() {
		return this._fields
	}

	/**
	 * Extracts fields found in {@linkcode mmGroup} and places them in {@linkcode Extract2DFields._fields}.
	 *
	 * @throws {Error} if {@linkcode Extract2DFields._extract} throws an error.
	 *
	 * Will not reposition fields based on {@linkcode FgProperties.FIELD_2D_VIEW_POSITION} field/group property. Call {@linkcode Extract2DFields.Reposition} after extraction.
	 *
	 * Will not remove any fields if {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION} or {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE} is true. Call {@linkcode Extract2DFields.RemoveSkipped} after extraction.
	 *
	 */
	Extract() {
		try {
			this._extract(this._metadataModel)
			if (Array.isArray(this._databaseColumnNames) && this._databaseColumnNames.length > 0) {
				let newFields: any[] = []
				for (const dbFieldColumnName of this._databaseColumnNames) {
					for (const field of this._fields) {
						if (dbFieldColumnName === field[FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
							newFields.push(field)
						}
					}
				}
				if (newFields.length === this._databaseColumnNames.length) {
					this._fields = newFields
				}
			}
		} catch (e) {
			throw e
		}
	}

	/**
	 * Recursive function that extracts fields found in {@linkcode mmGroup} and places them in {@linkcode Extract2DFields._fields}.
	 *
	 * Will not remove any fields if {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION} or {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE} is true.
	 *
	 * @throws {Error} if {@linkcode mmGroup} is not valid.
	 *
	 * @param mmGroup Current metadata model Group to extract fields from.
	 * @param mmGroupSkipDataExtraction Add {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION} property to child fields and groups of {@linkcode mmGroup} if true.
	 * @param mmGroupViewDisable Add {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE} property to child fields and groups of {@linkcode mmGroup} if true.
	 *
	 * mm - Alias for metadata model.
	 *
	 * fg - Alias for field group.
	 */
	private _extract(mmGroup: any, mmGroupSkipDataExtraction: boolean = false, mmGroupViewDisable: boolean = false) {
		if (typeof mmGroup !== 'object' || Array.isArray(mmGroup) || mmGroup === null) {
			throw [this._extract.name, 'currentMetadataModelGroup is not an object']
		}

		const mmGroupFields = mmGroup[FgProperties.GROUP_FIELDS][0]
		if (!IsGroupFieldsValid(mmGroupFields)) {
			throw [this._extract.name, `mmGroup${FgProperties.GROUP_FIELDS}[0] is not an object`, structuredClone(mmGroupFields)]
		}

		const mmGroupReadOrderOfFields = mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw [this._extract.name, `mmGroup${FgProperties.GROUP_READ_ORDER_OF_FIELDS} is not an array`, structuredClone(mmGroupReadOrderOfFields)]
		}

		for (const fgKeySuffix of mmGroupReadOrderOfFields) {
			if (!IsGroupFieldsValid(mmGroupFields[fgKeySuffix])) {
				throw [this._extract.name, `mmGroupFields[${fgKeySuffix}] is not an object`, structuredClone(mmGroupFields[fgKeySuffix])]
			}

			if (Array.isArray(mmGroupFields[fgKeySuffix][FgProperties.GROUP_FIELDS])) {
				const skipDataExtraction = mmGroupFields[fgKeySuffix][FgProperties.DATABASE_SKIP_DATA_EXTRACTION] || mmGroupSkipDataExtraction
				const viewDisable = mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_DISABLE] || mmGroupViewDisable

				if (mmGroupFields[fgKeySuffix][FgProperties.GROUP_EXTRACT_AS_SINGLE_FIELD]) {
					this._fields.push(structuredClone(mmGroupFields[fgKeySuffix]))
					continue
				}

				if (
					GroupCanBeProcessedAs2D(mmGroupFields[fgKeySuffix]) &&
					mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
					!Number.isNaN(mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
					mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 1
				) {
					const maxIndexOfValuesInObject = Number(mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS])
					for (let columnIndex = 0; columnIndex < maxIndexOfValuesInObject; columnIndex++) {
						for (let value of Object.values(mmGroupFields[fgKeySuffix][FgProperties.GROUP_FIELDS][0])) {
							let newField: any = structuredClone(value)

							this._updateSeparateColumnsField(newField, mmGroupSkipDataExtraction, mmGroupViewDisable, columnIndex)

							this._appendField(newField)
						}
					}
					continue
				}

				this._extract(mmGroupFields[fgKeySuffix], skipDataExtraction, viewDisable)
				continue
			}

			if (
				mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
				!Number.isNaN(mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
				mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 1
			) {
				const maxNoOfValuesInSeparateColumns = Number(mmGroupFields[fgKeySuffix][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS])

				for (let columnIndex = 0; columnIndex < maxNoOfValuesInSeparateColumns; columnIndex++) {
					let newField: any = structuredClone(mmGroupFields[fgKeySuffix])

					this._updateSeparateColumnsField(newField, mmGroupSkipDataExtraction, mmGroupViewDisable, columnIndex)

					this._appendField(newField)
				}

				continue
			}

			let newField: any = structuredClone(mmGroupFields[fgKeySuffix])

			if (Is2DFieldViewPositionValid(newField)) {
				this._repositionFields[this._fields.length] = newField[FgProperties.FIELD_2D_VIEW_POSITION]
			}

			if (mmGroupSkipDataExtraction) {
				newField[FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
			}

			if (mmGroupViewDisable) {
				newField[FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
			}

			this._appendField(newField)
		}
	}

	private _appendField(field: any) {
		if (Array.isArray(this._databaseColumnNames) && this._databaseColumnNames.length > 0) {
			if (
				typeof field[FgProperties.DATABASE_FIELD_COLUMN_NAME] === 'string' &&
				this._databaseColumnNames.includes(field[FgProperties.DATABASE_FIELD_COLUMN_NAME])
			) {
				this._fields.push(field)
			}
		} else {
			this._fields.push(field)
		}
	}

	private _updateSeparateColumnsField(fg: any, mmGroupSkipDataExtraction: boolean, mmGroupViewDisable: boolean, columnIndex: number) {
		fg[FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] = columnIndex

		if (mmGroupSkipDataExtraction) {
			fg[FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
		}

		if (mmGroupViewDisable) {
			fg[FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
		}

		fg[FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] = columnIndex
		if (fg[FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]) {
			fg[FgProperties.FIELD_GROUP_NAME] = (fg[FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] as string).replace(
				ARRAY_PATH_REGEX_SEARCH,
				`${columnIndex + 1}`
			)
		} else {
			fg[FgProperties.FIELD_GROUP_NAME] = `${GetFieldGroupName(fg)} ${columnIndex + 1}`
		}
	}

	/**
	 * Calls {@linkcode Reposition2DFields} and updates {@linkcode Extract2DFields._fields}.
	 */
	Reposition() {
		this._fields = Reposition2DFields({ fields: this._fields, reposition: this._repositionFields })
	}

	/**
	 * Returns result of calling {@linkcode Reposition2DFields}.
	 */
	get FieldsRepositioned() {
		return Reposition2DFields({ fields: this._fields, reposition: this._repositionFields })
	}

	/**
	 * Calls {@linkcode RemoveSkipped2DFields} and updates {@linkcode Extract2DFields._fields}.
	 */
	RemoveSkipped() {
		this._fields = RemoveSkipped2DFields(this._fields, this._skipIfFGDisabled, this._skipIfDataExtraction, this._removePrimaryKey)
	}

	/**
	 * Returns result of calling {@linkcode RemoveSkipped2DFields}.
	 */
	get FieldsWithSkippedRemoved() {
		return RemoveSkipped2DFields(this._fields, this._skipIfFGDisabled, this._skipIfDataExtraction, this._removePrimaryKey)
	}
}

/**
 * Reorder columns of each row in data to match order in targetFields.
 */
export class Reorder2DFields {
	private _sourceToTargetReadOrderOfFields: number[]
	private _targetToSourceReadOrderOfFields: number[]

	get SourceToTargetReadOrderOfFields() {
		return this._sourceToTargetReadOrderOfFields
	}

	get TargetToSourceReadOrderOfFields() {
		return this._targetToSourceReadOrderOfFields
	}

	/**
	 * Initializes Reorder2DFields.sourceToTargetReadOrderOfFields and Reorder2DFields.targetToSourceReadOrderOfFields.
	 * @param sourceFields Current order of columns in each row of data.
	 * @param targetFields Target order of columns in each row of data.
	 *
	 * @throws {Error} if:
	 * * length of {@linkcode data} (each row), {@linkcode sourceFields} and {@linkcode targetFields} do not match.
	 * * field in {@linkcode sourceFields} is missing in {@linkcode targetFields}.
	 * * fields in {@linkcode sourceFields} and {@linkcode targetFields} are not valid.
	 *
	 */
	constructor(sourceFields: any[], targetFields: any[]) {
		if (sourceFields.length !== targetFields.length) {
			throw [
				Reorder2DFields.name,
				`length of sourceFields(${sourceFields.length}) and targetFields(${targetFields.length}) are not equal`,
				structuredClone(sourceFields),
				structuredClone(targetFields)
			]
		}

		this._sourceToTargetReadOrderOfFields = []
		this._targetToSourceReadOrderOfFields = new Array(sourceFields.length)

		for (let tfIndex = 0; tfIndex < targetFields.length; tfIndex++) {
			let sourceIndex = -1

			for (let sfIndex = 0; sfIndex < sourceFields.length; sfIndex++) {
				if (
					typeof sourceFields[sfIndex][FgProperties.FIELD_GROUP_KEY] === 'string' &&
					sourceFields[sfIndex][FgProperties.FIELD_GROUP_KEY] === targetFields[tfIndex][FgProperties.FIELD_GROUP_KEY]
				) {
					if (
						typeof sourceFields[sfIndex][FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number' &&
						sourceFields[sfIndex][FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] !==
							targetFields[tfIndex][FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]
					) {
						continue
					}

					this._sourceToTargetReadOrderOfFields.push(sfIndex)
					sourceIndex = sfIndex
					break
				}
			}

			if (sourceIndex < 0) {
				throw [Reorder2DFields.name, 'targetField not found in sourceField', tfIndex, structuredClone(targetFields[tfIndex])]
			}

			this._targetToSourceReadOrderOfFields[sourceIndex] = tfIndex
		}
	}

	/**
	 * Reorder columns in each row in {@linkcode data}. Will modify order of columns in rows of original {@linkcode data} so deep copy may needed if original order is required.
	 *
	 * @throws {Error} if length of each row of {@linkcode data} does not match {@linkcode Reorder2DFields._sourceToTargetReadOrderOfFields}
	 *
	 * @param data Rows of data to reorder.
	 */
	Reorder(data: any[][]) {
		for (let dIndex = 0; dIndex < data.length; dIndex++) {
			if (data[dIndex].length !== this._sourceToTargetReadOrderOfFields.length) {
				throw [this.Reorder.name, `length of datum at index ${dIndex} and targetFields are not equal`, structuredClone(data[dIndex])]
			}

			let targetDatum = new Array(this._sourceToTargetReadOrderOfFields.length)

			for (let fIndex = 0; fIndex < this._sourceToTargetReadOrderOfFields.length; fIndex++) {
				targetDatum[fIndex] = structuredClone(data[dIndex][this._sourceToTargetReadOrderOfFields[fIndex]])
			}

			data[dIndex] = targetDatum
		}
	}
}

/**
 * Remove 2D fields if {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE} or {@linkcode FgProperties.FIELD_GROUP_SKIP_DATA_EXTRACTION} is true.
 * @param fields
 * @param skipIfFGDisabled Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default false.
 * @param skipIfDataExtraction Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_SKIP_DATA_EXTRACTION}($FG_SKIP_DATA_EXTRACTION) is true. Default false.
 * @param removePrimaryKey Remove field even if it is a primary key.
 * @returns
 */
export function RemoveSkipped2DFields(
	fields: any[],
	skipIfFGDisabled: boolean = false,
	skipIfDataExtraction: boolean = false,
	removePrimaryKey: boolean = false
) {
	return fields.filter((field) => {
		if (skipIfDataExtraction && field[FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) {
			if (field[FgProperties.FIELD_GROUP_IS_PRIMARY_KEY]) {
				if (!removePrimaryKey) {
					return true
				}
			}

			return false
		}

		if (skipIfFGDisabled && field[FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
			if (field[FgProperties.FIELD_GROUP_IS_PRIMARY_KEY]) {
				if (!removePrimaryKey) {
					return true
				}
			}
			return false
		}

		return true
	})
}

/**
 * Rearrange 2D fields based on fields with {@linkcode FgProperties.FIELD_2D_VIEW_POSITION} extracted during {@linkcode Extract2DFields}.
 *
 * @param fields2d
 * @returns Rearranged 2D fields.
 */
export function Reposition2DFields(fields2d: I2DFields) {
	let repositionedFields = structuredClone(fields2d.fields)

	for (const fieldIndex of Object.keys(fields2d.reposition)) {
		const sourceIndex = Number(fieldIndex)

		let destinationIndex = -1
		for (let fIndex = 0; fIndex < repositionedFields.length; fIndex++) {
			if (repositionedFields[fIndex][FgProperties.FIELD_GROUP_KEY] === fields2d.reposition[sourceIndex][Field2dPositionProperties.FIELD_GROUP_KEY]) {
				if (typeof fields2d.reposition[sourceIndex][Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
					if (
						repositionedFields[fIndex][FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] !==
						fields2d.reposition[sourceIndex][Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]
					) {
						continue
					}
				}

				if (fields2d.reposition[sourceIndex][Field2dPositionProperties.FIELD_POSITION_BEFORE]) {
					destinationIndex = fIndex
				} else {
					destinationIndex = fIndex + 1
				}
			}
		}

		if (destinationIndex >= 0) {
			const sourceCopy = structuredClone(repositionedFields[sourceIndex])
			repositionedFields = [...repositionedFields.slice(0, sourceIndex), ...repositionedFields.slice(sourceIndex + 1)]
			repositionedFields = [...repositionedFields.slice(0, destinationIndex), sourceCopy, ...repositionedFields.slice(destinationIndex)]
		}
	}

	return repositionedFields
}
