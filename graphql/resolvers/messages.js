import Message from '../../models/Message.js'

import Group from '../../models/Group.js'

import apolloErrors from 'apollo-server-errors'
import filter from 'apollo-server'
const { UserInputError, AuthenticationError } = apolloErrors
const { withFilter } = filter

export default {
  Query: {
    getMessages: async (parent, { to }, { user }) => {
      try {
        // 1. Check if user is authenticated
        if (!user) throw new AuthenticationError('Unauthenticated')

        // 2. Fetch the group details from database
        const group = await Group.findOne({ groupname: to }).lean()

        // 3. Throw error if group doesn't exist
        if (!group) throw new UserInputError('Group not found')

        // 4. Fetch messages of the group
        const messages = await Message.find({ to }).sort({ 'createdAt': -1 }).lean()

        let finalList = messages.map(message => {
          return {
            from: message.from,
            to: message.to,
            content: message.content,
            createdAt: message.createdAt,
            id: message._id.toString()
          }
        })
        console.log('final list: ', finalList)

        // 5. Return messages
        return finalList
      }
      catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        // 1. Check if user is authenticated
        if (!user) throw new AuthenticationError('Unauthenticated')

        // 2. Find group details for which the message is meant to
        const group = await Group.findOne({ groupname: to }).lean()

        // 3. Throw error if group doesn't exist
        if (!group) throw new UserInputError('Group not found')

        // 4. Check if content is empty
        if (content.trim() === '') throw new UserInputError('Message is empty')

        // 5. Create message in database
        const message = await Message.create({
          from: user.username,
          to,
          content
        })

        console.log('message: ', message)
        let finalMessage = {
          id: message._id.toString(),
          from: message.from,
          to: message.to,
          content: message.content,
          createdAt: message.createdAt
        }
        console.log('final message object: ', finalMessage)

        // 6. Fire the event here for subscribed users
        pubsub.publish('NEW_MESSAGE', { newMessage: finalMessage })

        // 7. Return the message
        return message
      }
      catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (parent, args, { user, pubsub }) => {
          // 1. Check if user is authenticated
          if (!user) throw new AuthenticationError('Unauthenticated')
          // 2. AsyncIterator
          return pubsub.asyncIterator('NEW_MESSAGE')
        },
        async ({ newMessage }, args, { user }) => {
          const group = await Group.findOne({ groupname: newMessage.to }).lean()
          // 3. Configure filter
          console.log('grouuup ', group)
          if (group) {
            if (newMessage.from === user.username || newMessage.to === group.groupname) {
            return true
          }
          }
          return false
        }
      )
    }
  }
}