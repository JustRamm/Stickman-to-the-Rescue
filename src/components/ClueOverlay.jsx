import React from 'react';
import { CLUE_DETAILS } from '../data/gameData';

const ClueOverlay = ({ viewedClue, onClose }) => {
    if (!viewedClue) return null;

    const data = CLUE_DETAILS[viewedClue.id];
    const { visualType, title, description } = data;

    const renderClueContent = () => {
        switch (visualType) {
            case 'photo':
                return (
                    <div className="relative group perspective-1000">
                        <div className="bg-white p-4 pb-12 shadow-2xl transform rotate-1 transition-transform hover:rotate-0 border-8 border-white rounded-sm w-[300px] md:w-[400px]">
                            <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden rounded-sm mb-4">
                                {/* Stylized Photo Image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-amber-500/20 opacity-60" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2">
                                    <div className="w-12 h-20 bg-slate-400/40 rounded-t-full" /> {/* Grace */}
                                    <div className="w-8 h-12 bg-slate-400/30 rounded-t-full" />  {/* Child 1 */}
                                    <div className="w-8 h-12 bg-slate-400/30 rounded-t-full" />  {/* Child 2 */}
                                </div>
                                <div className="absolute inset-0 border-4 border-white/30" />
                            </div>
                            <p className="font-handwriting text-slate-700 text-lg md:text-xl text-center rotate-[-1deg]">
                                "We love you Mom!"
                            </p>
                            <div className="absolute top-2 right-2 flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-black/5" />
                                <div className="w-2 h-2 rounded-full bg-black/5" />
                            </div>
                        </div>
                        {/* Highlighting the Clue Text below the photo */}
                        <div className="mt-8 bg-slate-900/40 backdrop-blur-md p-4 rounded-xl text-white text-center max-w-sm border border-white/10">
                            <p className="text-sm italic font-medium opacity-90">{description}</p>
                        </div>
                    </div>
                );

            case 'official_letter':
                return (
                    <div className="bg-white w-[320px] md:w-[500px] shadow-2xl p-8 md:p-12 relative border-t-[12px] border-slate-900 overflow-hidden">
                        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Human Resources</h4>
                                <div className="w-16 h-4 bg-slate-100" />
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Confidential</h4>
                                <div className="w-12 h-4 bg-slate-100 ml-auto" />
                            </div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Termination Notice</h3>
                        <div className="space-y-4 mb-12">
                            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-serif whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-100 pt-8 opacity-40">
                            <div className="w-24 h-8 bg-slate-100 rounded-sm" />
                            <div className="w-32 h-6 bg-slate-200 rounded-sm" />
                        </div>
                        {/* Stamp Effect */}
                        <div className="absolute top-24 right-8 w-24 h-24 border-4 border-red-500/20 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
                            <span className="text-[10px] text-red-500/20 font-black uppercase text-center leading-none">VOID<br />REF: 88-V</span>
                        </div>
                    </div>
                );

            case 'grade_report':
                return (
                    <div className="bg-sky-50 w-[320px] md:w-[550px] shadow-2xl p-6 md:p-10 border-4 border-sky-200 relative">
                        <div className="bg-indigo-900 -mx-6 md:-mx-10 -mt-6 md:-mt-10 p-4 mb-8 flex justify-between items-center text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">University Registrar</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Spring Term 2025</span>
                        </div>
                        <div className="border-b-2 border-slate-200 pb-2 mb-6">
                            <h3 className="text-2xl font-black text-slate-800">Academic Probation Notice</h3>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-inner border border-sky-100 mb-8">
                            <p className="text-slate-700 text-sm md:text-lg leading-relaxed italic">
                                "{description}"
                            </p>
                            <div className="mt-6 flex items-center gap-4">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl font-black border-4 border-red-200 shadow-lg">F</div>
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cumulative GPA: 1.2</div>
                            </div>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-sky-400">Digital Signature Hash: 7fb832...</div>
                    </div>
                );

            case 'envelope':
                return (
                    <div className="relative">
                        {/* Background Envelope Flap */}
                        <div className="absolute inset-0 bg-amber-100 translate-x-2 translate-y-2 rounded-lg -rotate-1 pointer-events-none opacity-50" />
                        <div className="bg-[#fefce8] w-[320px] md:w-[480px] shadow-2xl p-8 relative border border-amber-200 rounded-lg overflow-hidden group">
                            {/* Mud Stains */}
                            <div className="absolute bottom-2 right-4 w-12 h-8 bg-amber-900/10 rounded-full blur-md" />
                            <div className="absolute top-4 left-10 w-20 h-12 bg-amber-900/5 rounded-full blur-xl" />

                            <div className="flex justify-between items-start mb-10">
                                <div className="w-20 h-12 border-2 border-amber-900/20 flex items-center justify-center opacity-30">
                                    <span className="text-[8px] font-black text-amber-900/50 uppercase">POSTAGE PAID</span>
                                </div>
                                <div className="text-right">
                                    <div className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm animate-pulse shadow-lg">Final Notice</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-10">
                                <div className="w-32 h-3 bg-amber-900/10 rounded-full" />
                                <div className="w-48 h-3 bg-amber-900/10 rounded-full" />
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-sm border border-red-200">
                                <p className="text-red-900 text-sm md:text-base font-bold leading-relaxed serif underline decoration-red-900/30">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'tutorial':
            default:
                return (
                    <div className="bg-teal-600 text-white w-[300px] md:w-[400px] shadow-2xl p-8 rounded-3xl relative border-4 border-white/20">
                        <div className="absolute -top-6 -left-6 w-16 h-16 bg-white text-teal-600 rounded-full flex items-center justify-center text-3xl shadow-xl border-4 border-teal-500">🔍</div>
                        <h3 className="text-2xl font-black uppercase tracking-widest mb-4">{title}</h3>
                        <p className="text-teal-50 text-base md:text-lg leading-relaxed font-medium">
                            {description}
                        </p>
                        <div className="mt-8 pt-6 border-t border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Objective: Gather Context</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in"
            onClick={onClose}
        >
            <div className="relative animate-scale-in" onClick={e => e.stopPropagation()}>
                {renderClueContent()}

                {/* Shared "Collect" Action */}
                <button
                    onClick={onClose}
                    className="w-full group/btn relative mt-8 py-5 bg-white text-slate-900 rounded-2xl overflow-hidden transition-all active:scale-95 shadow-2xl"
                >
                    <div className="absolute inset-0 w-full h-full bg-teal-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 group-hover/btn:text-white transition-colors">
                        <span className="text-xl group-hover/btn:rotate-12 transition-transform">✅</span> Add to Case File
                    </span>
                </button>
                <p className="text-center text-white/40 text-[9px] font-black uppercase tracking-widest mt-4">Tap anywhere to discard</p>
            </div>
        </div>
    );
};

export default ClueOverlay;
