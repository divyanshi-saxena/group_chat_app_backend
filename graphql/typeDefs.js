import apolloServer from 'apollo-server'
const { gql } = apolloServer

export default gql`
  type User {
    email: String
    username: String!
    createdAt: String!
    token: String
  }
  type Group {
    groupname: String!
    groupdesc: String!
    createdAt: String!
  }
  type Message {
    id: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  
  type Query {
    login(username: String! password: String!): User!
    getUsers: [User]!
    getGroupCount: Int!
    getMessages(to: String!): [Message]!
  }
  type Mutation {
    getGroups(page: Int!): [Group]!
    register(username: String! email: String! password: String! confirmPassword: String!): User!
    createGroup(groupname: String! groupdesc: String!): Group!
    sendMessage(to: String! content: String!): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`