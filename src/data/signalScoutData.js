export const SCENARIOS = [
    // --- YOUTH / STUDENTS (Academic Pressure & Cyber Issues) ---
    {
        id: 'y_crisis_1',
        text: "I can't face my parents if I fail the entrance exam again.",
        type: 'risk',
        category: 'Youth',
        clue: "Academic Shame",
        emoji: "📚"
    },
    {
        id: 'y_crisis_2',
        text: "Sharing my gaming account password. Won't be needing it anymore.",
        type: 'risk',
        category: 'Youth',
        clue: "Giving away prized possessions",
        emoji: "🎮"
    },
    {
        id: 'y_crisis_3',
        text: "Everyone would be happier if I just disappeared from this campus.",
        type: 'risk',
        category: 'Youth',
        clue: "Perceived Burdensomeness",
        emoji: "🏫"
    },
    {
        id: 'y_normal_1',
        text: "Ugh, this physics syllabus is huge! Gonna pull an all-nighter.",
        type: 'safe',
        category: 'Youth',
        clue: "Normal Academic Stress",
        emoji: "😮‍💨"
    },
    {
        id: 'y_normal_2',
        text: "My parents are annoying me about my phone usage.",
        type: 'safe',
        category: 'Youth',
        clue: "Normal Teen Conflict",
        emoji: "📱"
    },

    // --- ELDERLY (Isolation & Migration Impact) ---
    {
        id: 'e_crisis_1',
        text: "My children are all in Dubai. Not one interaction in weeks.",
        type: 'risk',
        category: 'Elderly',
        clue: "Severe Isolation",
        emoji: "✈️"
    },
    {
        id: 'e_crisis_2',
        text: "I've stopped taking my heart medicines. What's the use?",
        type: 'risk',
        category: 'Elderly',
        clue: "Passive Suicide / Neglect",
        emoji: "💊"
    },
    {
        id: 'e_crisis_3',
        text: "I am just a useless piece of furniture in this big house.",
        type: 'risk',
        category: 'Elderly',
        clue: "Loss of Purpose",
        emoji: "🏠"
    },
    {
        id: 'e_normal_1',
        text: "My knees hurt when it rains, getting old is tough.",
        type: 'safe',
        category: 'Elderly',
        clue: "Physical Complaint",
        emoji: "🌧️"
    },
    {
        id: 'e_normal_2',
        text: "Waiting for the grandkid's video call tonight!",
        type: 'safe',
        category: 'Elderly',
        clue: "Healthy Anticipation",
        emoji: "📹"
    },

    // --- MEN (Financial Debt & Substance) ---
    {
        id: 'm_crisis_1',
        text: "The 'Blade' lenders are coming. There's only one way to escape this debt.",
        type: 'risk',
        category: 'Men',
        clue: "Entrapment / Debt Crisis",
        emoji: "💸"
    },
    {
        id: 'm_crisis_2',
        text: "Drinking is the only way I can silence the noise in my head.",
        type: 'risk',
        category: 'Men',
        clue: "Substance as Coping",
        emoji: "bottle" // Will map to icon
    },
    {
        id: 'm_normal_1',
        text: "Business is slow this Onam season. Very stressful.",
        type: 'safe',
        category: 'Men',
        clue: "Financial Stress",
        emoji: "📉"
    },

    // --- WOMEN (Domestic & Social) ---
    {
        id: 'w_crisis_1',
        text: "I feel trapped in this kitchen. No one sees me, no one hears me.",
        type: 'risk',
        category: 'Women',
        clue: "Feeling Trapped",
        emoji: "🔒"
    },
    {
        id: 'w_crisis_2',
        text: "If I wasn't here, the family would have one less mouth to worry about.",
        type: 'risk',
        category: 'Women',
        clue: "Burdensomeness",
        emoji: "🍲"
    },
    {
        id: 'w_normal_1',
        text: "So much work for the wedding next week! I'm exhausted.",
        type: 'safe',
        category: 'Women',
        clue: "Event Stress",
        emoji: "💍"
    }
];
