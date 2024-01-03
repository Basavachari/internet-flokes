const Role = require('../../models/Role') // Assuming you have a Role model defined
const express = require('express')

const router = express.Router();

// Create role
router.post('/', async (req, res) => {
    try {
        const roleName = req.body.name; // Assuming the role name is provided in the request body
        const role = new Role({ name: roleName });
        await role.save();
        // res.send({ data: role});
        res.json({ "status" : true ,"content" : {  data : { id : role.id, name : role.name,created_at: role.created_at, updated_at : role.updated_at}} }); // Response with token in meta field

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating role');
    }
});

// Get all roles
router.get('/', async (req, res) => {
    try {
        const roles = await Role.find();
        const roleData = roles.map(role => {
            return {
                id: role.id,
                name: role.name,
                created_at: role.created_at,
                updated_at: role.updated_at
            };
        });
        res.json({ "status": true, "content": { meta : {total : roles.length, pages:Math.ceil(roles.length/10), page :1},data: roleData } }); // Response with token in meta field
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting roles');
    }
});

module.exports = router;
