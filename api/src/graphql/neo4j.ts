import neo4j from 'neo4j-driver'

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
export const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  ),
  {
    encrypted: "ENCRYPTION_OFF",
    // https://stackoverflow.com/questions/42645342/neo4j-return-an-integer-instead-of-high-0-low-10
    disableLosslessIntegers: true
  }
)