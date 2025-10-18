const supabase = require('../config/supabase');

class AvatarModel {
    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from('avatars')
            .select(`
                *,
                users:created_by (
                    id,
                    username
                )
            `)
            .order('created_at', {
                ascending: false
            });

        if (error) throw error;
        return data;
    }

    static async getActive() {
        const {
            data,
            error
        } = await supabase
            .from('avatars')
            .select('*')
            .eq('is_active', true)
            .order('created_at', {
                ascending: false
            });

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const {
            data,
            error
        } = await supabase
            .from('avatars')
            .select(`
                *,
                users:created_by (
                    id,
                    username
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async create({
        name,
        image_url,
        created_by
    }) {
        const {
            data,
            error
        } = await supabase
            .from('avatars')
            .insert([{
                name,
                image_url,
                is_active: true,
                created_by
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, {
        name,
        is_active
    }) {
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (is_active !== undefined) updateData.is_active = is_active;

        const {
            data,
            error
        } = await supabase
            .from('avatars')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id) {
        const {
            error
        } = await supabase
            .from('avatars')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async checkAvatarInUse(avatarId) {
        const {
            count,
            error
        } = await supabase
            .from('users')
            .select('id', {
                count: 'exact',
                head: true
            })
            .eq('avatar_id', avatarId);

        if (error) throw error;
        return count > 0;
    }
}

module.exports = AvatarModel;