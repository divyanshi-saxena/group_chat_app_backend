import Group from '../../models/Group.js'
import apolloErrors from 'apollo-server-errors'
const { AuthenticationError } = apolloErrors

export default {
  Query: {
    getGroupCount: async (parent, args, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')
        let count = await Group.countDocuments()
        console.log('number of docs: ', count)
        return count
      }
      catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createGroup: async (parent, args) => {
      let { groupname, groupdesc } = args
      let errors = {}
      try {
        // 1. Validate input data
        if (groupname.trim() === '') errors.groupname = 'Group name cannot be blank'
        if (groupdesc.trim() === '') errors.groupdesc = 'Group description cannot be blank'
        
        // 2. Check if error exists then throw error
        if (Object.keys(errors).length > 0) {
          throw errors
        }

        // 3. Create group
        let group = await Group.create({
          groupname, groupdesc
        })

        // 4. Return group id
        return group
      }
      catch (err) {
        console.log(err)
        throw err
      }
    },
    getGroups: async (parent, { page }, { user }) => {
      try {
        // 1. If auth token doesn't exist, user cannot see the groups
        if (!user) throw new AuthenticationError('Unauthenticated')
        const resultPerPage = 3
        let pageNo = page >= 1 ? page : 1
        pageNo = pageNo - 1 
        // 2. Find all groups
        let groups = await Group.find().limit(resultPerPage).skip(resultPerPage * pageNo).lean()
        
        // 3. Return array of groups
        return groups
      }
      catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}