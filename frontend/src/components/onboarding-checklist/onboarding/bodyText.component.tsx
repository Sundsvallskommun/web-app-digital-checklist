import React from 'react';

interface Props {
  descriptionBodyText: string;
  id: number;
}

export default function BodyText({ descriptionBodyText, id }: Props) {
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

  return (
    <p
      aria-label={`Brödtext ${descriptionBodyText}`}
      id={`accordion-content-${id}`}
      className="ml-6 task-text"
      dangerouslySetInnerHTML={{
        __html: addUnderlineToLinks(descriptionBodyText),
      }}
    ></p>
  );
}
