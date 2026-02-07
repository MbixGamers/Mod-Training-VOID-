export const testQuestions = [
  {
    id: 1,
    scenario: "General Roster Inquiry",
    question: "A user creates a roster ticket with the message: 'I want to join the team, what should I do?'",
    task: "Compose your initial response as the handling moderator.",
    optimalResponse: "Hello! What's your age and how may I assist you today? Please review the requirements in 🎯┃how-to-join-roster and identify which category best fits your qualifications.",
    keywords: [
      "age",
      "hello",
      "hi",
      "greeting",
      "how-to-join",
      "requirements",
      "roster",
      "category",
      "qualifications",
      "review"
    ],
    avoid: "Immediate approval, vague directions, omitting age verification."
  },
  {
    id: 2,
    scenario: "Pro/Semi-Pro Application",
    question: "A user submits an application for Pro or Semi-Pro roster position.",
    task: "Outline your verification and escalation procedure.",
    optimalResponse: "Request Fortnite tracker and earnings verification. Validate authenticity. Ping @trapped or relevant senior staff for review. Maintain ticket until senior response.",
    keywords: [
      "fortnite",
      "tracker",
      "earnings",
      "verification",
      "verify",
      "ping",
      "staff",
      "senior",
      "review",
      "trapped"
    ],
    avoid: "Approving without verification"
  },
  {
    id: 3,
    scenario: "Academy Player Verification",
    question: "An Academy roster applicant meets PR requirements.",
    task: "Describe the onboarding workflow including representation requirements.",
    optimalResponse: "1) Verify Fortnite tracker authenticity and PR. 2) Request username change to include 'Void'. 3) Require 'team.void' item shop proof. 4) Photo verification. 5) Welcome and role assignment via senior staff ping.",
    keywords: [
      "verify",
      "tracker",
      "pr",
      "username",
      "void",
      "team.void",
      "item shop",
      "proof",
      "photo",
      "welcome",
      "role"
    ],
    avoid: "Skipping verification steps"
  },
  {
    id: 4,
    scenario: "Content Creator Application",
    question: "A user applies for Streamer or Content Creator position.",
    task: "Formulate your review and escalation process.",
    optimalResponse: "Confirm they meet follower/viewer requirements. Request social media links. Ping @content department for evaluation. Instruct applicant to await department review.",
    keywords: [
      "follower",
      "viewer",
      "requirements",
      "social media",
      "links",
      "ping",
      "content",
      "department",
      "evaluation",
      "review",
      "await"
    ],
    avoid: "Immediate approval without content department review"
  },
  {
    id: 5,
    scenario: "GFX/VFX Portfolio Review",
    question: "A GFX/VFX applicant submits their portfolio.",
    task: "Detail the verification and escalation steps.",
    optimalResponse: "Request portfolio and proof of work. Assess quality and resolution requirements. Ping @gfx-vfx lead for technical evaluation. Notify applicant of pending review.",
    keywords: [
      "portfolio",
      "proof",
      "work",
      "quality",
      "resolution",
      "ping",
      "gfx",
      "vfx",
      "lead",
      "evaluation",
      "review",
      "pending"
    ],
    avoid: "Approving without technical evaluation"
  },
  {
    id: 6,
    scenario: "Creative Roster Submission",
    question: "A Creative roster applicant provides freebuilding clips.",
    task: "Specify the review requirements and escalation.",
    optimalResponse: "Minimum two freebuilding clips demonstrating mechanics and uniqueness. Ping @creativedepartment for skill assessment. Inform applicant of review timeline.",
    keywords: [
      "two",
      "clips",
      "freebuilding",
      "mechanics",
      "unique",
      "ping",
      "creative",
      "department",
      "assessment",
      "skill",
      "timeline",
      "review"
    ],
    avoid: "Accepting without creative department assessment"
  },
  {
    id: 7,
    scenario: "Grinder Application Processing",
    question: "A Grinder applicant seeks representation.",
    task: "Outline the username and verification requirements.",
    optimalResponse: "Discord and Fortnite username must include 'Void'. Proof of 'team.void' item shop usage required. Verification via screenshot before role assignment.",
    keywords: [
      "discord",
      "fortnite",
      "username",
      "void",
      "team.void",
      "item shop",
      "proof",
      "screenshot",
      "verification",
      "role"
    ],
    avoid: "Skipping username verification"
  }
];

export const checkAnswer = (questionId, userAnswer) => {
  const question = testQuestions.find(q => q.id === questionId);
  if (!question) return false;
  
  const normalizedAnswer = userAnswer.toLowerCase();
  const matchedKeywords = question.keywords.filter(keyword => 
    normalizedAnswer.includes(keyword.toLowerCase())
  );
  
  const matchPercentage = (matchedKeywords.length / question.keywords.length) * 100;
  return matchPercentage >= 30;
};