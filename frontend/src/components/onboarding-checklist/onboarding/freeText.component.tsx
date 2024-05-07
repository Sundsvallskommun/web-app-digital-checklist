import { ChangeEvent, FC, useState } from 'react';

interface FreeTextProps {
  initialText?: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTextChange: (text: string) => void;
}

const FreeText: FC<FreeTextProps> = ({ initialText = '', onTextChange, handleInputChange }) => {
  const [text, setText] = useState<string>(initialText || '');

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTextChange(e.target.value);
    handleInputChange(e);
  };

  return (
    <input
      type="text"
      placeholder="Skriv ditt svar här:"
      className="w-full m-4 text-xs"
      value={text}
      onChange={handleTextChange}
    />
  );
};

export default FreeText;
