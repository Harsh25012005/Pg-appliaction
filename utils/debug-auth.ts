import { supabase } from './supabase';

export const debugAuth = {
  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.log('❌ Database connection failed:', error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Connection test error:', error);
      return false;
    }
  },

  // List all tenants (for debugging)
  async listTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, email, name, room_id')
        .limit(10);
      
      if (error) {
        console.log('❌ Failed to fetch tenants:', error);
        return [];
      }
      
      console.log('📋 Tenants in database:', data);
      return data || [];
    } catch (error) {
      console.log('❌ Error fetching tenants:', error);
      return [];
    }
  },

  // Test specific login credentials
  async testLogin(email: string, password: string) {
    try {
      console.log('🔍 Testing login for:', email);
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error) {
        console.log('❌ Query error:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('❌ No user found with email:', email);
        return { success: false, error: 'User not found' };
      }

      console.log('👤 User found:', { 
        id: data.id, 
        name: data.name, 
        email: data.email,
        hasPassword: !!data.password 
      });

      if (data.password === password) {
        console.log('✅ Password matches');
        return { success: true, user: data };
      } else {
        console.log('❌ Password mismatch');
        console.log('Expected:', data.password);
        console.log('Provided:', password);
        return { success: false, error: 'Invalid password' };
      }
    } catch (error: any) {
      console.log('❌ Test login error:', error);
      return { success: false, error: error.message };
    }
  }
};