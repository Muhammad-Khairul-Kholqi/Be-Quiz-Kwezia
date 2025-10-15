const supabase = require('../config/supabase');

const userModel = {
    findByUsername: async (username) => {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    findById: async (id) => {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    create: async (userData) => {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (id, userData) => {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

module.exports = userModel;
