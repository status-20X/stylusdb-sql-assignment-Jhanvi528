const readCSV = require('../../src/csvReader')
const { parseQuery } = require('../../src/queryParser')
const executeSELECTQuery = require('../../src/index')

test('Parse SQL Query', () => {
  const query = 'SELECT id, name FROM student'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['id', 'name'],
    table: 'student',
    whereClauses: [],
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})
test('Parse SQL Query with WHERE Clause', () => {
  const query = 'SELECT id, name FROM student WHERE age = 25'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['id', 'name'],
    table: 'student',
    whereClauses: [
      {
        field: 'age',
        operator: '=',
        value: '25'
      }
    ],
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})
test('Parse SQL Query with Multiple WHERE Clauses', () => {
  const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['id', 'name'],
    table: 'student',
    whereClauses: [
      {
        field: 'age',
        operator: '=',
        value: '30'
      },
      {
        field: 'name',
        operator: '=',
        value: 'John'
      }
    ],
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})

test('Parse SQL Query with INNER JOIN', async () => {
  const query =
    'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id'
  const result = await parseQuery(query)
  expect(result).toEqual({
    fields: ['student.name', 'enrollment.course'],
    table: 'student',
    whereClauses: [],
    joinTable: 'enrollment',
    joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
    joinType: 'INNER'
  })
})

test('Parse SQL Query with INNER JOIN and WHERE Clause', async () => {
  const query =
    'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 20'
  const result = await parseQuery(query)
  expect(result).toEqual({
    fields: ['student.name', 'enrollment.course'],
    table: 'student',
    whereClauses: [{ field: 'student.age', operator: '>', value: '20' }],
    joinTable: 'enrollment',
    joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
    joinType: 'INNER'
  })
})

test('Parse COUNT Aggregate Query', () => {
  const query = 'SELECT COUNT(*) FROM student'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['COUNT(*)'],
    table: 'student',
    whereClauses: [],
    groupByFields: null,
    hasAggregateWithoutGroupBy: true,
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})

test('Parse SUM Aggregate Query', () => {
  const query = 'SELECT SUM(age) FROM student'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['SUM(age)'],
    table: 'student',
    whereClauses: [],
    groupByFields: null,
    hasAggregateWithoutGroupBy: true,
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})

test('Parse AVG Aggregate Query', () => {
  const query = 'SELECT AVG(age) FROM student'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['AVG(age)'],
    table: 'student',
    whereClauses: [],
    groupByFields: null,
    hasAggregateWithoutGroupBy: true,
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})

test('Parse MIN Aggregate Query', () => {
  const query = 'SELECT MIN(age) FROM student'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['MIN(age)'],
    table: 'student',
    whereClauses: [],
    groupByFields: null,
    hasAggregateWithoutGroupBy: true,
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})

test('Parse MAX Aggregate Query', () => {
  const query = 'SELECT MAX(age) FROM student'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['MAX(age)'],
    table: 'student',
    whereClauses: [],
    groupByFields: null,
    hasAggregateWithoutGroupBy: true,
    joinCondition: null,
    joinTable: null,
    joinType: null
  })
})

test('Parse basic GROUP BY query', () => {
  const query = 'SELECT age, COUNT(*) FROM student GROUP BY age'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['age', 'COUNT(*)'],
    table: 'student',
    whereClauses: [],
    groupByFields: ['age'],
    joinType: null,
    joinTable: null,
    joinCondition: null,
    hasAggregateWithoutGroupBy: false
  })
})

test('Parse GROUP BY query with WHERE clause', () => {
  const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['age', 'COUNT(*)'],
    table: 'student',
    whereClauses: [{ field: 'age', operator: '>', value: '22' }],
    groupByFields: ['age'],
    joinType: null,
    joinTable: null,
    joinCondition: null,
    hasAggregateWithoutGroupBy: false
  })
})

test('Parse GROUP BY query with multiple fields', () => {
  const query =
    'SELECT student_id, course, COUNT(*) FROM enrollment GROUP BY student_id, course'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['student_id', 'course', 'COUNT(*)'],
    table: 'enrollment',
    whereClauses: [],
    groupByFields: ['student_id', 'course'],
    joinType: null,
    joinTable: null,
    joinCondition: null,
    hasAggregateWithoutGroupBy: false
  })
})

test('Parse GROUP BY query with JOIN and WHERE clauses', () => {
  const query =
    'SELECT student.name, COUNT(*) FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE enrollment.course = "Mathematics" GROUP BY student.name'
  const parsed = parseQuery(query)
  expect(parsed).toEqual({
    fields: ['student.name', 'COUNT(*)'],
    table: 'student',
    whereClauses: [
      { field: 'enrollment.course', operator: '=', value: '"Mathematics"' }
    ],
    groupByFields: ['student.name'],
    joinType: 'INNER',
    joinTable: 'enrollment',
    joinCondition: {
      left: 'student.id',
      right: 'enrollment.student_id'
    },
    hasAggregateWithoutGroupBy: false
  })
})
