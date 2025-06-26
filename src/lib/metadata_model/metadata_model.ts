export enum FilterConditionLogicalOperators {
	AND = 'AND',
	OR = 'OR',
	AND_NOT = 'AND NOT',
	OR_NOT = 'OR NOT'
}

export interface IDatabaseColumnFields {
	column_fields_read_order: string[]
	fields: { [key: string]: IMetadataModel }
}

export const EmptyMetadataModel = () =>
	structuredClone({
		[FgProperties.FIELD_GROUP_KEY]: '$',
		[FgProperties.FIELD_GROUP_NAME]: 'root',
		[FgProperties.FIELD_GROUP_DESCRIPTION]: 'group description',
		[FgProperties.FIELD_GROUP_MAX_ENTRIES]: 1,
		[FgProperties.GROUP_FIELDS]: [{}],
		[FgProperties.GROUP_READ_ORDER_OF_FIELDS]: []
	}) as IMetadataModel

export interface IMetadataModel {
	[FgProperties.FIELD_GROUP_KEY]: string
	[FgProperties.FIELD_GROUP_NAME]?: string
	[FgProperties.FIELD_GROUP_DESCRIPTION]?: string
	[FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]?: boolean
	[FgProperties.GROUP_VIEW_TABLE_IN_2D]?: boolean
	[FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX]?: boolean
	[FgProperties.FIELD_GROUP_IS_PRIMARY_KEY]?: boolean
	[FgProperties.FIELD_DATATYPE]?: FieldType
	[FgProperties.FIELD_UI]?: FieldUi
	[FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS]?: boolean
	[FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]?: number
	[FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]?: string
	[FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]?: number
	[FgProperties.FIELD_DATETIME_FORMAT]?: FieldDateTimeFormat
	[FgProperties.FIELD_SELECT_OPTIONS]?: ISelectOption[]
	[FgProperties.FIELD_PLACEHOLDER]?: string
	[FgProperties.FIELD_GROUP_MAX_ENTRIES]?: number
	[FgProperties.FIELD_DEFAULT_VALUE]?: any
	[FgProperties.FIELD_GROUP_INPUT_DISABLE]?: boolean
	[FgProperties.FIELD_GROUP_DISABLE_PROPERTIES_EDIT]?: boolean
	[FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE]?: IFieldCheckboxValue
	[FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE]?: IFieldCheckboxValue
	[FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_VIEW]?: boolean
	[FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE]?: boolean
	[FgProperties.FIELD_GROUP_VIEW_DISABLE]?: boolean
	[FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE]?: boolean
	[FgProperties.GROUP_EXTRACT_AS_SINGLE_FIELD]?: boolean

	[FgProperties.FIELD_TYPE_ANY]?: IFieldAny

	[FgProperties.GROUP_READ_ORDER_OF_FIELDS]?: string[]
	[FgProperties.GROUP_FIELDS]?: { [key: string]: IMetadataModel[] }[]

	[FgProperties.DATABASE_TABLE_COLLECTION_NAME]?: string
	[FgProperties.DATABASE_TABLE_COLLECTION_UID]?: string
	[FgProperties.DATABASE_FIELD_COLUMN_NAME]?: string
	[FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX]?: boolean
	[FgProperties.DATABASE_SKIP_DATA_EXTRACTION]?: boolean
	[FgProperties.FIELD_2D_VIEW_POSITION]?: I2DFieldViewPosition
}

export enum FieldType {
	TEXT = 'text',
	NUMBER = 'number',
	BOOLEAN = 'boolean',
	TIMESTAMP = 'timestamp',
	ANY = 'any'
}
export const FieldTypes = Object.values(FieldType)

export enum FieldUi {
	TEXT = 'text',
	TEXTAREA = 'textarea',
	NUMBER = 'number',
	CHECKBOX = 'checkbox',
	SELECT = 'select',
	DATETIME = 'datetime',
	GROUP = 'group'
}
export const FieldUis = Object.values(FieldUi)

export enum FieldDateTimeFormat {
	YYYYMMDDHHMM = 'yyyy-mm-dd hh:mm',
	YYYYMMDD = 'yyyy-mm-dd',
	YYYYMM = 'yyyy-mm',
	HHMM = 'hh:mm',
	YYYY = 'yyyy',
	MM = 'mm'
}
export const FieldDateTimeFormats = Object.values(FieldDateTimeFormat)

export const ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH = /\[\*\]/

export enum FSelectProperties {
	TYPE = '$TYPE',
	LABEL = '$LABEL',
	DATE_TIME_FORMAT = '$DATE_TIME_FORMAT',
	VALUE = '$VALUE'
}

export enum FSelectType {
	NUMBER = 'number',
	TEXT = 'text',
	BOOLEAN = 'boolean',
	SELECT = 'select'
}
export const FSelectTypes = Object.values(FSelectType)

export interface ISelectOption {
	[FSelectProperties.LABEL]?: string
	[FSelectProperties.TYPE]?: FSelectType
	[FSelectProperties.DATE_TIME_FORMAT]?: FieldDateTimeFormat
	[FSelectProperties.VALUE]?: any
}

export enum FieldCheckboxValueProperties {
	TYPE = '$TYPE',
	VALUE = '$VALUE'
}

export interface IFieldCheckboxValue {
	[FieldCheckboxValueProperties.TYPE]?: FieldType
	[FieldCheckboxValueProperties.VALUE]?: any
}

export enum FgProperties {
	FIELD_GROUP_KEY = '$FIELD_GROUP_KEY',
	FIELD_GROUP_NAME = '$FIELD_GROUP_NAME',
	FIELD_GROUP_DESCRIPTION = '$FIELD_GROUP_DESCRIPTION',
	FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN = '$FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN',
	GROUP_VIEW_TABLE_IN_2D = '$GROUP_VIEW_TABLE_IN_2D',
	GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX = '$GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX',
	FIELD_GROUP_IS_PRIMARY_KEY = '$FIELD_GROUP_IS_PRIMARY_KEY',
	FIELD_DATATYPE = '$FIELD_DATATYPE',
	FIELD_UI = '$FIELD_UI',
	FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS = '$FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS',
	FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS = '$FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS',
	FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT = '$FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT',
	FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX = '$FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX',
	FIELD_INPUT_PLACEHOLDER = '$FIELD_INPUT_PLACEHOLDER',
	FIELD_DATETIME_FORMAT = '$FIELD_DATETIME_FORMAT',
	FIELD_SELECT_OPTIONS = '$FIELD_SELECT_OPTIONS',
	FIELD_PLACEHOLDER = '$FIELD_PLACEHOLDER',
	FIELD_GROUP_MAX_ENTRIES = '$FIELD_GROUP_MAX_ENTRIES',
	FIELD_DEFAULT_VALUE = '$FIELD_DEFAULT_VALUE',
	FIELD_GROUP_INPUT_DISABLE = '$FIELD_GROUP_INPUT_DISABLE',
	FIELD_GROUP_DISABLE_PROPERTIES_EDIT = '$FIELD_GROUP_DISABLE_PROPERTIES_EDIT',
	DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX = '$DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX',
	FIELD_CHECKBOX_VALUE_IF_TRUE = '$FIELD_CHECKBOX_VALUE_IF_TRUE',
	FIELD_TYPE_ANY = '$FIELD_TYPE_ANY',
	FIELD_CHECKBOX_VALUE_IF_FALSE = '$FIELD_CHECKBOX_VALUE_IF_FALSE',
	FIELD_CHECKBOX_VALUES_USE_IN_VIEW = '$FIELD_CHECKBOX_VALUES_USE_IN_VIEW',
	FIELD_CHECKBOX_VALUES_USE_IN_STORAGE = '$FIELD_CHECKBOX_VALUES_USE_IN_STORAGE',
	FIELD_GROUP_VIEW_DISABLE = '$FIELD_GROUP_VIEW_DISABLE',
	FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE = '$FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE',
	GROUP_EXTRACT_AS_SINGLE_FIELD = '$GROUP_EXTRACT_AS_SINGLE_FIELD',
	GROUP_READ_ORDER_OF_FIELDS = '$GROUP_READ_ORDER_OF_FIELDS',
	GROUP_FIELDS = '$GROUP_FIELDS',
	DATABASE_SKIP_DATA_EXTRACTION = '$DATABASE_SKIP_DATA_EXTRACTION',
	DATABASE_TABLE_COLLECTION_UID = '$DATABASE_TABLE_COLLECTION_UID',
	DATABASE_TABLE_COLLECTION_NAME = '$DATABASE_TABLE_COLLECTION_NAME',
	DATABASE_JOIN_DEPTH = '$DATABASE_JOIN_DEPTH',
	DATABASE_FIELD_COLUMN_NAME = '$DATABASE_FIELD_COLUMN_NAME',
	DATABASE_SORT_BY_ASC = '$DATABASE_SORT_BY_ASC',
	DATABASE_LIMIT = '$DATABASE_LIMIT',
	DATABASE_OFFSET = '$DATABASE_OFFSET',
	DATABASE_DISTINCT = '$DATABASE_DISTINCT',
	DATUM_INPUT_VIEW = '$DATUM_INPUT_VIEW',
	FIELD_2D_VIEW_POSITION = '$FIELD_2D_VIEW_POSITION',
	FIELD_MULTIPLE_VALUES_JOIN_SYMBOL = '$FIELD_MULTIPLE_VALUES_JOIN_SYMBOL',
	FIELD_2D_DATA_REMOVE_EMPTY_VALUES = '$FIELD_2D_DATA_REMOVE_EMPTY_VALUES',
	
}

export interface IFieldAny {
	[FieldAnyProperties.METADATA_MODEL_ACTION_ID]: string
	[FieldAnyProperties.PICK_METADATA_MODEL_MESSAGE_PROMPT]?: string
	[FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]?: string
}

export enum FieldAnyProperties {
	METADATA_MODEL_ACTION_ID = '$METADATA_MODEL_ACTION_ID',
	PICK_METADATA_MODEL_MESSAGE_PROMPT = '$PICK_METADATA_MODEL_MESSAGE_PROMPT',
	GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT = '$GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT'
}

export type QueryConditions = { [key: string]: IQueryCondition }

export interface IQueryCondition {
	[QcProperties.D_TABLE_COLLECTION_UID]?: string
	[QcProperties.D_TABLE_COLLECTION_NAME]?: string
	[QcProperties.D_FIELD_COLUMN_NAME]?: string
	[QcProperties.FG_FILTER_CONDITION]?: IFilterCondition[][]
	[QcProperties.D_FULL_TEXT_SEARCH_QUERY]?: string
}

export enum QcProperties {
	FG_PROPERTY = '$FG_PROPERTY',
	D_TABLE_COLLECTION_UID = FgProperties.DATABASE_TABLE_COLLECTION_UID,
	D_TABLE_COLLECTION_NAME = FgProperties.DATABASE_TABLE_COLLECTION_NAME,
	D_FIELD_COLUMN_NAME = FgProperties.DATABASE_FIELD_COLUMN_NAME,
	FG_FILTER_CONDITION = '$FG_FILTER_CONDITION',
	D_FULL_TEXT_SEARCH_QUERY = '$D_FULL_TEXT_SEARCH_QUERY'
}

export interface IFilterCondition {
	[FConditionProperties.NEGATE]?: boolean
	[FConditionProperties.CONDITION]?: FilterCondition
	[FConditionProperties.DATE_TIME_FORMAT]?: FieldDateTimeFormat
	[FConditionProperties.VALUE]?: any[] | any
}

export interface IFConditionFilterEqualToValue {
	[FSelectProperties.TYPE]?: FSelectType
	[FSelectProperties.VALUE]?: any | any[]
}

export enum FConditionProperties {
	NEGATE = '$FILTER_NEGATE',
	CONDITION = '$FILTER_CONDITION',
	DATE_TIME_FORMAT = '$FILTER_DATE_TIME_FORMAT',
	VALUE = '$FILTER_VALUE'
}

export enum FilterCondition {
	NO_OF_ENTRIES_GREATER_THAN = 'NO_OF_ENTRIES_GREATER_THAN',
	NO_OF_ENTRIES_LESS_THAN = 'NO_OF_ENTRIES_LESS_THAN',
	NO_OF_ENTRIES_EQUAL_TO = 'NO_OF_ENTRIES_EQUAL_TO',
	NUMBER_GREATER_THAN = 'NUMBER_GREATER_THAN',
	NUMBER_LESS_THAN = 'NUMBER_LESS_THAN',
	TIMESTAMP_GREATER_THAN = 'TIMESTAMP_GREATER_THAN',
	TIMESTAMP_LESS_THAN = 'TIMESTAMP_LESS_THAN',
	EQUAL_TO = 'EQUAL_TO',
	TEXT_BEGINS_WITH = 'TEXT_BEGINS_WITH',
	TEXT_ENDS_WITH = 'TEXT_ENDS_WITH',
	TEXT_CONTAINS = 'TEXT_CONTAINS'
}

export enum Field2dPositionProperties {
	FIELD_GROUP_KEY = FgProperties.FIELD_GROUP_KEY,
	FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX = FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX,
	FIELD_POSITION_BEFORE = '$FIELD_POSITION_BEFORE'
}

export interface I2DFieldViewPosition {
	[Field2dPositionProperties.FIELD_GROUP_KEY]: string
	[Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]?: number
	[Field2dPositionProperties.FIELD_POSITION_BEFORE]?: boolean
}

export enum DView {
	TABLE = 'table',
	FORM = 'form'
}

export function GetNextDataInputView(currentView: DView) {
	switch (currentView) {
		case DView.TABLE:
			return DView.FORM
		default:
			return DView.TABLE
	}
}

export const ARRAY_INDEX_PLACEHOLDER = '[*]'

/**
 * Prepares the path to value in an object based on the metadata-model `$FG_KEY` property of a field in a group.
 *
 * @throws {Error} if:
 * * Number of array index placeholders in {@linkcode fieldgroupkey} being more than the number of array indexes in {@linkcode arrayplaceholderindexes}.
 * * {@linkcode arrayplaceholderindexes} not being an array of numbers ONLY.
 *
 * @param fieldgroupkey MUST begin with `$.$GROUP_FIELDS[*]`. Examples:
 * * `$.$GROUP_FIELDS[*].field_1`.
 * * `$.$GROUP_FIELDS[*].group_1.$GROUP_FIELDS[*].group_1_field`.
 *
 * @param arrayplaceholderindexes Replaces array index placeholder `[*]` found in {@linkcode fieldgroupkey}.
 *
 * Number of elements MUST match number of array index placeholders in {@linkcode fieldgroupkey}.
 * For example, with {@linkcode fieldgroupkey} like `$.$GROUP_FIELDS[*].group_1.$GROUP_FIELDS[*].group_1_field` the number of array indexes passed in {@linkcode arrayplaceholderindexes} MUST be 2.
 *
 * The first element is removed as it matches the first `$GROUP_FIELDS[*]` in the {@linkcode fieldgroupkey} which is removed from the path.
 * For example, {@linkcode fieldgroupkey} `$.$GROUP_FIELDS[*].group_1.$GROUP_FIELDS[*].group_1_field` will be trimmed to `$.group_1[*].group_1_field` before {@linkcode arrayplaceholderindexes} are added.
 *
 * @returns path to value in the object.
 */
export function PreparePathToValueInObject(fieldgroupkey: string, arrayplaceholderindexes: number[] = []): string {
	fieldgroupkey = fieldgroupkey.replace(/\.\$GROUP_FIELDS\[\*\]/, '')
	fieldgroupkey = fieldgroupkey.replace(new RegExp(GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
	arrayplaceholderindexes = arrayplaceholderindexes.slice(1)
	if (!Array.isArray(arrayplaceholderindexes)) {
		throw [PreparePathToValueInObject.name, 'argument groupindexes is not array']
	}
	for (let i = 0; i < arrayplaceholderindexes.length; i++) {
		if (Number.isNaN(arrayplaceholderindexes[i])) {
			throw [PreparePathToValueInObject.name, 'one or more group indexes is not a number']
		}
		fieldgroupkey = fieldgroupkey.replace(ARRAY_PATH_REGEX_SEARCH, `[${arrayplaceholderindexes[i]}]`)
	}
	if (fieldgroupkey.includes(ARRAY_INDEX_PLACEHOLDER)) {
		throw [
			PreparePathToValueInObject.name,
			`number of array index placeholders in argument path '${fieldgroupkey}' does not match number of indexes in '${arrayplaceholderindexes.join(',')}'`
		]
	}
	return fieldgroupkey
}

export function GroupCanBeProcessedAs2D(fieldgroup: any) {
	if (
		!Array.isArray(fieldgroup[FgProperties.GROUP_FIELDS]) ||
		typeof fieldgroup[FgProperties.GROUP_FIELDS][0] !== 'object' ||
		Array.isArray(fieldgroup[FgProperties.GROUP_FIELDS][0])
	) {
		return false
	}

	for (const fgValues of Object.values(fieldgroup[FgProperties.GROUP_FIELDS][0])) {
		if (Array.isArray((fgValues as any)[FgProperties.GROUP_FIELDS]) || Array.isArray((fgValues as any)[FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
			return false
		}
	}

	return true
}

export const ARRAY_PATH_REGEX_SEARCH = /\[\*\]/

export const GROUP_FIELDS_PATH_REGEX_SEARCH = /\$GROUP_FIELDS\[\*\](?:\.|)/

export const GROUP_FIELDS_REGEX_SEARCH = /(?:\.|)\$GROUP_FIELDS/

export const SPECIAL_CHARS_REGEX_SEARCH = /[^a-zA-Z0-9]+/

export const FieldGroupKeyPath = (fieldGroupKey: string) => fieldGroupKey.replace(/\.\$GROUP\_FIELDS\[\*\]\./g, '->')

export const FieldGroupDataJsonPath = (fieldGroupKey: string) =>
	fieldGroupKey.replace(new RegExp(GROUP_FIELDS_PATH_REGEX_SEARCH), '').replace(new RegExp(GROUP_FIELDS_REGEX_SEARCH, 'g'), '')

export interface I2DFields {
	fields: (IMetadataModel | any)[]
	reposition: { [key: number]: I2DFieldViewPosition }
}

export type RepositionFields = { [key: number]: I2DFieldViewPosition }

export const IsGroupFieldsValid = (gf: any) => typeof gf === 'object' && !Array.isArray(gf) && gf !== null
export const IsFieldGroupKeyValid = (fgKey: any) => typeof fgKey === 'string'
export const IsGroupReadOrderOfFieldsValid = (groofv: any) => typeof groofv === 'object' && Array.isArray(groofv)
export const IsGroupFieldAField = (fg: any) => typeof fg[FgProperties.FIELD_DATATYPE] === 'string' && typeof fg[FgProperties.FIELD_UI] === 'string'
export const IsGroupFieldContainsGroup = (fg: any) =>
	Array.isArray(fg[FgProperties.GROUP_FIELDS]) &&
	fg[FgProperties.GROUP_FIELDS].length > 0 &&
	Array.isArray(fg[FgProperties.GROUP_READ_ORDER_OF_FIELDS])
export const Is2DFieldViewPositionValid = (fg: any) =>
	typeof fg[FgProperties.FIELD_2D_VIEW_POSITION] === 'object' &&
	!Array.isArray(fg[FgProperties.FIELD_2D_VIEW_POSITION]) &&
	typeof fg[FgProperties.FIELD_2D_VIEW_POSITION][Field2dPositionProperties.FIELD_GROUP_KEY] === 'string'
export function GetFieldGroupName(fg: any, defaultValue: string = '#unnamed') {
	if (fg[FgProperties.FIELD_GROUP_NAME]) {
		return fg[FgProperties.FIELD_GROUP_NAME]
	}
	if (typeof fg[FgProperties.FIELD_GROUP_KEY] === 'string') {
		return (fg[FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()
	}

	return defaultValue
}

export const IsFieldGroupDescriptionPresent = (fg: any) =>
	typeof fg[FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && fg[FgProperties.FIELD_GROUP_DESCRIPTION].length > 0

export type Error = any[]
