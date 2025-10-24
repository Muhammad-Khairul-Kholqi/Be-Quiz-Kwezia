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
    },

    delete: async (id) => {
            const {
                data,
                error
            } = await supabase
                .from('users')
                .delete()
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        getAllUsers: async (filters = {}) => {
            let query = supabase
                .from('users')
                .select('id, username, role, total_points, total_quiz_completed, total_perfect_attempts, created_at');

            if (filters.role) {
                query = query.eq('role', filters.role);
            }

            if (filters.search) {
                query = query.ilike('username', `%${filters.search}%`);
            }

            const {
                data,
                error
            } = await query.order('created_at', {
                ascending: false
            });

            if (error) throw error;
            return data;
        }
};

module.exports = userModel;
