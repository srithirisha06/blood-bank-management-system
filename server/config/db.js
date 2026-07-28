const connectDB = async () => {
  try {
    await import('./supabaseClient.js');
    console.log('[Database] Supabase selected as provider. Client initialized.');
  } catch (error) {
    console.error(`[Database Error] Supabase client failed to initialize: ${error.message}`);
    throw error;
  }
};

export default connectDB;
