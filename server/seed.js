import 'dotenv/config';
import supabase from './config/supabaseClient.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Seeding Supabase database...');

    // Create Super Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@bloodbank.com')
      .maybeSingle();

    if (!existingAdmin) {
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name: 'Super Admin',
          email: 'admin@bloodbank.com',
          password: hashedPassword,
          role: 'super_admin'
        })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Super Admin created: admin@bloodbank.com / Admin@123');
    } else {
      console.log('⚠️ Super Admin already exists.');
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
