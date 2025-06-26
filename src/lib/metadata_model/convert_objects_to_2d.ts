import * as Json from '../json'
import { Extract2DFields, Reorder2DFields } from './2d_fields'
import {
	type IMetadataModel,
	FgProperties,
	IsGroupFieldsValid,
	IsGroupReadOrderOfFieldsValid,
	GroupCanBeProcessedAs2D,
	PreparePathToValueInObject
} from './metadata_model'

interface IFieldGroupConversion {
	field_group_key?: string
	field_group_sep_cols_max_values?: number
	field_join_symbol?: string
	field_groups?: IFieldGroupConversion[]
	group_read_order_of_fields?: string[]
}

/**
 *  Converts an object or array of objects into a 2D array following the metadata-model structure.
 *
 * @throws {Error}
 */
export class ConvertObjectsTo2DArray {
	private _array2D: any[][] = []
	private _skipIfFGDisabled: boolean = true
	private _skipIfDataExtraction: boolean = true
	private _flatten: boolean = true
	private _fgConversion: IFieldGroupConversion
	private _currentDatum: any
	private _reorder2DFields: Reorder2DFields | undefined

	get Array2D() {
		return this._array2D
	}

	ResetArray2D() {
		this._array2D = []
	}

	/**
	 * @throws {Error} if {@linkcode ConvertObjectsTo2DArray._initFgConversion} throws an error.
	 *
	 * @param metadatamodel
	 * @param skipIfFGDisabled Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default true
	 * @param skipIfDataExtraction Do not include field group if property {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION}($FG_SKIP_DATA_EXTRACTION) is true. Default true.
	 * @param flatten If true, ensures column values in rows are not an array and will be converted to a string if so. Default true.
	 */
	constructor(
		metadatamodel: any,
		target2DFields: any[] | undefined = undefined,
		skipIfFGDisabled: boolean = true,
		skipIfDataExtraction: boolean = true,
		flatten: boolean = true
	) {
		this._skipIfFGDisabled = skipIfFGDisabled
		this._skipIfDataExtraction = skipIfDataExtraction
		this._flatten = flatten
		try {
			this._fgConversion = this._initFgConversion(metadatamodel)

			let extract2DFields = new Extract2DFields(metadatamodel, skipIfFGDisabled, skipIfDataExtraction, true)
			extract2DFields.Extract()
			const dataFields = extract2DFields.FieldsWithSkippedRemoved

			if (Array.isArray(target2DFields)) {
				this._reorder2DFields = new Reorder2DFields(dataFields, target2DFields)
			} else {
				if (Object.keys(extract2DFields.RepositionFields).length > 0) {
					extract2DFields.Reposition()
					extract2DFields.RemoveSkipped()
					this._reorder2DFields = new Reorder2DFields(dataFields, extract2DFields.Fields)
				}
			}
		} catch (e) {
			throw e
		}
	}

	/**
	 * Recursive function that setups the necessary information required to convert objects to 2D array. Initializes {@linkcode ConvertObjectsTo2DArray._fgConversion}.
	 *
	 * @throws {Error} if {@linkcode mmGroup} is not valid.
	 *
	 * Will skip fields/groups if {@linkcode ConvertObjectsTo2DArray._skipIfDataExtraction} or {@linkcode ConvertObjectsTo2DArray._skipIfFGDisabled} is true and the corresponding properties are encountered.
	 *
	 * @param mmGroup Current metadata model Group to get conversion information.
	 * @returns
	 */
	private _initFgConversion(mmGroup: IMetadataModel | any) {
		const mmGroupFields = mmGroup[FgProperties.GROUP_FIELDS][0]
		if (!IsGroupFieldsValid(mmGroupFields)) {
			throw [this._initFgConversion.name, 'mmGroupFields is not an object', structuredClone(mmGroupFields)]
		}

		const mmGroupReadOrderOfFields = mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw [this._initFgConversion.name, 'mmGroupReadOrderOfFields is not an array', structuredClone(mmGroupReadOrderOfFields)]
		}

		let mmGroupsConversion: IFieldGroupConversion = {
			field_groups: []
		}

		for (const fgKey of mmGroupReadOrderOfFields) {
			if (!IsGroupFieldsValid(mmGroupFields[fgKey])) {
				throw [this._initFgConversion.name, `mmGroupFields[${fgKey}] is not an object`, structuredClone(mmGroupFields[fgKey])]
			}

			if (
				(this._skipIfDataExtraction && mmGroupFields[fgKey][FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) ||
				(this._skipIfFGDisabled && mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_DISABLE])
			)
				continue

			if (typeof mmGroupFields[fgKey][FgProperties.FIELD_GROUP_KEY] !== 'string') {
				throw [
					this._initFgConversion.name,
					`mmGroupFields[${fgKey}][${FgProperties.FIELD_GROUP_KEY}] is not a string`,
					mmGroupFields[fgKey][FgProperties.FIELD_GROUP_KEY]
				]
			}

			let newFieldGroupConversion: IFieldGroupConversion = {
				field_group_key: mmGroupFields[fgKey][FgProperties.FIELD_GROUP_KEY]
			}

			if (Array.isArray(mmGroupFields[fgKey][FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				newFieldGroupConversion.group_read_order_of_fields = mmGroupFields[fgKey][FgProperties.GROUP_READ_ORDER_OF_FIELDS]
				if (
					GroupCanBeProcessedAs2D(mmGroupFields[fgKey]) &&
					mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
					!Number.isNaN(mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
					mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 0
				) {
					newFieldGroupConversion.field_group_sep_cols_max_values = Number(
						mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
					)
				} else {
					newFieldGroupConversion.field_groups = this._initFgConversion(mmGroupFields[fgKey]).field_groups
				}
			} else {
				if (
					mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
					!Number.isNaN(mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
					mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 0
				) {
					newFieldGroupConversion.field_group_sep_cols_max_values = Number(
						mmGroupFields[fgKey][FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
					)
				}
			}

			if (
				typeof mmGroupFields[fgKey][FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL] == 'string' &&
				mmGroupFields[fgKey][FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL].length > 0
			) {
				newFieldGroupConversion.field_join_symbol = mmGroupFields[fgKey][FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL]
			}

			mmGroupsConversion.field_groups!.push(newFieldGroupConversion)
		}

		return mmGroupsConversion
	}

	/**
	 * Converts Data into a 2D array.
	 *
	 * @throws {Error} if:
	 * * {@linkcode data} is not valid.
	 * * {@linkcode ConvertObjectsTo2DArray._convert} throws an error.
	 *
	 * @param data Array of objects to convert.
	 */
	Convert(data: any[]) {
		if (!Array.isArray(data)) {
			throw [this.Convert.name, 'data is not an array']
		}

		for (let datum of data) {
			if (typeof datum !== 'object' || datum == null || Array.isArray(datum)) {
				throw [this.Convert.name, 'datum is not an object']
			}

			try {
				this._currentDatum = structuredClone(datum)

				let datum2DArray = this._convert([[]], this._fgConversion, [0])
				if (this._reorder2DFields instanceof Reorder2DFields) {
					this._reorder2DFields.Reorder(datum2DArray)
				}
				this._array2D = [...this._array2D, ...datum2DArray]

				this._currentDatum = {}
			} catch (e) {
				throw e
			}
		}
	}

	/**
	 * Recursive function that converts object into 2D array and returns it.
	 *
	 * @throws {Error} if {@linkcode gConversion} is not valid.
	 *
	 * @param datumObject2DArray current 2DArray to merge data into.
	 * @param gConversion current groupConversion information.
	 * @param arrayIndexes current array indexes of objects' data to replace {@linkcode ARRAY_INDEX_PLACEHOLDER} with.
	 * @returns
	 */
	private _convert(datumObject2DArray: any[][], gConversion: IFieldGroupConversion, arrayIndexes: number[]) {
		if (typeof gConversion.field_groups === 'undefined') {
			throw [this._convert.name, 'mmGroupConversion.field_groups is undefined']
		}

		for (const fgConversion of gConversion.field_groups) {
			if (typeof fgConversion.field_group_key !== 'string') {
				throw [this._convert.name, 'fgConversion.field_group_key is not a string']
			}

			const valueInObject = Json.GetValueInObject(this._currentDatum, PreparePathToValueInObject(fgConversion.field_group_key, arrayIndexes))

			if (Array.isArray(fgConversion.group_read_order_of_fields)) {
				if (typeof fgConversion.field_group_sep_cols_max_values === 'number' && fgConversion.field_group_sep_cols_max_values > 0) {
					let newValueInObject = new Array<any>(fgConversion.field_group_sep_cols_max_values * fgConversion.group_read_order_of_fields.length)

					if (Array.isArray(valueInObject) && valueInObject.length > 0) {
						let startIndexOfValueInObject = 0
						for (let vioIndex = 0; vioIndex < fgConversion.field_group_sep_cols_max_values; vioIndex++) {
							for (const fgKeySuffix of fgConversion.group_read_order_of_fields) {
								newValueInObject[startIndexOfValueInObject] = this._getNewFieldValueInObject(
									Json.GetValueInObject(valueInObject, `$.${vioIndex}.${fgKeySuffix}`),
									fgConversion.field_join_symbol || undefined
								)
								startIndexOfValueInObject += 1
							}
						}
					}

					datumObject2DArray = this._merge2DArrays(datumObject2DArray, [newValueInObject])
					continue
				}

				if (Array.isArray(valueInObject) && valueInObject.length > 0) {
					let new2DArray: any[][] = []
					for (let vioIndex = 0; vioIndex < valueInObject.length; vioIndex++) {
						new2DArray = [...structuredClone(new2DArray), ...this._convert(datumObject2DArray, fgConversion, [...arrayIndexes, vioIndex])]
					}
					datumObject2DArray = new2DArray
					continue
				}

				datumObject2DArray = this._convert(datumObject2DArray, fgConversion, [...arrayIndexes, 0])
				continue
			}

			if (typeof fgConversion.field_group_sep_cols_max_values === 'number' && fgConversion.field_group_sep_cols_max_values > 0) {
				let newValueInObject = new Array<any>(fgConversion.field_group_sep_cols_max_values)

				if (Array.isArray(valueInObject) && valueInObject.length > 0) {
					for (let vioIndex = 0; vioIndex < fgConversion.field_group_sep_cols_max_values; vioIndex++) {
						newValueInObject[vioIndex] = this._getNewFieldValueInObject(valueInObject[vioIndex], fgConversion.field_join_symbol || undefined)
					}
				}

				datumObject2DArray = this._merge2DArrays(datumObject2DArray, [newValueInObject])
				continue
			}

			datumObject2DArray = this._merge2DArrays(datumObject2DArray, [
				[this._getNewFieldValueInObject(valueInObject, fgConversion.field_join_symbol || undefined)]
			])
		}

		return datumObject2DArray
	}

	private _getNewFieldValueInObject(valueInObject: any, joinSymbol: string = ','): any {
		if (this._flatten) {
			if (Array.isArray(valueInObject)) {
				if (valueInObject.length > 1) {
					return valueInObject.reduce((accumulator, currentValue) => {
						return `${accumulator}${joinSymbol}${currentValue}`
					})
				}
				return valueInObject[0]
			}

			return valueInObject
		}

		if (typeof valueInObject === 'undefined') {
			return valueInObject
		}

		return Array.isArray(valueInObject) ? valueInObject : [valueInObject]
	}

	/**
	 * Merges {@linkcode rightArray} into {@linkcode leftArray}.
	 *
	 * For example, if size of {@linkcode leftArray} is 2 and size of {@linkcode rightArray} is 3, the new2Darray will have a size of 6 as each row of {@linkcode leftArray} will be merged with each row of {@linkcode rightArray}.
	 *
	 * @param leftArray Current row of data.
	 * @param rightArray Row of data to merge into {@linkcode leftArray}
	 * @returns
	 */
	private _merge2DArrays(leftArray: any[][], rightArray: any[][]) {
		let new2DArray: any[][] = []

		for (let l = 0; l < leftArray.length; l++) {
			for (let r = 0; r < rightArray.length; r++) {
				new2DArray = [...new2DArray, [...leftArray[l], ...rightArray[r]]]
			}
		}

		return new2DArray
	}
}
