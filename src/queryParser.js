function checkAggregateWithoutGroupBy (query, groupByFields) {
  const aggregateFunctionRegex =
    /(\bCOUNT\b|\bAVG\b|\bSUM\b|\bMIN\b|\bMAX\b)\s*\(\s*(\*|\w+)\s*\)/i
  return aggregateFunctionRegex.test(query) && !groupByFields
}

function parseQuery (query) {
  // First, let's trim the query to remove any leading/trailing whitespaces
  query = query.trim()

  // Initialize variables for different parts of the query
  let selectPart, fromPart

  // Split the query at the WHERE clause if it exists
  const whereSplit = query.split(/\sWHERE\s/i)
  query = whereSplit[0] // Everything before WHERE clause

  // WHERE clause is the second part after splitting, if it exists
  const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null

  // Split the remaining query at the JOIN clause if it exists
  const joinSplit = query.split(/\s(INNER|LEFT|RIGHT) JOIN\s/i)
  selectPart = joinSplit[0].trim() // Everything before JOIN clause

  // Parse the SELECT part
  const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i
  const selectMatch = selectPart.match(selectRegex)
  if (!selectMatch) {
    throw new Error('Invalid SELECT format')
  }
  const groupByRegex = /\sGROUP BY\s(.+)/i
  const groupByMatch = query.match(groupByRegex)

  let groupByFields = null
  if (groupByMatch) {
    groupByFields = groupByMatch[1].split(',').map(field => field.trim())
  }
  const hasAggregateWithoutGroupBy = checkAggregateWithoutGroupBy(query, groupByFields);
  const [, fields, table] = selectMatch

  const { joinType, joinTable, joinCondition } = parseJoinClause(query)

  // Parse the WHERE part if it exists
  let whereClauses = []
  if (whereClause) {
    whereClauses = parseWhereClause(whereClause)
  }

  return {
    fields: fields.split(',').map(field => field.trim()),
    table: table.trim(),
    whereClauses,
    joinType,
    joinTable,
    joinCondition,
    groupByFields,
    hasAggregateWithoutGroupBy
  }
}

function parseWhereClause (whereString) {
  const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/
  return whereString.split(/ AND | OR /i).map(conditionString => {
    const match = conditionString.match(conditionRegex)
    if (match) {
      const [, field, operator, value] = match
      return { field: field.trim(), operator, value: value.trim() }
    }
    throw new Error('Invalid WHERE clause format')
  })
}
function parseJoinClause (query) {
  const joinRegex =
    /\s(INNER|LEFT|RIGHT) JOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i
  const joinMatch = query.match(joinRegex)

  if (joinMatch) {
    return {
      joinType: joinMatch[1].trim(),
      joinTable: joinMatch[2].trim(),
      joinCondition: {
        left: joinMatch[3].trim(),
        right: joinMatch[4].trim()
      }
    }
  }

  return {
    joinType: null,
    joinTable: null,
    joinCondition: null
  }
}

module.exports = { parseQuery, parseJoinClause }
