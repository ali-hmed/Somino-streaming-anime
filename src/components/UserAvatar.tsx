"use client";

import React, { useMemo } from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface UserAvatarProps {
    user?: {
        _id?: string;
        userId?: string;
        username?: string;
        avatar?: string;
        frame?: string;
        role?: string;
    } | null;
    size?: 'sm' | 'md' | 'lg' | 'xl' | string;
    className?: string;
    referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

const UserAvatar = ({ user: initialUser, size = 'md', className = '', referrerPolicy = 'no-referrer' }: UserAvatarProps) => {
    const { user: currentUser } = useAuthStore();

    // Sync with auth store if this is the current user.
    // This makes sure the avatar/frame updates everywhere immediately when changed in profile.
    const user = useMemo(() => {
        if (!initialUser || !currentUser) return initialUser;
        
        const isCurrentUser = 
            (initialUser._id && initialUser._id === currentUser._id) ||
            (initialUser.userId && initialUser.userId === currentUser._id) ||
            (initialUser.username && initialUser.username === currentUser.username);

        if (isCurrentUser) {
            return {
                ...initialUser,
                avatar: currentUser.avatar || initialUser.avatar,
                frame: currentUser.frame || initialUser.frame,
                role: currentUser.role || initialUser.role,
            };
        }
        return initialUser;
    }, [initialUser, currentUser]);

    const sizeClasses: Record<string, string> = {
        sm: 'w-6 h-6',
        md: 'w-9 h-9',
        lg: 'w-10 h-10',
        xl: 'w-[100px] h-[100px] md:w-[150px] md:h-[150px]'
    };

    const finalSizeClass = sizeClasses[size] || size;

    const iconSizeClasses: Record<string, string> = {
        sm: 'w-2/3 h-2/3',
        md: 'w-1/2 h-1/2',
        lg: 'w-1/2 h-1/2',
        xl: 'w-1/3 h-1/3'
    };

    const getEffectiveFrame = () => {
        if (user?.frame && user.frame !== 'none') return user.frame;
        
        const role = user?.role?.toLowerCase();
        if (role === 'owner') return '/frames/owner_frame.png';
        if (role === 'admin') return '/frames/admin_frame.png';
        
        return null;
    };

    const effectiveFrame = getEffectiveFrame();

    return (
        <div className={`relative ${finalSizeClass} shrink-0 ${className}`}>
            <div className={`w-full h-full rounded-full overflow-hidden bg-white/5 flex items-center justify-center`}>
                {user?.avatar ? (
                    <img 
                        src={user.avatar} 
                        alt={user.username || 'User'} 
                        className="w-full h-full object-cover" 
                        referrerPolicy={referrerPolicy}
                    />
                ) : (
                    <UserIcon className={`${iconSizeClasses[size] || iconSizeClasses.md} text-white/10`} />
                )}
            </div>
            
            {/* Frame Overlay */}
            {effectiveFrame && (
                <img 
                    src={effectiveFrame} 
                    className="absolute inset-[-18.5%] w-[137%] h-[137%] max-w-none pointer-events-none z-10" 
                    alt="Frame"
                    referrerPolicy={referrerPolicy}
                />
            )}
        </div>
    );
};

export default UserAvatar;
