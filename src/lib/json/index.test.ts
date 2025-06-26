import { expect, test, expectTypeOf } from 'vitest'
import { AreValuesEqual, DeleteValueInObject, ForEachValueInObject, GetValueInObject, SetValueInObject } from '.'

test('Tests are values equal, should run successfully.', () => {
	expect(AreValuesEqual([1, 2, 3], [1, 2, 3])).toBe(true)
	expect(AreValuesEqual(14, '14')).toBe(false)
	expect(
		AreValuesEqual({ one: 1, two: 2, three: 3, four: [{ one: 2, three: 45 }] }, { one: 1, two: 2, three: 3, four: [{ one: 2, three: 45 }] })
	).toBe(true)
	expect(
		AreValuesEqual({ one: 1, two: 2, three: 3, four: [{ one: 2, three: 45 }] }, { one: 1, three: 3, four: [{ three: 45, one: 2 }], two: 2 })
	).toBe(true)
	expect(
		AreValuesEqual({ one: 1, two: 2, three: 3, four: [{ one: 2, three: 45 }, null] }, { one: 1, three: 3, four: [{ three: 45, one: 2 }], two: 2 })
	).toBe(false)
	expect(
		AreValuesEqual({ one: 1, two: 2, three: 3, four: [{ one: 2, three: 45 }] }, { one: 1, three: 3, four: [{ three: 45, one: 2 }], two: 2, six: 6 })
	).toBe(false)
	expect(
		AreValuesEqual({ one: 1, two: 2, three: 3, four: [{ one: 2, three: 45 }] }, { one: 1, three: 3, four: [{ three: 45, one: 2 }], two: 2 }, true)
	).toBe(false)
})

test('Tests get, set, and delete value in object, expected to run successfully.', () => {
	let originalObject = {
		child: [
			null,
			{
				nectar: {
					willy: [
						null,
						null,
						null,
						null,
						null,
						[null, null, null, 'smitty'],
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						{
							oxford: 'willow',
							bee: [null, null, null, 5]
						}
					],
					two: [1, 2, 3, 4, 5]
				},
				mocha: {
					Nacho: 'cheese',
					Amount: 45.56
				}
			},
			null,
			null,
			'another child'
		]
	}

	let testObject = null

	let setValueTestData: [string, any][] = [
		['child.1.nectar.willy.15.oxford', 'willow'],
		['$.child[1].nectar.willy.[5][3]', 'smitty'],
		['child.4', 'another child'],
		['child.1.nectar.willy.15.bee[3]', 5],
		['$.child.1.nectar.two', [1, 2, 3, 4, 5]],
		['$.child.1.mocha', { Nacho: 'cheese', Amount: 45.56 }]
	]

	for (const value of setValueTestData) {
		testObject = SetValueInObject(testObject, value[0], value[1])
	}
	expectTypeOf(testObject).toBeObject
	expect(AreValuesEqual(testObject, originalObject)).toBe(true)

	let path = '$.child[1].nectar.willy[15].oxford'
	let value = GetValueInObject(testObject, path)
	expectTypeOf(value).toBeString
	expect(value).toBe('willow')

	path = 'child[1].nectar.willy[14].oxford'
	value = GetValueInObject(testObject, path)
	expect(value).toBeUndefined()

	path = 'child.1.nectar.willy.10'
	value = GetValueInObject(testObject, path)
	expect(value).toBeUndefined()

	path = '$.child'
	value = GetValueInObject(testObject, path)
	expectTypeOf(value).toBeArray

	path = '$.child[1]'
	value = GetValueInObject(testObject, path)
	expectTypeOf(value).toBeObject

	path = 'child.1.nectar.willy'
	value = GetValueInObject(testObject, path)
	expectTypeOf(value).toBeArray
	expect(value.length).toBe(16)

	path = '$.child[1].nectar.willy[13]'
	testObject = DeleteValueInObject(testObject, path)
	value = GetValueInObject(testObject, '$.child[1].nectar.willy')
	expectTypeOf(value).toBeArray
	expect(value.length).toBe(15)

	path = '$.child.1.mocha.Amount'
	testObject = DeleteValueInObject(testObject, path)
	value = GetValueInObject(testObject, '$.child.1.mocha')
	expectTypeOf(value).toBeObject
	expect(GetValueInObject(testObject, path)).toBeUndefined()
})

test('Test ForEachValueInObject, expected to run successfully.', () => {
	let originalObject = {
		child: [
			null,
			{
				nectar: {
					willy: [
						null,
						null,
						null,
						null,
						null,
						[null, null, null, 'smitty'],
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						{
							oxford: 'willow',
							bee: [null, null, null, 5]
						}
					],
					two: [1, 2, 3, 4, 5]
				},
				mocha: {
					Nacho: 'cheese',
					Amount: 45.56
				}
			},
			null,
			null,
			'another child'
		]
	}

	let path = '$.child[20].wind'
	expect(() => {
		ForEachValueInObject(originalObject, path, (_) => {
			throw 'did not expect value'
		})
	}).not.toThrowError()

	path = '$.child[1].nectar.two[*]'
	let counter = 1

	ForEachValueInObject(originalObject, path, (_, valueFound) => {
		expectTypeOf(valueFound).toBeNumber
		expect(valueFound).toBe(counter)
		counter += 1
		return false
	})
})
