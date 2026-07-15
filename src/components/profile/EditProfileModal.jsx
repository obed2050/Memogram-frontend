import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiXMark, HiCamera, HiUser, HiHashtag, HiDocumentText, HiGlobeAlt,
  HiAcademicCap, HiCalendarDays, HiHeart, HiCog, HiMapPin,
  HiShieldCheck, HiEnvelope, HiPhone, HiPhoto,
} from 'react-icons/hi2';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { userService } from '../../services';
import toast from 'react-hot-toast';

const SECTIONS = [
  { key: 'basic', label: 'Basic', icon: HiUser },
  { key: 'school', label: 'School', icon: HiAcademicCap },
  { key: 'interests', label: 'Interests', icon: HiHeart },
  { key: 'privacy', label: 'Privacy', icon: HiShieldCheck },
];

const InputField = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </label>
    {children}
  </div>
);

const inputClasses = 'w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors';

const EditProfileModal = ({ profile, profileData, onClose, onSave }) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [saving, setSaving] = useState(false);
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState({ photo: false, cover: false });

  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    gender: profile?.gender || '',
    dateOfBirth: profile?.dateOfBirth || '',
    currentSchool: profile?.currentSchool || '',
    generation: profile?.generation || '',
    website: '',
    email: profile?.email || '',
    phone: '',
    location: '',
    interests: Array.isArray(profileData?.interests) ? profileData.interests.join(', ') : '',
    favoriteSubjects: Array.isArray(profileData?.favoriteSubjects)
      ? profileData.favoriteSubjects.map(s => typeof s === 'string' ? s : s.name).join(', ')
      : '',
    privacyProfile: 'public',
    privacyFollowers: 'public',
  });

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhotoUpload = async (file) => {
    try {
      setUploading((u) => ({ ...u, photo: true }));
      const fd = new FormData();
      fd.append('profilePhoto', file);
      const res = await userService.uploadProfilePhoto(fd);
      setPhotoPreview(res.data.profilePhoto);
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading((u) => ({ ...u, photo: false }));
    }
  };

  const handleCoverUpload = async (file) => {
    try {
      setUploading((u) => ({ ...u, cover: true }));
      const fd = new FormData();
      fd.append('coverPhoto', file);
      const res = await userService.uploadCoverPhoto(fd);
      setCoverPreview(res.data.coverPhoto);
      toast.success('Cover photo updated');
    } catch {
      toast.error('Failed to upload cover');
    } finally {
      setUploading((u) => ({ ...u, cover: false }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        fullName: form.fullName,
        bio: form.bio,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        currentSchool: form.currentSchool || undefined,
        generation: form.generation || undefined,
        interests: form.interests ? form.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
        favoriteSubjects: form.favoriteSubjects ? form.favoriteSubjects.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await onSave(payload);
      toast.success('Profile updated');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || profile?.profilePhoto;
  const displayCover = coverPreview || profile?.coverPhoto;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg max-h-[85vh] bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border shrink-0">
          <h3 className="text-lg font-bold text-white">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-400 hover:text-white transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Cover + Photo Preview */}
        <div className="relative shrink-0">
          <div className="h-28 bg-dark-surface overflow-hidden">
            {displayCover ? (
              <img src={displayCover} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setCoverPreview(URL.createObjectURL(f)); handleCoverUpload(f); }
              }}
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading.cover}
              className="absolute bottom-2 right-2 p-2 glass rounded-lg text-white text-xs flex items-center gap-1"
            >
              <HiCamera className="w-3.5 h-3.5" />
              {uploading.cover ? 'Uploading...' : 'Cover'}
            </button>
          </div>

          <div className="absolute -bottom-8 left-5">
            <div className="relative group">
              <div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-accent">
                <div className="rounded-full bg-dark-card p-[2px]">
                  <Avatar
                    src={displayPhoto}
                    name={form.fullName}
                    size="lg"
                  />
                </div>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setPhotoPreview(URL.createObjectURL(f)); handlePhotoUpload(f); }
                }}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading.photo}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HiCamera className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-dark-border px-5 pt-4 shrink-0">
          {SECTIONS.map((sec) => {
            const SecIcon = sec.icon;
            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors -mb-px ${
                  activeSection === sec.key
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <SecIcon className="w-3.5 h-3.5" />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="wait">
            {activeSection === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <InputField label="Display Name" icon={HiUser}>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={inputClasses}
                    placeholder="Your full name"
                  />
                </InputField>

                <InputField label="Username" icon={HiHashtag}>
                  <div className="flex items-center bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
                    <span className="pl-4 text-gray-600 text-sm">@</span>
                    <input
                      type="text"
                      value={form.username}
                      disabled
                      className="flex-1 bg-transparent px-0 py-2.5 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                      placeholder="username"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600">Username changes require backend support</p>
                </InputField>

                <InputField label="Bio" icon={HiDocumentText}>
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell people about yourself..."
                  />
                  <p className="text-[10px] text-gray-600 text-right">{form.bio.length}/500</p>
                </InputField>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Gender" icon={HiUser}>
                    <select
                      value={form.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </InputField>

                  <InputField label="Date of Birth" icon={HiCalendarDays}>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className={inputClasses}
                    />
                  </InputField>
                </div>

                <InputField label="Website" icon={HiGlobeAlt}>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className={inputClasses}
                    placeholder="https://yoursite.com"
                  />
                </InputField>

                <InputField label="Location" icon={HiMapPin}>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className={inputClasses}
                    placeholder="City, Country"
                  />
                </InputField>
              </motion.div>
            )}

            {activeSection === 'school' && (
              <motion.div
                key="school"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <InputField label="Current School" icon={HiAcademicCap}>
                  <input
                    type="text"
                    value={form.currentSchool}
                    onChange={(e) => updateField('currentSchool', e.target.value)}
                    className={inputClasses}
                    placeholder="Your school name"
                  />
                </InputField>

                <InputField label="Generation" icon={HiAcademicCap}>
                  <input
                    type="text"
                    value={form.generation}
                    onChange={(e) => updateField('generation', e.target.value)}
                    className={inputClasses}
                    placeholder="e.g. 2024"
                  />
                </InputField>

                <InputField label="Previous Schools" icon={HiAcademicCap}>
                  <input
                    type="text"
                    disabled
                    className={`${inputClasses} cursor-not-allowed`}
                    placeholder="Coming soon"
                  />
                </InputField>
              </motion.div>
            )}

            {activeSection === 'interests' && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <InputField label="Interests" icon={HiHeart}>
                  <textarea
                    value={form.interests}
                    onChange={(e) => updateField('interests', e.target.value)}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Photography, Music, Travel (comma separated)"
                  />
                </InputField>

                <InputField label="Favorite Subjects" icon={HiDocumentText}>
                  <textarea
                    value={form.favoriteSubjects}
                    onChange={(e) => updateField('favoriteSubjects', e.target.value)}
                    rows={2}
                    className={`${inputClasses} resize-none`}
                    placeholder="Math, Physics, Art (comma separated)"
                  />
                </InputField>
              </motion.div>
            )}

            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <InputField label="Email" icon={HiEnvelope}>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className={`${inputClasses} cursor-not-allowed`}
                  />
                  <p className="text-[10px] text-gray-600">Email changes require verification</p>
                </InputField>

                <InputField label="Phone Number (optional)" icon={HiPhone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={inputClasses}
                    placeholder="+1 234 567 890"
                  />
                </InputField>

                <InputField label="Profile Visibility" icon={HiShieldCheck}>
                  <select
                    value={form.privacyProfile}
                    onChange={(e) => updateField('privacyProfile', e.target.value)}
                    className={inputClasses}
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </InputField>

                <InputField label="Followers Visibility" icon={HiShieldCheck}>
                  <select
                    value={form.privacyFollowers}
                    onChange={(e) => updateField('privacyFollowers', e.target.value)}
                    className={inputClasses}
                  >
                    <option value="public">Public</option>
                    <option value="private">Hidden</option>
                  </select>
                </InputField>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditProfileModal;
