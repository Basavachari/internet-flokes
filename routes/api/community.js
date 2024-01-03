const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const slugify = require('slugify');

// Import models within the route handler
const Community = require('../../models/Community');

const Member = require('../../models/Member');

const Role = require('../../models/Role');

// Create community
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Invalid name' });
        }
        // Check if community name already exists
        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return res.status(400).json({ error: 'Community name already exists' });
        }

        console.log(req.user);
        // Generate slug
        const slug = slugify(name, { lower: true });

        const community = new Community({ name, slug, owner: req.user });
        await community.save();

        // Find the role ID for "Community Admin"
        const adminRole = await Role.findOne({ name: 'Community Admin' });
        if (!adminRole) {
            return res.status(500).json({ error: 'Community Admin role not found' });
        }
        // Create and save the member record with the role ID
        const member = new Member({
            community: community.id,
            user: req.user,
            role: adminRole.id, // Use the role ID
        });
        await member.save();
        res.json({
            status: true,
            content: {
              data: {
                id : community.id,
                name : community.name,
                slug : community.slug,
                owner : community.owner,
                created_at : community.created_at,
                updated_at : community.updated_at
              },
            },
          });
        // res.json({ message: 'Community created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create community' });
    }
});

// Get all communities  --- DONE SUCCESS
router.get('/', async (req, res) => {
    try {
        const communities = await Community.find()
        .populate({
            path : 'owner',
            select : '_id name',
            model : 'User'
        })
        console.log(communities)
        
        const data = communities.map((community) => {
            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: {
                    id: community.owner._id,
                    name: community.owner.name
                },
                created_at: community.created_at,
                updated_at: community.updated_at
            }})

        res.json({
            status: true,
            content: {
                meta : {
                    total : communities.length,
                    pages : Math.ceil(communities.length/10),
                    page : 1
                },
              data: data,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get communities' });
    }
});


// get members by id of the community
router.get('/:id/members', async (req, res) => {
    try {
        // get the community by id from the name given in params
        const community = await Community.findOne({name : req.params.id});

        const members = await Member.find({community : community.id})
        .populate({
            path : 'user',
            select : 'id name',
            model : 'User'
        })
        .populate({
            path : 'role',
            select : 'id name',
            model : 'Role'

        })
        const data = members.map((member) => {
            return {
                id: member.id,
                community: member.community,
                user: {
                    id: member.user._id,
                    name: member.user.name
                },
                role: {
                    id: member.role._id,
                    name: member.role.name
                },
                created_at: member.created_at
            }})
        res.json({
            status: true,
            content: {
                meta : {
                    total : members.length,
                    pages : Math.ceil(members.length/10),
                    page : 1
                },
              data: data,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get members' });
    }
});

// Get My Owned Community
router.get('/me/owner', authMiddleware, async (req, res) => {
    try {
        const communities = await Community.find({ owner: req.user });
        const data = communities.map((community) => {
            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: community.owner,
                created_at: community.created_at,
                updated_at: community.updated_at
            }})
        res.json({
            status: true,
            content: {
                meta : {
                    total : communities.length,
                    pages : Math.ceil(communities.length/10),
                    page : 1
                },
              data: data,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get communities' });
    }
});

//Get My Joined Community
router.get('/me/member', authMiddleware, async (req, res) => {
    try {
        const members = await Member.find({ user: req.user });
        // res.json(members);
        const communities = await Community.find({ _id: { $in: members.map((member) => member.community) } });
    
        const data = communities.map((community) => {
            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: community.owner,
                created_at: community.created_at,
                updated_at: community.updated_at
            }})
        res.json({
            status: true,
            content: {
                meta : {
                    total : communities.length,
                    pages : Math.ceil(communities.length/10),
                    page : 1
                },
              data: data,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get communities' });
    }
});

module.exports = router;