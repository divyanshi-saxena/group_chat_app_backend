import userResolvers from './users.js'
import messageResolvers from './messages.js'
import groupResolvers from './groups.js'

export default {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString()
  },
  Group: {
    createdAt: (parent) => parent.createdAt.toISOString()
  },
  User: {
    createdAt: (parent) => parent.createdAt.toISOString()
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
    ...groupResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...groupResolvers.Mutation
  },
  Subscription: {
    ...messageResolvers.Subscription
  }
}