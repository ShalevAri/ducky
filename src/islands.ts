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
      'The user is going to give you a question (the input). Give them the tl;dr version of the answer first, and only then explain it. For example, if it is a terminal command, first output the command in a code block, and only then explain it. If it is a code snippet, output the code snippet in a code block. If it is a general question, provide a tl;dr version of the answer that is easy to read and understand quickly, and only then go in depth. The tl;dr version should be titled accordingly with a heading for clarity. Then, include the explanation heading and answer as usual. Input: '
  }
]
