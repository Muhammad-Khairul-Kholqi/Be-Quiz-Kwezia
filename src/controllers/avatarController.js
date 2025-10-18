const AvatarModel = require('../models/avatarModel');
const supabase = require('../config/supabase');
const fs = require('fs');

class AvatarController {
    // Get all avatars (Admin only - includes inactive)
    static async getAll(req, res) {
        try {
            const avatars = await AvatarModel.getAll();
            res.status(200).json({
                success: true,
                data: avatars
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch avatars',
                error: err.message
            });
        }
    }

    // Get active avatars (Public - for users to choose)
    static async getActive(req, res) {
        try {
            const avatars = await AvatarModel.getActive();
            res.status(200).json({
                success: true,
                data: avatars
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch active avatars',
                error: err.message
            });
        }
    }

    // Get avatar by ID
    static async getById(req, res) {
        try {
            const {
                id
            } = req.params;
            const avatar = await AvatarModel.getById(id);

            if (!avatar) {
                return res.status(404).json({
                    success: false,
                    message: 'Avatar not found'
                });
            }

            res.status(200).json({
                success: true,
                data: avatar
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch avatar',
                error: err.message
            });
        }
    }

    // Create avatar (Admin only)
    static async create(req, res) {
        try {
            const {
                name
            } = req.body;

            // Validation
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar name is required'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar image is required'
                });
            }

            // Upload image to Supabase Storage
            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const {
                data: uploadData,
                error: uploadError
            } = await supabase.storage
                .from('avatar-image')
                .upload(fileName, fs.readFileSync(file.path), {
                    contentType: file.mimetype,
                    upsert: false
                });

            // Delete temporary file
            fs.unlinkSync(file.path);

            if (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload avatar image',
                    error: uploadError.message
                });
            }

            // Get public URL
            const {
                data: urlData
            } = supabase.storage
                .from('avatar-image')
                .getPublicUrl(fileName);

            // Create avatar record
            const newAvatar = await AvatarModel.create({
                name: name.trim(),
                image_url: urlData.publicUrl,
                created_by: req.user.id
            });

            return res.status(201).json({
                success: true,
                message: 'Avatar successfully created',
                data: newAvatar
            });
        } catch (err) {
            // Delete uploaded file if exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to create avatar',
                error: err.message
            });
        }
    }

    // Update avatar (Admin only)
    static async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await AvatarModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Avatar not found'
                });
            }

            const {
                name,
                is_active
            } = req.body;

            const updateData = {};
            if (name !== undefined) updateData.name = name.trim();
            if (is_active !== undefined) {
                // Parse is_active (handle string from form-data)
                updateData.is_active = is_active === 'true' || is_active === true;
            }

            // Update avatar image if new file provided
            if (req.file) {
                const file = req.file;
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from('avatar-image')
                    .upload(fileName, fs.readFileSync(file.path), {
                        contentType: file.mimetype,
                        upsert: false
                    });

                fs.unlinkSync(file.path);

                if (uploadError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload avatar image',
                        error: uploadError.message
                    });
                }

                // Delete old image
                if (existing.image_url) {
                    const oldFileName = existing.image_url.split('/').pop();
                    await supabase.storage
                        .from('avatar-image')
                        .remove([oldFileName]);
                }

                const {
                    data: urlData
                } = supabase.storage
                    .from('avatar-image')
                    .getPublicUrl(fileName);

                updateData.image_url = urlData.publicUrl;

                // Update avatar in database with new image
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

                return res.status(200).json({
                    success: true,
                    message: 'Avatar successfully updated',
                    data: data
                });
            }

            // Update without image
            const updatedAvatar = await AvatarModel.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Avatar successfully updated',
                data: updatedAvatar
            });
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update avatar',
                error: err.message
            });
        }
    }

    // Delete avatar (Admin only)
    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await AvatarModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Avatar not found'
                });
            }

            // Check if avatar is being used by any user
            const isInUse = await AvatarModel.checkAvatarInUse(id);
            if (isInUse) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete avatar. It is currently being used by one or more users'
                });
            }

            // Delete image from storage
            if (existing.image_url) {
                const fileName = existing.image_url.split('/').pop();
                await supabase.storage
                    .from('avatar-image')
                    .remove([fileName]);
            }

            // Delete avatar record
            await AvatarModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Avatar has been successfully deleted'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete avatar',
                error: err.message
            });
        }
    }
}

module.exports = AvatarController;