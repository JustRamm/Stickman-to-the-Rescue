import React, { useState } from 'react';

const DialogueBox = ({ options, onSelect, foundClues = [] }) => {
    const [hoveredOption, setHoveredOption] = useState(null);

    if (!options || options.length === 0) return null;

    // Filter and Shuffle options based on found clues
    const visibleOptions = React.useMemo(() => {
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

    return (
        <div className="absolute bottom-2 md:bottom-10 left-1/2 -translate-x-1/2 w-[96%] md:w-full max-w-2xl px-1 md:px-6 animate-slide-up z-[60]">
            <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-3xl p-2 md:p-6 shadow-2xl border border-white/50 space-y-1.5 md:space-y-3">
                <div className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-0.5 md:mb-2 text-center">
                    Your Response {foundClues.length > 0 && <span className="text-orange-500 ml-1 md:ml-2">(+ {foundClues.length} CLUES)</span>}
                </div>
                <div className="grid grid-cols-1 gap-1.5 md:gap-3 max-h-[35vh] md:max-h-[40vh] overflow-y-auto pr-0.5 md:pr-1">
                    {visibleOptions.map((option, index) => (
                        <button
                            key={index}
                            onMouseEnter={() => setHoveredOption(index)}
                            onMouseLeave={() => setHoveredOption(null)}
                            onClick={() => onSelect(option)}
                            className="group relative w-full text-left p-2 md:p-4 bg-white/50 border border-slate-100 rounded-lg md:rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 md:gap-4">
                                <span className="text-[9px] md:text-[10px] font-black text-slate-300 group-hover:text-teal-500">
                                    {index + 1}
                                </span>
                                <span className={`text-[10px] md:text-sm font-bold group-hover:text-slate-900 leading-tight ${option.required_clue ? 'text-teal-700' : 'text-slate-600'}`}>
                                    {option.required_clue && <span className="mr-1 md:mr-2">🔍</span>}
                                    {option.text}
                                </span>
                            </div>

                            {hoveredOption === index && option.inner_thought && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl animate-fade-in hidden md:block">
                                    <span className="text-teal-400 mr-2">INTENT:</span>
                                    {option.inner_thought}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DialogueBox;
