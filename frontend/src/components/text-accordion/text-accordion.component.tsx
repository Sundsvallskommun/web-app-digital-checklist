import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { DefaultProps } from '@sk-web-gui/theme';
import { cx, __DEV__ } from '@sk-web-gui/utils';
import * as React from 'react';
import { useRef } from 'react';
interface ITextAccordionProps extends DefaultProps {
  initalOpen?: boolean;
  /* the element or component to use in place of `h2` */
  as?: React.ElementType;
  /* React node */
  children?: React.ReactNode;
}

export interface TextAccordionProps extends React.HTMLAttributes<HTMLDivElement>, ITextAccordionProps {}

export const TextAccordion = React.forwardRef<HTMLDivElement, TextAccordionProps>((props, ref) => {
  const { initalOpen, children, className, color, ...rest } = props;

  const [textAccordionOpen, setTextAccordionOpen] = React.useState(initalOpen ?? false);
  const contentEl = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const callback: MutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const newHeight = 'auto';
          if (typeof newHeight !== 'undefined' && contentEl.current) {
            contentEl.current.style.height = newHeight;
          }
        }
      }
    };
    const observer = new MutationObserver(callback);
    if (contentEl.current) {
      observer.observe(contentEl.current, config);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  const onClick = () => {
    if (contentEl.current) {
      contentEl.current.style.height = `${contentEl.current?.scrollHeight}px`;
    }
    setTimeout(() => {
      setTextAccordionOpen(!textAccordionOpen);
    }, 0);
  };

  return (
    <div
      data-color={color ? color : undefined}
      className={cx(textAccordionOpen ? `textAccordion-is-open w-fit` : 'w-fit', className)}
      {...rest}
    >
      <div
        className="textAccordion-bod"
        aria-hidden={!textAccordionOpen}
        ref={contentEl}
        style={textAccordionOpen ? { height: contentEl?.current?.scrollHeight } : { height: '0' }}
      >
        {children}
      </div>
      <button type="button" className="textAccordion-toggle" aria-expanded={textAccordionOpen} onClick={onClick}>
        {textAccordionOpen ? (
          <span className="italic decoration-2 underline-offset-2 text-base">
            Dölj information
            <KeyboardArrowUpIcon className="textAccordion-header-icon ml-2 text-base" />
          </span>
        ) : (
          <span className="italic decoration-2 underline-offset-2 text-base">
            Läs mer
            <KeyboardArrowDownIcon className="textAccordion-header-icon ml-2 text-base" />
          </span>
        )}
      </button>
    </div>
  );
});

if (__DEV__) {
  TextAccordion.displayName = 'TextAccordion';
}
