export const randomSentences = [
  'Just a moment, taking you there...',
  'Loading your request...',
  'Finding the best results for you...',
  'Quack! Redirecting...',
  'Connecting to the web...',
  'Searching for treasure...',
  'Ducking to your destination...',
  'Almost there...',
  'Just a quick swim...',
  'Flapping our wings...',
  'Preparing for landing...',
  'Off we go!',
  'Fetching what you need...',
  'On our way!',
  'Paddling through the internet...',
  'Getting things ready...',
  'Hunting down results...',
  'Flying to your destination...',
  'Diving into the web...',
  'Ducky on a mission...'
]

export const getRandomSentence = (): string => {
  const index = Math.floor(Math.random() * randomSentences.length)
  return randomSentences[index]
}
