require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');

const companies = ['Google', 'Amazon', 'Facebook', 'Apple', 'Netflix', 'Microsoft', 'Tesla', 'SpaceX', 'Twitter', 'Spotify', 'Uber', 'Airbnb', 'Stripe', 'Square', 'Robinhood', 'Coinbase', 'Plaid', 'Discord', 'Slack', 'Zoom', 'Atlassian', 'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'AMD', 'Nvidia', 'Qualcomm', 'Broadcom'];
const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'SRE', 'Security Engineer', 'Systems Engineer', 'Cloud Architect', 'Database Administrator', 'QA Engineer', 'Technical Lead', 'Engineering Manager', 'Director of Engineering', 'VP of Engineering', 'CTO'];
const statuses = ['Applied', 'Interview', 'Rejected', 'Offer'];
const sources = ['linkedin', 'naukri', 'manual', 'indeed', 'glassdoor'];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user ID to associate with the jobs
    const existingJob = await Job.findOne();
    if (!existingJob) {
      console.log('No existing jobs found to get a user ID from. Please add at least one job manually or ensure a user exists.');
      process.exit(1);
    }

    const userId = existingJob.user;
    console.log('Using user ID:', userId);

    const jobsToInsert = [];
    for (let i = 0; i < 20; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      jobsToInsert.push({
        user: userId,
        company,
        role,
        status,
        source,
        createdAt,
        updatedAt: createdAt
      });
    }

    await Job.insertMany(jobsToInsert);
    console.log('Successfully inserted 20 random jobs');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
