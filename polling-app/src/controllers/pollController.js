const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createPoll = async (req, res) => {
  try {
    const { question, options, isPublished = false } = req.body;
    const creatorId = req.user.id;

    // Validate input
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        error: 'Question and at least 2 options are required' 
      });
    }

    // Create poll with options
    const poll = await prisma.poll.create({
      data: {
        question,
        isPublished,
        creatorId,
        options: {
          create: options.map(optionText => ({ text: optionText }))
        }
      },
      include: {
        options: true,
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

const getPolls = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      where: {
        isPublished: true
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to include vote counts
    const pollsWithVoteCounts = polls.map(poll => ({
      ...poll,
      options: poll.options.map(option => ({
        ...option,
        voteCount: option._count.votes
      }))
    }));

    res.json(pollsWithVoteCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
};

const getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await prisma.poll.findUnique({
      where: { id },
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

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Transform to include vote counts
    const pollWithVoteCounts = {
      ...poll,
      options: poll.options.map(option => ({
        ...option,
        voteCount: option._count.votes
      }))
    };

    res.json(pollWithVoteCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
};

const updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, isPublished } = req.body;
    const userId = req.user.id;

    // Check if poll exists and user is the creator
    const existingPoll = await prisma.poll.findUnique({
      where: { id }
    });

    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (existingPoll.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this poll' });
    }

    const updatedPoll = await prisma.poll.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(typeof isPublished === 'boolean' && { isPublished })
      },
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

    res.json(updatedPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update poll' });
  }
};

module.exports = {
  createPoll,
  getPolls,
  getPollById,
  updatePoll
};