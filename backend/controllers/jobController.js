const Job = require('../models/Job.js');
const mongoose = require('mongoose');

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addJob = async (req, res) => {
  try {
    const { company, role, status, source, jobLink, isImported } = req.body;
    
    if (!company || !role) {
      return res.status(400).json({ message: 'Company and Role are required' });
    }

    const job = new Job({
      user: req.user._id,
      company,
      role,
      status: status || 'Applied',
      source: source || 'manual',
      jobLink,
      isImported
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this job' });
      }

      job.company = req.body.company || job.company;
      job.role = req.body.role || job.role;
      job.status = req.body.status || job.status;
      job.source = req.body.source || job.source;
      job.jobLink = req.body.jobLink || job.jobLink;

      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this job' });
      }
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Job.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalJobs = await Job.countDocuments({ user: req.user._id });
    
    // Level 1: Metrics
    const defaultStats = {
      Applied: formattedStats.Applied || 0,
      Interview: formattedStats.Interview || 0,
      Rejected: formattedStats.Rejected || 0,
      Offer: formattedStats.Offer || 0,
      total: totalJobs
    };
    
    const recentActivity = await Job.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    
    const uniqueCompaniesCount = (await Job.distinct('company', { user: userId })).length;

    // Jobs added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const jobsThisWeek = await Job.countDocuments({ 
        user: userId, 
        createdAt: { $gte: oneWeekAgo } 
    });

    res.json({
      metrics: defaultStats,
      recentActivity,
      uniqueCompaniesCount,
      jobsThisWeek
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobs,
  addJob,
  updateJob,
  deleteJob,
  getDashboardMetrics
};
