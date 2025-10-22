import React from 'react';

interface PromptIdeasProps {
  onSelectIdea: (idea: string) => void;
}

const ideas = [
  'Change my shirt to a red jacket',
  'Add a superhero cape',
  'Make the background a cyberpunk city',
  'Turn me into a game character',
  'Surprised face with exploding background',
  'Add glowing text: "INSANE!"',
  'Clone MrBeast thumbnail style',
  'A dragon reading a book',
];

export const PromptIdeas: React.FC<PromptIdeasProps> = ({ onSelectIdea }) => {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-slate-400 mb-2">Need ideas? Try one of these:</h4>
      <div className="flex flex-wrap gap-2">
        {ideas.map((idea, index) => (
          <button
            key={index}
            onClick={() => onSelectIdea(idea)}
            className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full hover:bg-slate-700 hover:text-white transition-colors"
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
};