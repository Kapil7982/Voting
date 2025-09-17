const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const submitVote = async (req, res) => {
  try {
    const { pollOptionId } = req.body;
    const userId = req.user.id;

    if (!pollOptionId) {
      return res.status(400).json({ error: 'Poll option ID is required' });
    }

    // Check if poll option exists
    const pollOption = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      include: {
        poll: true
      }
    });

    if (!pollOption) {
      return res.status(404).json({ error: 'Poll option not found' });
    }

    // Check if poll is published
    if (!pollOption.poll.isPublished) {
      return res.status(400).json({ error: 'Cannot vote on unpublished poll' });
    }

    // Check if user has already voted on this poll
    const existingVotes = await prisma.vote.findMany({
      where: {
        userId,
        pollOption: {
          pollId: pollOption.pollId
        }
      }
    });

    if (existingVotes.length > 0) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        userId,
        pollOptionId
      },
      include: {
        pollOption: {
          include: {
            poll: true
          }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // Get updated poll results
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollOption.pollId },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });

    // Transform to include vote counts
    const pollWithVoteCounts = {
      ...updatedPoll,
      options: updatedPoll.options.map(option => ({
        ...option,
        voteCount: option._count.votes
      }))
    };

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    io.to(`poll_${pollOption.pollId}`).emit('pollUpdate', pollWithVoteCounts);

    res.status(201).json({
      vote: {
        id: vote.id,
        createdAt: vote.createdAt,
        user: vote.user,
        pollOption: {
          id: vote.pollOption.id,
          text: vote.pollOption.text
        }
      },
      updatedPoll: pollWithVoteCounts
    });
  } catch (error) {
    console.error(error);
    
    // Handle unique constraint violation (duplicate vote)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }
    
    res.status(500).json({ error: 'Failed to submit vote' });
  }
};

const getVotesByPoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const votes = await prisma.vote.findMany({
      where: {
        pollOption: {
          pollId
        }
      },
      include: {
        user: {
          select: { id: true, name: true }
        },
        pollOption: {
          select: { id: true, text: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(votes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
};

module.exports = {
  submitVote,
  getVotesByPoll
};