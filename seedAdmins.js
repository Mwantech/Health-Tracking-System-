const bcrypt = require('bcrypt');
const { Admin } = require('./models/userModel');

async function seedAdmins() {
  try {
    const superadmins = [
      { username: 'mwantech', password: 'password1' },
      { username: 'john smith', password: 'password2' }
    ];

    for (const admin of superadmins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await Admin.create({
        username: admin.username,
        password: hashedPassword
      });
    }

    console.log('Superadmins seeded successfully');
  } catch (error) {
    console.error('Error seeding superadmins:', error);
  }
}

seedAdmins();