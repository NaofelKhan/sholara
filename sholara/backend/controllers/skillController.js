const Skill = require('../models/Skill');

// @desc  Get all skills (optional ?category= filter)
// @route GET /api/skills
const getSkills = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All Skills') {
      filter.category = req.query.category;
    }
    const skills = await Skill.find(filter).sort({ topRated: -1, rating: -1 });
    res.json({ success: true, count: skills.length, data: skills });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single skill
// @route GET /api/skills/:id
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

// @desc  Create skill
// @route POST /api/skills
const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

// @desc  Update skill
// @route PUT /api/skills/:id
const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete skill
// @route DELETE /api/skills/:id
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSkills, getSkillById, createSkill, updateSkill, deleteSkill };
