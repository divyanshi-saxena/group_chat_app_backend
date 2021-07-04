import jwt from 'jsonwebtoken'
import apolloServer from 'apollo-server'
const { PubSub } = apolloServer
const pubsub = new PubSub()

const validateUser = (context) => {
  let token
  // 1. Fetch token from REQUEST HEADERS on connection over HTTP (for QUERY/MUTATION)
  if (context.req && context.req.headers.authorization) {
    token = context.req.headers.authorization.split('Bearer ')[1]
    console.log('token request ', token)
  }
  // 2. Fetch token from CONNECTION PARAMETER on connection over WEBSOCKET (for SUBSCRIPTION)
  else if (context.connection && context.connection.context.Authorization) {
    token = context.connection.context.Authorization.split('Bearer ')[1]
    console.log('token conn :  ', token)
  }

  // console.log('token ', token)
  // 3. Verify token and store user data in context parameter
  if (token) {
    jwt.verify(token, 'secret', (err, decodedToken) => {
      context.user = decodedToken
    })
  }

  context.pubsub = pubsub
  return context
}

export default validateUser