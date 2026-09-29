require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person')

const app = express();

app.use(express.static('dist'))
app.use(express.json())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(result => {
        res.json(result)
    })
})

app.get('/info', (req, res) => {
    Person.find({}).then(result => {
        res.send(`
            <p>Phonebook has info for ${result.length} people</p>
            <p>${new Date()}</p>
            `)
    })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id).then(result => {
    if (result) {
      response.json(result)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => {
    console.log(error)
    response.status(400).send({ error: 'malformatted id' })
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findByIdAndRemove(id).then(result => {
      response.status(204).end()
  })
  .catch(error => {
    console.log(error)
    response.status(400).send({ error: 'malformatted id' })
  })
})


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(result => {
    response.json(result)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

