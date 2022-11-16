import { mergeTypeDefs, mergeSchemas, mergeResolvers } from '@graphql-tools/merge'
import { KeycloakTypeDefs, KeycloakSchemaDirectives } from 'keycloak-connect-graphql'
import { loadFilesSync } from '@graphql-tools/load-files'
import path from 'path'
import { GraphQLUpload } from 'graphql-upload'
import {Neo4jGraphQL} from '@neo4j/graphql'

// Load type defs and resolvers
const autoTypeDefs = loadFilesSync(path.join(__dirname, './typeDefinitions'), { extensions: ['graphql'] })
const customResolvers = loadFilesSync(path.join(__dirname, './resolvers'))

// Export for neo4j OGM
export const typeDefs = mergeTypeDefs([... autoTypeDefs, KeycloakTypeDefs, ])

const neo4jSchema = new Neo4jGraphQL({
    typeDefs: mergeTypeDefs([... autoTypeDefs, KeycloakTypeDefs ]),
    resolvers: mergeResolvers([... customResolvers, {Upload: GraphQLUpload}]),
    schemaDirectives: KeycloakSchemaDirectives,
    logger: {log: e => console.log(e)},
    // config: {
    //     jwt: {
    //         // rolesPath: "jwt.roles"
    //         rolesPath: "jwt.realm_access.roles"
    //     }
    // }
})

export const schema = neo4jSchema.schema