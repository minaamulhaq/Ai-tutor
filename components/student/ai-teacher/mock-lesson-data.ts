import { TeachingStep, ChatMessage } from "./types";

export const LESSON_META = {
  subject: "Calculus & Analytical Geometry",
  unit: "Unit 3: Differential Calculus",
  topic: "Geometric Meaning of Derivatives & Instantaneous Velocity",
  tutorName: "Dr. Sophia Chen",
  tutorRole: "Senior AI Mathematics Fellow",
  tutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  studentName: "Sarah Jenkins",
  studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
};

export const TEACHING_STEPS: TeachingStep[] = [
  {
    id: 1,
    stepNumber: 1,
    title: "The Tangent Line Problem",
    subtitle: "From Average Rate of Change to Instantaneous Rate of Change",
    explanation:
      "In algebra, calculating the slope between two distinct points on a straight line is straightforward: m = (y₂ - y₁) / (x₂ - x₁). But what if our curve is constantly bending? How do we find the exact speed of a rocket at one frozen millisecond?",
    formula: "m_{secant} = \\frac{f(x + h) - f(x)}{h}",
    formulaBreakdown: [
      { symbol: "f(x + h) - f(x)", meaning: "Vertical rise: change in position Δy" },
      { symbol: "h", meaning: "Horizontal run: time elapsed Δx" },
      { symbol: "m_{secant}", meaning: "Average speed over interval [x, x+h]" },
    ],
    keyTakeaway:
      "A secant line slices through two points. As the gap between those points approaches zero, the secant line magically transforms into the tangent line.",
    diagramType: "tangent-graph",
    bulletPoints: [
      "Average speed requires two separate points in time.",
      "Instantaneous speed asks for the rate of change at a single moment.",
      "The tangent line touches the curve without crossing it locally.",
    ],
    aiSpeechTranscript:
      "Welcome Sarah! Today we solve calculus's founding puzzle: the tangent problem. Look at the curve on your board: notice how the dotted line connects two points...",
  },
  {
    id: 2,
    stepNumber: 2,
    title: "The Formal Limit Definition",
    subtitle: "Shrinking the Gap 'h' Towards Zero",
    explanation:
      "We cannot simply plug in h = 0, because dividing by zero is undefined! Calculus overcomes this by taking the limit as h gets infinitesimally close to 0 without actually being zero.",
    formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    formulaBreakdown: [
      { symbol: "f'(x)", meaning: "Derivative of f at point x (instantaneous slope)" },
      { symbol: "\\lim_{h \\to 0}", meaning: "Behavior as horizontal gap h shrinks to 0" },
      { symbol: "f(x+h)", meaning: "Value of the function slightly ahead of x" },
    ],
    keyTakeaway:
      "The derivative f'(x) gives the exact slope of the tangent line to the curve at any point (x, f(x)).",
    diagramType: "limit-definition",
    bulletPoints: [
      "h is the distance between the two sample points on the curve.",
      "When h → 0, the secant slope converges to the true instantaneous slope.",
      "This single limit unlocks physics, astronomy, and machine learning gradients.",
    ],
    aiSpeechTranscript:
      "Observe what happens when we slide 'h' down towards 0. Notice the blue secant line rotating until it seamlessly snaps into the orange tangent line!",
  },
  {
    id: 3,
    stepNumber: 3,
    title: "The Power Rule Shortcut",
    subtitle: "Differentiating Polynomials in Seconds",
    explanation:
      "Applying the limit definition every time is tedious. By proving the limit for f(x) = xⁿ, mathematicians discovered the universal Power Rule: pull down the exponent and subtract one.",
    formula: "\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}",
    formulaBreakdown: [
      { symbol: "n", meaning: "Multiply by the original exponent" },
      { symbol: "x^{n-1}", meaning: "Decrease the exponent power by exactly 1" },
      { symbol: "\\frac{d}{dx}", meaning: "Derivative operator with respect to x" },
    ],
    keyTakeaway:
      "For f(x) = x², the derivative is f'(x) = 2x. At x = 3, the instantaneous slope is exactly 2(3) = 6.",
    diagramType: "power-rule",
    bulletPoints: [
      "f(x) = x² → f'(x) = 2x",
      "f(x) = x³ → f'(x) = 3x²",
      "f(x) = 5x⁴ → f'(x) = 20x³",
    ],
    aiSpeechTranscript:
      "Instead of writing three lines of algebra for x², we drop the 2 to the front: 2 times x to the power of 1. Simple, elegant, and lightning fast.",
  },
  {
    id: 4,
    stepNumber: 4,
    title: "Interactive Concept Check",
    subtitle: "Apply What You've Learned to Instantaneous Motion",
    explanation:
      "A Tesla accelerates down a track with position function s(t) = 3t² meters (where t is seconds). What is its instantaneous velocity at t = 4 seconds?",
    formula: "v(t) = s'(t) = 6t \\implies v(4) = 6(4) = 24 \\text{ m/s}",
    formulaBreakdown: [
      { symbol: "s(t) = 3t²", meaning: "Position function in meters" },
      { symbol: "s'(t) = 6t", meaning: "Velocity function (derivative of position)" },
      { symbol: "24 m/s", meaning: "Exact speed at the 4-second mark (approx 86 km/h)" },
    ],
    keyTakeaway:
      "The derivative of position with respect to time is always velocity: v(t) = s'(t).",
    diagramType: "practice-problem",
    bulletPoints: [
      "Velocity is the rate of change of position.",
      "Acceleration is the derivative of velocity (s''(t)).",
      "Calculus allows autonomous vehicles to compute safe braking trajectories in real time.",
    ],
    aiSpeechTranscript:
      "Outstanding work, Sarah! Let's check your intuition on this physics challenge. Type your answer in the chat or let's work through the steps together.",
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "ai",
    senderName: "Dr. Sophia (AI Tutor)",
    text: "Hello Sarah! Today we're exploring the geometric foundation of derivatives. Feel free to stop me or ask questions anytime by typing or speaking!",
    timestamp: "10:00 AM",
    isAi: true,
  },
  {
    id: "m2",
    sender: "student",
    senderName: "Sarah J.",
    text: "Hi Dr. Sophia! I was a bit confused about why we can't just divide by zero when finding the slope at a single point.",
    timestamp: "10:01 AM",
  },
  {
    id: "m3",
    sender: "ai",
    senderName: "Dr. Sophia (AI Tutor)",
    text: "Great question! If you freeze time at t = 0, distance traveled is 0 and time elapsed is 0. 0/0 is an indeterminate form. That's why we use the limit definition: we get infinitely close without touching zero! Take a look at the slider on the board.",
    timestamp: "10:02 AM",
    isAi: true,
  },
];

export const SUGGESTED_QUESTIONS = [
  "Why is 0/0 undefined in slope formulas?",
  "Can you show the tangent slider again?",
  "How does this relate to machine learning gradients?",
  "What is the derivative of a constant like f(x) = 7?",
];

