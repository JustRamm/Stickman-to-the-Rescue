import React from 'react';

const ResourceWallet = ({ isOpen, resources, onSelectResource, selectedResource }) => {
    return (
        <div className={`resource-wallet ${isOpen ? 'open' : ''} shadow-[-10px_0_30px_rgba(0,0,0,0.03)]`}>
            <h3 className="text-[10px] uppercase gap-2 flex items-center tracking-[0.3em] font-black text-slate-400 mb-8 border-b border-slate-50 pb-4">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                RESOURCE TOOLKIT
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar">
                {resources.map((resource) => {
                    let icon = '📋';
                    if (resource.name.includes('Crisis')) icon = '🆘';
                    else if (resource.name.includes('Therapist')) icon = '🧠';
                    else if (resource.name.includes('Friend')) icon = '🤝';
                    else if (resource.name.includes('Counselor')) icon = '🛡️';

                    const isSelected = selectedResource === resource.name;

                    return (
                        <div
                            key={resource.id}
                            onClick={() => onSelectResource(resource.name)}
                            className={`resource-card group relative p-4 rounded-xl transition-all duration-300 border-2 cursor-pointer
                                ${isSelected
                                    ? 'bg-teal-50 border-teal-500 shadow-lg scale-[1.02]'
                                    : 'bg-white border-slate-100 hover:border-teal-200 hover:shadow-md'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0
                                    ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                                            {resource.name}
                                        </h4>
                                        {isSelected && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-[10px] leading-relaxed font-medium ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                                        {resource.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-[9px] text-slate-500 font-bold italic text-center leading-normal">
                        "Your toolkit contains all the resources needed to save a life. Choose wisely."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResourceWallet;
