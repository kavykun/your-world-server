const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const { ApolloEngine } = require('apollo-engine')
const resolvers = require('./resolvers')

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
  secret: process.env.PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
  debug: true, // log all GraphQL queries & mutations
});

const graphQLServer = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: prisma,
  }),
});

const port = parseInt(process.env.PORT, 10) || 4000;

const engine = new ApolloEngine({
  apiKey: process.env.APOLLO_ENGINE_API_KEY,
});

const httpServer = graphQLServer.createHttpServer({
  tracing: true,
  cacheControl: true,
});

engine.listen(
  {
    port,
    httpServer,
    graphqlPaths: ['/'],
  },
  () =>
    console.log(`Server with Apollo Engine is running on http://localhost:${port}`)
);
