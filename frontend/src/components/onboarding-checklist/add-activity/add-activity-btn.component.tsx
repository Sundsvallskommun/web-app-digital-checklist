import { Button, Input } from '@sk-web-gui/react';
import { useContext, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { ChecklistContext } from '../../../contexts/checklist-context';
import { createCustomTask } from '@services/onboarding-service';
import { CustomTask, Phase } from '@interfaces/onboarding';

interface AddActivityBtnProps {
  currentPhase: Phase;
}

export default function AddActivityBtn({ currentPhase }: AddActivityBtnProps) {
  const [showAddActivityBtn, setShowAddActivity] = useState(true);
  const [activityDescriptionTitle, setActivityDescriptionTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');

  const { fetchOnboardingData, employeeId } = useContext(ChecklistContext);

  function generateUniqueId() {
    return Math.random().toString(36).slice(2, 11);
  }

  const uniqueId = generateUniqueId();

  const handleIsOpen = () => {
    setShowAddActivity((open) => !open);
  };

  const handleInputChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (name === 'title') {
      setActivityDescriptionTitle(value);
    }
    if (name === 'description') {
      setActivityDescription(value);
    }
  };

  const addActivity = () => {
    if (activityDescriptionTitle === '') {
      return;
    }

    let customTask: CustomTask = {
      heading: activityDescriptionTitle,
      text: activityDescription === '' ? '' : activityDescription,
      checklistId: employeeId,
      phaseId: currentPhase.id,
    };

    createCustomTask(customTask).then((r) => {
      if (!r.error) {
        console.log('Updated successfully', r, customTask);
        fetchOnboardingData();
      } else {
        console.log('Error');
      }
    });

    setActivityDescriptionTitle('');
    setActivityDescription('');
  };

  return (
    <section className="mb-20">
      {showAddActivityBtn ? (
        <Button
          color="primary"
          variant="solid"
          className="mt-8"
          onClick={handleIsOpen}
          aria-label="Lägg till en aktivitet"
        >
          <AddIcon className="text-xl mr-4 -ml-4" />
          Lägg till en aktivitet
        </Button>
      ) : (
        <>
          <p className="font-semibold">Aktivitet</p>
          <div className="flex">
            <Input
              id={`activity-description-title-${uniqueId}`}
              aria-label="Beskrivning"
              placeholder="Beskrivning"
              className="border-[#005595] border-2 mr-4"
              onChange={handleInputChange}
              name="title"
              value={activityDescriptionTitle}
            />
            <Input
              id={`activity-description-${uniqueId}`}
              aria-label="Brödtext/Länk"
              placeholder="Brödtext/Länk"
              className="border-[#005595] border-2"
              onChange={handleInputChange}
              name="description"
              value={activityDescription}
            />
            <Button
              color="primary"
              variant="solid"
              className="ml-32 w-64"
              onClick={() => {
                handleIsOpen();
                addActivity();
              }}
              aria-label="Spara aktivitet"
            >
              <CheckIcon className="text-xl mr-3" />
              Spara
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
