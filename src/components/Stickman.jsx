import React from 'react';

const Stickman = ({ emotion, speaker, position = { x: 50, y: 70 }, isWalking = false, isJumping = false, isCrouching = false, currentMessage = null, textEffect = null }) => {
    const isIdle = !isWalking && !isJumping && !isCrouching;

    // Define postures for different emotions and movement
    const getPostures = (emo, walk, jump, crouch) => {
        const walkOffset = walk ? Math.sin(Date.now() / 100) * 10 : 0;
        const legOffset = walk ? Math.sin(Date.now() / 100) * 20 : 0;
        const idleOffset = isIdle ? Math.sin(Date.now() / 500) * 3 : 0;

        // Base geometry
        let headY = 60 + idleOffset;
        let bodyPath = `M50,${60 + idleOffset} L50,${110}`;
        let armsPath = `M30,${90 + idleOffset} L50,${80 + idleOffset} L70,${90 + idleOffset}`;
        let legsPath = "M30,140 L50,110 L70,140";

        if (crouch) {
            headY = 90;
            bodyPath = "M50,90 L50,120";
            armsPath = "M30,105 L50,100 L70,105";
            legsPath = "M20,140 L50,120 L80,140";
        } else if (jump) {
            headY = 50;
            bodyPath = "M50,50 L50,100";
            armsPath = "M20,60 L50,70 L80,60";
            legsPath = "M35,120 L50,100 L65,120";
        } else if (walk) {
            headY = 60 + walkOffset / 4;
            bodyPath = `M50,${60 + walkOffset / 4} L50,${110 + walkOffset / 4}`;
            armsPath = `M${30 + legOffset / 2},90 L50,${80 + walkOffset / 4} L${70 - legOffset / 2},90`;
            legsPath = `M${30 + legOffset},140 L50,110 L${70 - legOffset},140`;
        } else {
            // Emotion overrides
            switch (emo) {
                case 'sad':
                    headY = 65 + idleOffset;
                    bodyPath = `M50,${65 + idleOffset} L50,110`;
                    armsPath = `M35,${100 + idleOffset} L50,${80 + idleOffset} L65,${100 + idleOffset}`;
                    legsPath = "M40,140 L50,110 L60,140";
                    break;
                case 'vulnerable':
                    headY = 75 + idleOffset;
                    bodyPath = `M50,${75 + idleOffset} L50,110`;
                    armsPath = `M35,${100 + idleOffset} L50,${85 + idleOffset} L65,${100 + idleOffset}`;
                    legsPath = "M40,140 L50,110 L60,140";
                    break;
                case 'frustrated':
                    headY = 60 + idleOffset;
                    bodyPath = `M50,${60 + idleOffset} L50,110`;
                    armsPath = `M20,${70 + idleOffset} L50,${80 + idleOffset} L80,${70 + idleOffset}`;
                    legsPath = "M30,140 L50,110 L70,140";
                    break;
            }
        }

        return { headY, bodyPath, armsPath, legsPath };
    };

    const [, setTick] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 50);
        return () => clearInterval(interval);
    }, []);

    const posture = getPostures(emotion, isWalking, isJumping, isCrouching);

    return (
        <div
            className={`absolute stickman-wrapper transition-all ${isJumping ? 'duration-500 ease-out' : 'duration-300'} ${isIdle ? 'animate-idle-sway' : ''}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `translate(-50%, ${isJumping ? '-150%' : '-100%'}) scale(${isCrouching ? '0.8, 0.6' : '1'})`,
                zIndex: isJumping ? 100 : 20
            }}
        >
            {/* Dialogue Bubble */}
            {currentMessage && (
                <div className="absolute bottom-[140px] md:bottom-[160px] left-1/2 -translate-x-1/2 w-[85vw] md:w-auto md:min-w-[200px] md:max-w-[300px] bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 animate-fade-in z-50">
                    <p className={`text-xs md:text-sm font-bold text-slate-800 leading-relaxed ${textEffect === 'shake' ? 'shake text-orange-600' : ''}`}>
                        {currentMessage}
                    </p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
                </div>
            )}

            <svg width="120" height="150" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy={posture.headY - 20} r="15" stroke="currentColor" strokeWidth="3" fill="none" />
                <path d={posture.bodyPath} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d={posture.armsPath} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d={posture.legsPath} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>

            {!isJumping && !isCrouching && (
                <div className="text-center mt-2">
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">{speaker}</span>
                </div>
            )}
        </div>
    );
};

export default Stickman;
