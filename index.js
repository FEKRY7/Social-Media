const express = require('express')
const app = express()

const cors = require('cors')

require('dotenv').config()

const mongodbconnect = require('./Database/dbConnection.js')
mongodbconnect()

app.use(express.json())
app.use(cors())

const userRouter = require('./src/modules/auth/auth.router.js')
const postRouter = require('./src/modules/Post/Posts.router.js')
const commentRouter = require('./src/modules/Comment/Comments.router.js')
const commentReplayRouter = require('./src/modules/CommentReplay/commentReplay.router.js')

 
app.use('/api/user',userRouter)
app.use('/api/post',postRouter)
app.use('/api/comment',commentRouter)
app.use('/api/commentReplay',commentReplayRouter)


// Set up server to listen on specified port (default to 3000)
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// 404 route
app.use('*', (req, res) => {
    res.status(404).json({ 'Msg': 'I Can\'t Found' });
});