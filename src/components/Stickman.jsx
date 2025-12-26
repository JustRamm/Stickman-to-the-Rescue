import React from 'react';

const Stickman = ({
    emotion,
    speaker,
    position = { x: 50, y: 70 },
    isWalking = false,
    isJumping = false,
    isCrouching = false,
    currentMessage = null,
    textEffect = null,
    gender = 'guy',
    moveDir = 0
}) => {
    const isIdle = !isWalking && !isJumping && !isCrouching;

    // Determine which SVG to use
    const getAssetUrl = () => {
        const base = `/stickman_assets/${gender}`;

        if (isJumping) return `${base}_jump.svg`;
        if (isCrouching) return `${base}_crouch.svg`;
        if (isWalking) {
            if (moveDir === -1) return `${base}_walk_left.svg`;
            return `${base}_walk_right.svg`;
        }
        if (emotion === 'distressed' || emotion === 'sad') return `${base}_distressed.svg`;

        return `${base}_idle.svg`;
    };

    const assetUrl = getAssetUrl();

    // Visual classes for different states
    const animationClass = isWalking ? 'animate-stickman-walk' :
        (isJumping ? 'animate-stickman-jump' :
            ((emotion === 'distressed' || emotion === 'sad' || emotion === 'vulnerable') ? 'animate-stickman-shiver' : ''));

    return (
        <div
            className={`absolute stickman-wrapper transition-all duration-300 ${isIdle && !animationClass ? 'animate-idle-sway' : ''}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `translate(-50%, -100%)`,
                zIndex: isJumping ? 100 : 20,
            }}
        >
            {/* Distress Visual Cues (Pulse) */}
            {(emotion === 'sad' || emotion === 'distressed' || emotion === 'vulnerable') && isIdle && !isJumping && speaker === "Sam" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-400/10 rounded-full animate-ping z-0 pointer-events-none" />
            )}

            {/* Dialogue Bubble */}
            {currentMessage && (
                <div className="absolute bottom-[140px] md:bottom-[160px] left-1/2 -translate-x-1/2 w-[85vw] md:w-auto md:min-w-[200px] md:max-w-[300px] bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 animate-fade-in z-50">
                    <p className={`text-xs md:text-sm font-bold text-slate-800 leading-relaxed ${textEffect === 'shake' ? 'shake text-orange-600' : ''}`}>
                        {currentMessage}
                    </p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
                </div>
            )}

            {/* The Character Rendered as SVG Image */}
            <div className={`stickman-asset-container ${animationClass}`}>
                <img
                    src={assetUrl}
                    alt={`${gender} stickman`}
                    className="w-[100px] h-[125px] select-none pointer-events-none drop-shadow-sm transition-opacity duration-200"
                    draggable="false"
                />
            </div>

            {!isJumping && !isCrouching && (
                <div className="text-center mt-2">
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">{speaker}</span>
                </div>
            )}
        </div>
    );
};

export default Stickman;
