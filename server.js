// Import and configure environment variables
import dotenv from 'dotenv'
dotenv.config()

// Import Express server
import express from 'express'
const app = express()
// import path from 'path'
// import url from 'url'
// const { fileURLToPath } = url

// Import HTTP server
import http from 'http'
const { createServer } = http

// Import Apollo GraphQL server
import pkg from 'apollo-server-express'
const { ApolloServer } = pkg

// Import RESOLVERS and TYPE DEFINITIONS
import resolvers from './graphql/resolvers/index.js'
import typeDefs from './graphql/typeDefs.js'

// Import Mongoose ORM
import mongoose from 'mongoose'

// Import middleware for authenticating current user and storing in CONTEXT
import authMiddleware from './middleware/authMiddleware.js'

// Configure PORT
const PORT = process.env.PORT || 4000

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// app.use(express.static(path.join(__dirname, "client", "build")))
// Create Apollo GraphQL server
const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  context: authMiddleware,
  subscriptions: {
    path: '/subscriptions'
  },
})

// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, "public", "index.html"))
// })

// Start server
server.start().then(() => {
  server.applyMiddleware({ app })
  const httpServer = createServer(app)
  server.installSubscriptionHandlers(httpServer)
  httpServer.listen(PORT, async () => {
    console.log(`🚀 Server ready at ${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ${server.subscriptionsPath}`)
    try{
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
        console.log("error in db connection: ", err)
        process.exit(1)
    }
  })
})