const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const Community = require('../../models/Community');
const Role = require('../../models/Role');
const authMiddleware = require('../../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  try {
    // Ensure user has Community Admin role
    
    const { community, user, role } = req.body;

    // Validate input data
    if (!community || !user || !role) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Ensure community exists
    const communityExists = await Community.findOne({_id : community, owner : req.user});
    if (!communityExists) {
      return res.status(403).json({ error: 'NOT_ALLOWED_ACCESS' });
    }

    // Ensure role exists
    const roleExists = await Role.findOne({_id : role});
    if (!roleExists) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const newMember = new Member({
      community,
      user : user,
      role : role,
    });

    await newMember.save();

    res.json({
      status: true,
      content: {
        data: {
          id: newMember.id,
          community,
          user,
          role,
          created_at: newMember.created_at,
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// delete route with id 
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const memberToDelete = await Member.findById(req.params.id);

    if (!memberToDelete) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check user's role in the community
    const userMemberInCommunity = await Member.findOne({
      community : memberToDelete.community,
      user : req.user.id
    });

    if (!userMemberInCommunity) {
      return res.status(403).json({ error: 'NOT_ALLOWED_ACCESS' });
    }

    const allowedRoles = ['Community Admin', 'Community Moderator'];
    const userHasAdminOrModeratorRole = await Role.findOne({
      id: userMemberInCommunity.role,
      name: { $in: allowedRoles }
    });

    if (!userHasAdminOrModeratorRole) {
      return res.status(403).json({ error: 'NOT_ALLOWED_ACCESS' });
    }

    // Ensure user is not deleting themselves
    if (memberToDelete.user === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await memberToDelete.delete();

    res.json({ status: true, content: { message: 'Member deleted successfully' } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;

