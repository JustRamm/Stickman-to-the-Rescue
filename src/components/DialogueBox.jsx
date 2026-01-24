import React, { useState } from 'react';

const DialogueBox = ({ node, onSelectOption, foundClues = [], requiredResource = null, requiredResourceName = null, selectedResource = null, isWalletOpen = false }) => {
    const [hoveredOption, setHoveredOption] = useState(null);
    const options = node?.options || [];

    // Filter and Shuffle options based on found clues
    const visibleOptions = React.useMemo(() => {
        if (!options || options.length === 0) return [];
        const filtered = options.filter(option =>
            !option.required_clue || foundClues.includes(option.required_clue)
        );
        // Fisher-Yates Shuffle
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        return filtered;
    }, [options, foundClues]);

    if (!options || options.length === 0 || (visibleOptions.length === 0 && !requiredResource)) return null;

    const isCorrectResource = selectedResource === requiredResource;

    return (
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 animate-slide-up z-[60] transition-all duration-500 ease-in-out dialogue-box-container ${isWalletOpen ? 'left-[35%]' : 'left-1/2'}`}>
            <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border ${requiredResource ? 'border-orange-400' : 'border-white/50'} space-y-3`}>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-2 text-center flex items-center justify-center gap-2">
                    {requiredResource ? (
                        <span className="text-orange-600 animate-pulse flex items-center gap-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            MISSION FINAL STEP: PROFESSIONAL REFERRAL
                        </span>
                    ) : (
                        <>Your Response {foundClues.length > 0 && <span className="text-orange-500 ml-2">(+ {foundClues.length} CLUES)</span>}</>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                    {requiredResource ? (
                        /* Unified Single Referral Button */
                        <button
                            onClick={() => {
                                if (isCorrectResource) {
                                    {/* Find the success option that leads to success_end or success_tutorial */ }
                                    const successOption = options.find(o => o.next?.includes('success')) || options[0];
                                    onSelectOption(successOption);
                                }
                            }}
                            className={`group relative w-full text-center p-6 rounded-2xl transition-all duration-300 border-2 flex flex-col items-center gap-2
                                ${isCorrectResource
                                    ? 'bg-teal-500 border-teal-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:scale-[1.02] active:scale-95'
                                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center p-2 mb-1">
                                <img
                                    src={isCorrectResource ? '/stickman_assets/hope_stickman.svg' : '/stickman_assets/shield_stickman.svg'}
                                    className="w-full h-full filter brightness-0 invert"
                                    alt=""
                                />
                            </div>
                            <span className="text-lg font-black uppercase tracking-widest text-inherit">
                                {isCorrectResource
                                    ? `Authorize Referral to ${requiredResourceName}`
                                    : `Select ${requiredResourceName} from Toolkit`}
                            </span>
                            {!isCorrectResource && (
                                <span className="text-[9px] font-bold opacity-60 italic">
                                    (Look at the toolkit drawer on the right)
                                </span>
                            )}
                        </button>
                    ) : (
                        /* Standard Multiple Response Options */
                        visibleOptions.map((option, index) => (
                            <button
                                key={index}
                                onMouseEnter={() => setHoveredOption(index)}
                                onMouseLeave={() => setHoveredOption(null)}
                                onClick={() => onSelectOption(option)}
                                className={`group relative w-full text-left p-4 bg-white/50 border border-slate-100 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 ${option.required_clue ? 'border-teal-200 bg-teal-50/50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-slate-300 group-hover:text-teal-500">
                                        {index + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold leading-tight text-slate-600 group-hover:text-slate-900 flex items-center gap-2">
                                            {option.required_clue && (
                                                <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            )}
                                            {option.text}
                                        </span>
                                    </div>
                                </div>

                                {hoveredOption === index && option.inner_thought && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl animate-fade-in hidden md:block">
                                        <span className="text-teal-400 mr-2">INTENT:</span>
                                        {option.inner_thought}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DialogueBox;
