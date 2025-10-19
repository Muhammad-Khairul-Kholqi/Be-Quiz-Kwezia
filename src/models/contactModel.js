const supabase = require('../config/supabase');

class ContactModel {
    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from('contact')
            .select('*')
            .order('created_at', {
                ascending: false
            });

        if (error) throw error;
        return data;
    }

    static async getUnread() {
        const {
            data,
            error
        } = await supabase
            .from('contact')
            .select('*')
            .eq('is_read', false)
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
            .from('contact')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async create({
        name,
        email,
        message
    }) {
        const {
            data,
            error
        } = await supabase
            .from('contact')
            .insert([{
                name,
                email,
                message,
                is_read: false
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async markAsRead(id) {
        const {
            data,
            error
        } = await supabase
            .from('contact')
            .update({
                is_read: true
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async markAsUnread(id) {
        const {
            data,
            error
        } = await supabase
            .from('contact')
            .update({
                is_read: false
            })
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
            .from('contact')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async getUnreadCount() {
        const {
            count,
            error
        } = await supabase
            .from('contact')
            .select('id', {
                count: 'exact',
                head: true
            })
            .eq('is_read', false);

        if (error) throw error;
        return count;
    }
}

module.exports = ContactModel;