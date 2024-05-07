import { TextAccordion } from '@components/text-accordion/text-accordion.component';
import React, { useState } from 'react';

interface Props {
  descriptionBulletsList: string;
  uniqueId: string;
  type: string;
}

export default function UlBullets({ descriptionBulletsList, uniqueId, type }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const addUnderlineToLinks = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach((link) => {
      link.classList.add('underline', 'text-blue-800');
      link.setAttribute('target', '_blank');
    });

    return doc.body.innerHTML;
  };

  const handleIsOpen = () => {
    setIsOpen((open) => !open);
  };

  if (type === 'task.text') {
    return (
      <div>
        {isOpen && (
          <div
            id={`accordion-content-${uniqueId}`}
            className="task-text"
            dangerouslySetInnerHTML={{
              __html: addUnderlineToLinks(descriptionBulletsList),
            }}
          />
        )}
        <TextAccordion onClick={handleIsOpen}></TextAccordion>
      </div>
    );
  } else if (type === 'task.responseText') {
    return (
      <div>
        <div
          id={`accordion-content-${uniqueId}`}
          className="task-text"
          dangerouslySetInnerHTML={{
            __html: addUnderlineToLinks(descriptionBulletsList),
          }}
        />
      </div>
    );
  } else {
    return (
      <div>
        <div
          id={`accordion-content-${uniqueId}`}
          className="task-text"
          dangerouslySetInnerHTML={{
            __html: addUnderlineToLinks(descriptionBulletsList),
          }}
        />
      </div>
    );
  }
}
