import supabase from '../config/supabaseClient.js';

export const logActivity = async (userId, action, details = '', req = null) => {
  try {
    const ipAddress = req ? req.ip || req.connection.remoteAddress : '';
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details,
      ip_address: ipAddress
    });
  } catch (error) {
    console.error('Failed to record activity log:', error.message);
  }
};
