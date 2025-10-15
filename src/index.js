const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

app.use(express.json()) 
app.use(express.urlencoded({
    extended: true
})) 

app.set('trust proxy', true)

const authRoutes = require('./routes/authRoutes')
const faqRoutes = require('./routes/faqRoutes')

app.use('/api/auth', authRoutes)
app.use('/faq', faqRoutes)

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Quiz API is running'
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app;
