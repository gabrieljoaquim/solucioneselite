const mongoose = require('mongoose');
const User = require('../models/userModel');

// Connect to the database
mongoose.connect('mongodb://localhost:27017/solucioneselite', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const populateFields = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      // Set default values for new fields if they are not already set
      user.specialty = user.specialty && user.specialty.length > 0 ? user.specialty : ['General'];
      user.zone = user.zone || 'Default Zone';
      user.rating = user.rating || 0;

      await user.save();
      console.log(`Updated user: ${user.name}`);
    }

    console.log('All users updated successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating users:', error);
    mongoose.connection.close();
  }
};

populateFields();
