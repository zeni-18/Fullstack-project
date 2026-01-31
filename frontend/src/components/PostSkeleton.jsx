import React from 'react';

const PostSkeleton = () => {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--spacing-md)', width: '100%' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }}></div>
                <div className="skeleton" style={{ width: '120px', height: '14px' }}></div>
            </div>

            <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 0 }}></div>

            <div style={{ padding: '16px' }}>
                <div className="flex" style={{ gap: '16px', marginBottom: '12px' }}>
                    <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }}></div>
                    <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }}></div>
                    <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '12px' }}></div>
            </div>
        </div>
    );
};

export default PostSkeleton;
