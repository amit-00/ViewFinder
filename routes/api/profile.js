const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route   GET api/profile/me
//@desc    get current user profile
//@access  Private
router.get('/me', async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', [ 'name', 'avatar' ]);

        if(!profile){
            return res.status(400).json({ msg: 'This user does not have a profile' })
        }

        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   POST api/profile
//@desc    Create/update user profile
//@access  Private

router.post('/', [ auth, [ check('status', 'Status is required').not().isEmpty(), check('skills', 'Skills are required').not().isEmpty() ] ], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { company, website, location, status, skills, bio, githubusername, youtube, twitter, facebook, instagram } = req.body;

    const profileFields = {};

    profileFields.user = req.user.id;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(bio) profileFields.bio = bio;

    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {}

    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(instagram) profileFields.social.instagram = instagram;

    

    try{
        let profile = await Profile.findOne({ user: req.user.id });

        //update profile if exists
        if(profile){
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });

            return res.json(profile);
        }

        //create profile
        profile = new Profile(profileFields);

        await profile.save();

        res.json(profile);

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//@route   GET api/profile
//@desc    get all profiles
//@access  Public

router.get('/', async (req, res) => {
    try{
        const profiles = await Profile.find().populate('user', [ 'name', 'avatar' ]);
        res.json(profiles);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   GET api/profile/user/:user_id
//@desc    get all profiles
//@access  Public

router.get('/user/:user_id', async (req, res) => {
    try{
        const profiles = await Profile.findOne({ user: req.params.user_id }).populate('user', [ 'name', 'avatar' ]);

        if(!profile){
            return res.status(400).json({ msg: 'Profile not found' });
        }

        res.json(profiles);
    }
    catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }

        res.status(500).send('Server error');
    }
});

//@route   DELETE api/profile
//@desc    Delete profile, user & posts
//@access  Private

router.delete('/', auth, async (req, res) => {
    try{
        //remove profile
        await Profile.findOneAndRemove({ user: req.user.id });

        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   Put api/profile/experience
//@desc    Add experience to profile
//@access  Private

router.put('/experience', [ auth, 
    [ 
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ] ], async (req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }



    try{
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   DELETE api/profile/experience/exp_id
//@desc    Delete experience
//@access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try{
        //remove profile
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();
    
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   Put api/profile/education
//@desc    Add experience to profile
//@access  Private

router.put('/education', [ auth, 
    [ 
        check('school', 'School is required').not().isEmpty(),
        check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ] ], async (req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    const newEdu = {
        school, 
        degree, 
        fieldofstudy,
        from,
        to,
        current,
        description
    }



    try{
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   DELETE api/profile/education/edu_id
//@desc    Delete education
//@access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try{
        //remove profile
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();
    
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;