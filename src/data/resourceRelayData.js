export const OBSTACLES = [
    {
        id: 'cost',
        text: "I can't afford therapy. It costs way too much.",
        weaknesses: ['counselor', 'hotline', 'textline', 'support_group'],
        sfx: 'sigh',
        stickman_emotion: 'worried'
    },
    {
        id: 'parents',
        text: "I don't want my parents to find out.",
        weaknesses: ['textline', 'hotline', 'forum'],
        sfx: 'anxious',
        stickman_emotion: 'scared'
    },
    {
        id: 'time',
        text: "It's 2 AM. Everyone is asleep.",
        weaknesses: ['hotline', 'textline', '911'],
        sfx: 'tired',
        stickman_emotion: 'tired'
    },
    {
        id: 'stranger',
        text: "It's too awkward to talk to a stranger face-to-face.",
        weaknesses: ['textline', 'forum'],
        sfx: 'shy',
        stickman_emotion: 'neutral'
    },
    {
        id: 'severe',
        text: "I think I might actually hurt myself right now.",
        weaknesses: ['911'],
        sfx: 'panic',
        stickman_emotion: 'distressed'
    },
    {
        id: 'alone',
        text: "No one understands what I'm going through.",
        weaknesses: ['support_group', 'forum'],
        sfx: 'sad',
        stickman_emotion: 'sad'
    }
];

export const PLAYER_CARDS = [
    {
        id: 'hotline',
        title: "988 Lifeline",
        type: "Phone",
        desc: "Call or text 988. Free, 24/7, Confidential. Available anywhere.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'counselor',
        title: "School Counselor",
        type: "In-Person",
        desc: "Specialized student support available on campus during hours.",
        icon: "/stickman_assets/scholar_stickman.svg"
    }
];
