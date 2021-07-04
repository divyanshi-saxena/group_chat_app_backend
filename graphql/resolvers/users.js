import User from '../../models/User.js'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import apolloErrors from 'apollo-server-errors'
const { AuthenticationError, UserInputError } = apolloErrors

export default {
  Query: {
    getUsers: async (parent, args, { user }) => {    
      try {
        if(!user) throw new AuthenticationError('Unauthenticated')
      
        let users = await User.find({
          username: { $ne : user.username }
        }).select({
          username: 1,
          createdAt: 1
        }).lean()

        console.log('users array: ', users)

        return users
      }
      catch (err) {
        console.log(err)
        throw err
      }
    },
    login: async (parent, args) => {
      const { username, password } = args
      let errors = {}
      try {
        if (username.trim() === '') errors.username = 'username must not be empty'
        if (password === '') errors.password = 'password must not be empty'
        
        if (Object.keys(errors).length > 0)
          throw new UserInputError('bad input', { errors })
      
        const user = await User.findOne({ username }).lean()
        if (!user) {
          errors.username = "user not found"
          throw new UserInputError('user not found', { errors })
        }
          
        const correctPassword = await bcrypt.compare(password, user.password)
        if (!correctPassword) {
          errors.password = "password is incorrect"
          throw new UserInputError('password is incorrect', { errors })
        }

        console.log('jwt secret ', process.env.JWT_SECRET)
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: 60 * 60 })

        return {
          ...user, token
        }
      }
      catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    register: async (parent, args) => {
      let { username, email, password, confirmPassword } = args
      let errors = {}
      try {
        // 1. Validate input data
        if (email.trim() === "") errors.email = "Email must not be empty"
        if (username.trim() === "") errors.username = "User Name must not be empty"
        if (password.trim() === "") errors.password = "Password must not be empty"
        if (confirmPassword.trim() === "") errors.confirmPassword = "Repeat Password must not be empty"
        if (password !== confirmPassword) errors.confirmPassword = "Passwords must match"
        
        // 2. Check if username/email exist
        if (Object.keys(errors).length > 0) {
          throw errors
        }

        // 3. Hash password
        password = await bcrypt.hash(password, 6)

        // 4. Create user
        const user = await User.create({
          username, email, password
        })

        // 5. Return user
        return user
      }
      catch (err) {
        console.log(err)
        if (err.code === 11000) {
          let key = Object.keys(err.keyPattern)
          errors[key] = `This ${key} is already taken`
        }
        throw new UserInputError('Bad input', { errors })
      }
    },
  }
}