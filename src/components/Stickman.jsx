import React from 'react';

const Stickman = ({
    emotion,
    speaker,
    position = { x: 50, y: 70 },
    isWalking = false,
    isJumping = false,
    isCrouching = false,
    isSitting = false,
    isPhoneChecking = false,
    currentMessage = null,
    textEffect = null,
    gender = 'guy',
    moveDir = 0,
    theme = 'park',
    trust = 50,
    action = 'idle',
    textSpeed = 50,
    scale = 1,
    noWrapper = false
}) => {
    const isNPC = ['Alex', 'Grace', 'David', 'Jessica', 'Raj', 'Stranger'].includes(speaker);
    const isIdle = !isWalking && !isJumping && !isCrouching && !isSitting && !isPhoneChecking && (action === 'idle' || action === 'phone' || action === 'sitting');
    const isLowTrust = trust < 30;
    const [displayedText, setDisplayedText] = React.useState('');

    // Typewriter effect
    React.useEffect(() => {
        if (!currentMessage) {
            setDisplayedText('');
            return;
        }

        if (textSpeed === 0) {
            setDisplayedText(currentMessage);
            return;
        }

        let i = 0;
        setDisplayedText('');
        const timer = setInterval(() => {
            setDisplayedText(currentMessage.substring(0, i + 1));
            i++;
            if (i >= currentMessage.length) clearInterval(timer);
        }, textSpeed);

        return () => clearInterval(timer);
    }, [currentMessage, textSpeed]);

    // Determine which SVG to use
    const getAssetUrl = () => {
        if (isNPC) {
            // Use NPC-specific SVG from /npc folder
            return `/npc/${speaker.toLowerCase()}.svg`;
        }

        // Default player character assets
        const base = `/stickman_assets/${gender}`;

        if (isJumping) return `${base}_jump.svg`;
        if (isCrouching) return `${base}_crouch.svg`;
        if (isSitting) return `${base}_crouch.svg`; // Fallback to crouch for sitting pose
        if (isPhoneChecking) return `${base}_idle.svg`; // Fallback to idle
        if (isWalking) {
            if (moveDir === -1) return `${base}_walk_left.svg`;
            return `${base}_walk_right.svg`;
        }
        if (emotion === 'distressed' || emotion === 'sad') return `${base}_distressed.svg`;

        return `${base}_idle.svg`;
    };

    const assetUrl = getAssetUrl();

    // Visual classes for different states
    const animationClass = (isWalking || action === 'pacing') ? 'animate-stickman-walk' :
        (isJumping ? 'animate-stickman-jump' :
            ((emotion === 'distressed' || emotion === 'sad' || emotion === 'vulnerable') ? 'animate-stickman-shiver' : ''));

    // Determine if we should use light or dark theme for the stickman silhouette
    const isDarkTheme = ['office', 'rainy_street', 'bridge_night'].includes(theme) ||
        (theme === 'park' && isLowTrust);

    // Special case for campus: it's light daytime, but has dark buildings. 
    // We'll use a strong shadow to ensure visibility against both sky and brick.
    const stickmanFilter = isDarkTheme
        ? 'brightness(0) invert(1) drop-shadow(0 0 5px rgba(255,255,255,0.8))'
        : (theme === 'campus'
            ? 'drop-shadow(0 0 1px white) drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            : 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))');

    return (
        <div
            className={`${noWrapper ? 'relative' : 'absolute stickman-anchor'} transition-all duration-300 ${isIdle && !animationClass ? 'animate-idle-sway' : ''}`}
            style={{
                left: noWrapper ? undefined : `${position.x}%`,
                top: noWrapper ? undefined : `${position.y}%`,
                zIndex: isJumping ? 100 : 20,
                transform: `scale(${scale})`,
                transformOrigin: 'bottom center',
                transition: isWalking || action === 'pacing' ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out'
            }}
        >
            {/* Distress Visual Cues (Pulse) */}
            {(emotion === 'sad' || emotion === 'distressed' || emotion === 'vulnerable') && isIdle && !isJumping && (
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full animate-ping z-0 pointer-events-none ${isDarkTheme ? 'bg-white/10' : 'bg-orange-400/10'}`} />
            )}

            {/* Phone Glow Effect */}
            {(isPhoneChecking || action === 'phone') && (
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-400/30 blur-md rounded-full animate-pulse z-0 pointer-events-none" />
            )}

            {/* Dialogue Bubble */}
            {currentMessage && (
                <div
                    className={`absolute bottom-[130px] md:bottom-[160px] w-[60vw] md:w-auto md:min-w-[200px] md:max-w-[280px] bg-white p-3 md:p-4 rounded-2xl shadow-xl border-2 border-slate-100 animate-fade-in z-50
                    ${position.x < 50 ? 'left-0 origin-bottom-left rounded-bl-none' : 'right-0 origin-bottom-right rounded-br-none'}
                    `}
                >
                    <p className={`text-[11px] md:text-sm font-bold text-slate-800 leading-snug md:leading-relaxed ${textEffect === 'shake' ? 'shake text-orange-600' : ''}`}>
                        {displayedText}
                    </p>
                    {/* Tail */}
                    <div className={`absolute -bottom-2 w-4 h-4 bg-white border-b border-r border-slate-100
                        ${position.x < 50 ? 'left-0 border-l border-t-0 border-b-2 border-r-0' : 'right-0 border-r-2 border-b-2'}
                        `}
                        style={{ clipPath: position.x < 50 ? 'polygon(0 0, 0% 100%, 100% 100%)' : 'polygon(100% 0, 0 100%, 100% 100%)' }}
                    />
                </div>
            )}

            {/* The Character Rendered as SVG Image */}
            <div className={`stickman-asset-container transition-transform duration-1000 ${animationClass} ${isIdle && !animationClass ? 'animate-breathing scale-[1.02]' : ''}`}
                style={{ filter: stickmanFilter }}
            >
                <img
                    src={assetUrl}
                    alt={`${gender} stickman`}
                    className="w-[100px] h-[125px] select-none pointer-events-none transition-opacity duration-200"
                    draggable="false"
                />
            </div>

            {!isJumping && !isCrouching && (
                <div className="text-center mt-2">
                    <span className="stickman-name-label text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">{speaker}</span>
                </div>
            )}
        </div>
    );
};

export default Stickman;
