import React, { useContext } from 'react';
import Hero from '../../public/images/Teamkänsla med kvinnor och män - original (571428) 1.png';
import Image from 'next/image';
import { Button } from '@sk-web-gui/react';
import { useAppContext } from '@contexts/app.context';
import { ChecklistContext } from '@contexts/checklist-context';
import NextLink from 'next/link';

export const EmailTemplate: React.FunctionComponent = () => {
  const { user } = useAppContext();
  const { asManagerChecklists } = useContext(ChecklistContext);

  return (
    <div className="w-[595px] h-[638px] bg-white  flex flex-col items-center m-auto">
      <Image src={Hero} alt="hero" className="w-full h-[225px]" />

      <h2 className="text-[24px] font-bold text-center text-sky-700 w-[340px] h-[80px] p-2 rounded-lg relative bg-white top-[-3.5%]">
        Du har en ny medarbetare som börjar snart
      </h2>
      <div className="w-[340px]">
        <p className="font-bold 14px]">Hej {user.givenName}</p>
        <p className="text-[14px] leading-[16px]">
          Den {asManagerChecklists[0]?.startsAt} börjar {asManagerChecklists[0]?.employee.firstName}{' '}
          {asManagerChecklists[0]?.employee.lastName} som ny medarbetare hos dig. Vi har därför skapat en digital och
          smidig checklista för introduktion som stöd för dig och {asManagerChecklists[0]?.employee.firstName}. Med
          hjälp av checklistan kan ni båda se att alla delar av introduktionen är genomförd.
        </p>
        <NextLink legacyBehavior={true} href={'https://checklista.sundsvall.se/show-checklist'} passHref>
          <Button
            color="primary"
            variant="outline"
            className="mt-6 w-full rounded-[56px]"
            aria-label="Lägg till en aktivitet"
          >
            Öppna checklistan
          </Button>
        </NextLink>
        <p className="mb-10 text-[14px] leading-[16px]">
          Det går även att hitta checklistan via intranätet under ”Mina verktyg”. Vid frågor kontakta din HR.
        </p>
      </div>
    </div>
  );
};

export default EmailTemplate;
