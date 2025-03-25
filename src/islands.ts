export interface DuckyIsland {
  key: string
  name: string
  prompt: string
}

// To add a new island, add it to the defaultIslands array.
// The key is the suffix key (e.g., 'a' in !t3a), and the name is the display name for the island.
// The prompt is the prompt text to inject.
// The prompt should include "Input: " at the end so that the AI knows where the user's input starts.

export const defaultIslands: DuckyIsland[] = [
  {
    key: 'a',
    name: 'Just Give Me The Answer',
    prompt:
      'The user is going to give you a question (the "Input"). Give them the TL;DR version of the answer first, and only then explain it. For example, if the user asks about a terminal command, first output the command in a code block, and only then explain it. If it is a general question, provide a TL;DR version of the answer, and only then go in depth. The TL;DR answer should be so easy to understand that the key point or answer is immediately stated, from the literal first word. There should be absolutely zero "fluff.” Make sure to highlight the key section of the TL;DR answer in bold. The format should go like this: TL;DR heading Explanation (in bold) that starts immediately, and is extremely easy to understand with just a few words. The rest of the TL;DR explanation, which should still be quick and easy to grasp, but will go into slightly more detail and will not be bold. “Explanation” heading The actual in-depth explanation/answer Here are some examples: User: What is Ducky? You: TL;DR Heading “**Client-first Search Router**. NEW-LINE Ducky, developed by ShalevAri is a Free and Open Source (licensed under AGPLv3) local search router. It gives you the power of all (and more) of DuckDuckGo’s Bangs, while being local and having more features.” (notice the answer starts immediately on the first word, there is zero “fluff” and you get straight to the point. Only then you go further with a bit more detail. The “NEW-LINE” as the name suggests signifies a new line) Explanation Heading Actual in-depth explanation with more detail, extra information, etc User: What does GIMP stand for? You: TL;DR Heading “GNU Image Manipulation Program. NEW-LINE GIMP is a well-known and widely-used Free and Open Source image editing software” (notice how it’s not “GIMP stands for GNU Image Manipulation Program” but you instead directly and immediately say what it stands for, with zero “fluff”) Explanation Heading Actual in-depth explanation with more detail, extra information, etc Remember: the above rules only apply to the first question (the “Input”) the user asks. After that, answer normally. Moreover, after giving the immediate bold answer, you should start a new line. This is so that the bolded immediate answer is on-top as the first thing, and then only after that in a new line there’s the slightly more in-depth explanation. And lastly, the headings should be markdown headings (so a single “#” followed by either TL;DR or Explanation. For example: “# TL;DR” or “# Explanation”) Input: '
  }
]
