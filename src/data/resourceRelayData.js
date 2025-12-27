export const OBSTACLES = [
    {
        id: 'exams',
        text: "I cannot face my parents if I fail NEET. The pressure is too much.",
        weaknesses: ['hotline', 'counselor', 'textline'],
        sfx: 'anxious',
        stickman_emotion: 'distressed'
    },
    {
        id: 'reputation',
        text: "If people in our colony find out I'm seeing a doctor for 'nerves', our family's name is ruined.",
        weaknesses: ['textline', 'forum', 'hotline'],
        sfx: 'shy',
        stickman_emotion: 'scared'
    },
    {
        id: 'kerala_disha',
        text: "I need help but I only feel comfortable speaking in Malayalam. Who will understand me?",
        weaknesses: ['disha_kerala', 'hotline'],
        sfx: 'sad',
        stickman_emotion: 'vulnerable'
    },
    {
        id: 'harassment',
        text: "Someone is sharing my private photos online. I don't know who to trust.",
        weaknesses: ['cyber_cell', 'hotline'],
        sfx: 'panic',
        stickman_emotion: 'distressed'
    },
    {
        id: 'elderly_kerala',
        text: "My children are in Dubai. I am all alone in this big house with just my thoughts.",
        weaknesses: ['kudumbashree', 'hotline', 'disha_kerala'],
        sfx: 'tired',
        stickman_emotion: 'sad'
    }
];

export const PLAYER_CARDS = [
    {
        id: 'hotline',
        title: "KIRAN Helpline",
        type: "National",
        desc: "1800-599-0019. Free, 24/7 mental health support in 13 languages.",
        learn_info: "KIRAN is India's national 24/7 toll-free mental health rehabilitation helpline. It offers early screening, psychological support, and crisis management in 13 regional languages. It is managed by the Ministry of Social Justice and Empowerment.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'disha_kerala',
        title: "DISHA Kerala",
        type: "Local",
        desc: "Call 1056. Kerala's dedicated health helpline. Trusted and local.",
        learn_info: "DISHA (1056) is Kerala's 24-hour health helpline. It provides accurate health information, psychosocial support, and referral services. It is a vital link for Malayalis to access government health services and crisis intervention.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'counselor',
        title: "Trustworthy Teacher",
        type: "In-Person",
        desc: "A teacher or professor who can provide guidance and academic support.",
        learn_info: "In the Indian academic system, a trusted teacher can act as a bridge between students and parents. They can advocate for 'academic grace' and help navigate high-pressure exam cycles like NEET or JEE.",
        icon: "/stickman_assets/scholar_stickman.svg"
    },
    {
        id: 'textline',
        title: "AASRA Support",
        type: "Confidential",
        desc: "Expert crisis support for those feeling alone or suicidal.",
        learn_info: "AASRA is a non-profit organization that provides voluntary, professional, and confidential support to people who are suicidal or in deep emotional distress. They are pioneers in suicide prevention in India.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'cyber_cell',
        title: "Cyber Cell India",
        type: "Security",
        desc: "Report online harassment and protect your digital privacy.",
        learn_info: "The National Cyber Crime Reporting Portal (1930) allows Indian citizens to report digital harassment, stalking, and non-consensual image sharing anonymously. It is the primary legal resource for digital safety.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'kudumbashree',
        title: "Kudumbashree Network",
        type: "Community",
        desc: "Local community support system in Kerala for social and mental well-being.",
        learn_info: "Kudumbashree is the poverty eradication and women empowerment programme of Kerala. Their 'Snehitha' gender help desks provide short-stay facilities, counseling, and legal aid for women in crisis.",
        icon: "/stickman_assets/stickman_hands.svg"
    }
];
