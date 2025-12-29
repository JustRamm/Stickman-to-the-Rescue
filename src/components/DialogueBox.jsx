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
        <div className={`absolute bottom-2 md:bottom-10 left-1/2 -translate-x-1/2 w-[96%] md:w-full max-w-2xl px-1 md:px-6 animate-slide-up z-[60] transition-all duration-500 ease-in-out ${isWalletOpen ? 'md:left-[35%]' : 'md:left-1/2'}`}>
            <div className={`bg-white/80 backdrop-blur-md rounded-xl md:rounded-3xl p-2 md:p-6 shadow-2xl border ${requiredResource ? 'border-orange-400' : 'border-white/50'} space-y-1.5 md:space-y-3`}>
                <div className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-0.5 md:mb-2 text-center flex items-center justify-center gap-2">
                    {requiredResource ? (
                        <span className="text-orange-600 animate-pulse">🔒 MISSION FINAL STEP: PROFESSIONAL REFERRAL</span>
                    ) : (
                        <>Your Response {foundClues.length > 0 && <span className="text-orange-500 ml-1 md:ml-2">(+ {foundClues.length} CLUES)</span>}</>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-1.5 md:gap-3 max-h-[35vh] md:max-h-[40vh] overflow-y-auto pr-0.5 md:pr-1">
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
                            className={`group relative w-full text-center p-4 md:p-6 rounded-lg md:rounded-2xl transition-all duration-300 border-2 flex flex-col items-center gap-2
                                ${isCorrectResource
                                    ? 'bg-teal-500 border-teal-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:scale-[1.02] active:scale-95'
                                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <span className="text-2xl md:text-3xl">{isCorrectResource ? '✅' : '🛡️'}</span>
                            <span className="text-sm md:text-lg font-black uppercase tracking-widest text-inherit">
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
                                className={`group relative w-full text-left p-2 md:p-4 bg-white/50 border border-slate-100 rounded-lg md:rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 ${option.required_clue ? 'border-teal-200 bg-teal-50/50' : ''}`}
                            >
                                <div className="flex items-center gap-2 md:gap-4">
                                    <span className="text-[9px] md:text-[10px] font-black text-slate-300 group-hover:text-teal-500">
                                        {index + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] md:text-sm font-bold leading-tight text-slate-600 group-hover:text-slate-900 flex items-center gap-2">
                                            {option.required_clue && <span title="Key Insight Found">🔍</span>}
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
