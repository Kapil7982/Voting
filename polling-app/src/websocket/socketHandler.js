const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const handleSocketConnection = (socket, io) => {
  console.log('New client connected:', socket.id);

  // Handle authentication
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true }
      });

      if (user) {
        socket.userId = user.id;
        socket.user = user;
        socket.emit('authenticated', { user });
        console.log(`User authenticated: ${user.name} (${socket.id})`);
      } else {
        socket.emit('authError', { message: 'Invalid token' });
      }
    } catch (error) {
      socket.emit('authError', { message: 'Authentication failed' });
    }
  });

  // Handle joining a poll room for real-time updates
  socket.on('joinPoll', (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log(`Client ${socket.id} joined poll room: poll_${pollId}`);
    
    socket.emit('joinedPoll', { pollId, message: 'Joined poll room successfully' });
  });

  // Handle leaving a poll room
  socket.on('leavePoll', (pollId) => {
    socket.leave(`poll_${pollId}`);
    console.log(`Client ${socket.id} left poll room: poll_${pollId}`);
    
    socket.emit('leftPoll', { pollId, message: 'Left poll room successfully' });
  });

  // Handle getting current poll data
  socket.on('getPollData', async (pollId) => {
    try {
      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
          options: {
            include: {
              _count: {
                select: { votes: true }
              }
            }
          },
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (poll) {
        const pollWithVoteCounts = {
          ...poll,
          options: poll.options.map(option => ({
            ...option,
            voteCount: option._count.votes
          }))
        };

        socket.emit('pollData', pollWithVoteCounts);
      } else {
        socket.emit('error', { message: 'Poll not found' });
      }
    } catch (error) {
      console.error('Error fetching poll data:', error);
      socket.emit('error', { message: 'Failed to fetch poll data' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

module.exports = { handleSocketConnection };