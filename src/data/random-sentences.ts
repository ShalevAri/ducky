export const randomSentences = [
  '🦆 Avoiding breadcrumbs...',
  '🦆 Diving deep...',
  '🦆 Ducking slow searches...',
  '🦆 Encrypting quacks...',
  '🦆 optimizing feathers...',
  '🦆 Flapping wings...',
  '🦆 Fleeing search trackers...',
  '🦆 Going for a swim...',
  '🦆 Honking at the competition...',
  '🦆 Hunting down results...',
  '🦆 Leaving no feathers unturned!',
  '🦆 Off we go!',
  '🦆 On our way!',
  '🦆 One more quack for good luck...',
  '🦆 Paddling furiously...',
  '🦆 Searching under lily pads...',
  '🦆 Quacking up...',
  '🦆 Ruffling feathers...',
  '🦆 Searching for treasure...',
  '🦆 Searching the pond...',
  '🦆 Shaking off water...',
  '🦆 Splish splash...',
  '🦆 Surfing waves...'
]

export const getRandomSentence = (): string => {
  const index = Math.floor(Math.random() * randomSentences.length)
  return randomSentences[index]
}
