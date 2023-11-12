const express = require('express')
const { ApolloServer } = require("@apollo/server")
const { expressMiddleware } = require("@apollo/server/express4")
const bodyParser = require("body-parser")
const cors = require("cors")
const { default: axios } = require('axios')
const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})



async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs: `
        type User{
            id: ID!
            name: String!
            username: String!
        }
        type Todo{
            id: ID!
            title: String!
            completed: Boolean
            userId: String!
            user: User
        }
        type Query{
            getTodos: [Todo]
            getUsers: [User]
            getUser(id: ID!): User
        }
        type Mutation{
            postUser(name: String!, username: String!): User
        }
        `,
        resolvers: {
            Todo: {
                user: async (todo) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data,
            },
            Query: {
                getTodos: async () => (await axios.get('https://jsonplaceholder.typicode.com/todos')).data,
                getUsers: async () => (await axios.get('https://jsonplaceholder.typicode.com/users')).data,
                getUser: async (parent, { id }) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
            },
            Mutation: {
                postUser: (_, data) => {
                    console.log(data, "Data")
                    return data
                }
            }
        }
    })
    await server.start();
    app.use("/graphql", expressMiddleware(server))
}

startApolloServer()

const port = 4000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})