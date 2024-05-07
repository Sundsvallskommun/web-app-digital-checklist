import { Phase, Task } from '@interfaces/onboarding';
import { bulkUpdateTasks } from '@services/onboarding-service';
import { CheckCircleIcon, Checkbox, Divider, ExclamationIcon, useMessage } from '@sk-web-gui/react';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ChecklistContext } from '../../../contexts/checklist-context';
import BodyText from './bodyText.component';
import OnboardingPhaseTask from './onboarding-phase-task.component';

interface OnboardingPhasesProps {
  radioValue: string;
  phases: Phase[];
  isManager: boolean;
}

export default function OnboardingPhases({ radioValue, phases, isManager }: OnboardingPhasesProps) {
  const [phasesDoneMap, setPhasesDoneMap] = useState<boolean[]>(phases.map(() => false));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [freeTextInput, setFreeTextInput] = useState({});

  const router = useRouter();
  const currentPath = router.asPath;

  const { fetchOnboardingData, delegatedChecklists } = useContext(ChecklistContext);

  useEffect(() => {
    setPhasesDoneMap(phases.map((phase) => phase.tasks.every((task) => task.completed || task.notRelevant)));
  }, [phases]);

  const message = useMessage();

  const handleMessage = useCallback(
    (status?: any) => {
      message({
        message: errorMessage,
        status: status,
        position: 'bottom-right',
      });
    },
    [message, errorMessage]
  );

  useEffect(() => {
    if (errorMessage) {
      handleMessage('error');
    }
  }, [errorMessage, handleMessage]);

  const handleCallback =
    (index: number): ((bool: boolean) => void) =>
    (bool: boolean) => {
      setPhasesDoneMap((prevMap) => {
        const updatedMap = [...prevMap];
        updatedMap[index] = bool;
        return updatedMap;
      });
    };

  const getVisibility = (index: number) => {
    const firstDonePhaseIndex = phasesDoneMap.lastIndexOf(true);
    if (index === 0 || ((isManager || delegatedChecklists.length > 0) && !currentPath.endsWith('/show-checklist'))) {
      return 'onboardingVisibilityVisible';
    } else {
      const prevPhaseTasks = phases[index]?.tasks || [];
      const prevPhaseTasksDone = prevPhaseTasks.every((task) => task.completed || task.notRelevant);

      if (phasesDoneMap[index - 1] && prevPhaseTasksDone) {
        return 'onboardingVisibilityVisible';
      } else if (firstDonePhaseIndex + 2 === index) {
        return 'onboardingVisibilityFaded';
      } else if (firstDonePhaseIndex + 3 <= index) {
        return 'onboardingVisibilityHidden';
      }
    }
  };

  const filteredPhases = phases.filter((tasks) =>
    radioValue === 'Chef'
      ? tasks.stakeholder === 'MANAGER' || tasks.stakeholder === 'HAS_NEW_MANAGER'
      : tasks.stakeholder === 'EMPLOYEE' || tasks.stakeholder === 'IS_NEW_MANAGER'
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, taskUuid: string) => {
    setFreeTextInput((prevState) => ({ ...prevState, [taskUuid]: e.target.value }));
  };

  const handleTasksBulkUpdate = (isChecked: boolean, phase: Phase, index: number) => {
    const updatedTasks = phase.tasks
      .filter((task) => isManager || delegatedChecklists.length > 0 || !task.notRelevant)
      .map((task) => ({
        uuid: task.uuid,
        completed: isChecked,
        notRelevant: isChecked ? false : task.notRelevant,
        responseText: freeTextInput[task.uuid] !== undefined ? freeTextInput[task.uuid] : task.responseText,
      }));

    bulkUpdateTasks({ data: updatedTasks })
      .then((res) => {
        if (!res.error) {
          console.log('Tasks updated successfully', res.data, updatedTasks);
          setPhasesDoneMap((prevMap) => {
            const updatedMap = [...prevMap];
            updatedMap[index] = isChecked;
            fetchOnboardingData();
            setErrorMessage(null);

            return updatedMap;
          });
        } else {
          console.log('Error updating tasks', res.data);
          setErrorMessage('Ett fel uppstod när uppgifterna uppdaterades.');
        }
      })
      .catch((e) => {
        console.log('Error updating tasks', e);
        setErrorMessage('Ett fel uppstod när uppgifterna uppdaterades.');
      });
    setFreeTextInput({});
  };

  const getCheckedCheckboxesCount = (tasks: Task[]) => {
    return tasks.filter((task) => task.completed || task.notRelevant).length;
  };

  return (
    <section>
      {filteredPhases.map((phase, index) => {
        const checkedCount = getCheckedCheckboxesCount(phase.tasks);
        const totalCount = phase.tasks.length;

        return (
          <section key={`${phase.name}`}>
            <header
              role="region"
              aria-label={`${phase.name} - Klart senast ${phase.dueDate}`}
              className={`mt-10 flex justify-between ${
                getVisibility(index) === 'onboardingVisibilityHidden' ? 'hidden' : ''
              }`}
            >
              <div>
                <h2>{phase.name}</h2>
                {phase.bodyText ? <BodyText descriptionBodyText={phase.bodyText} id={phase.id} /> : ''}
              </div>
              <div className="mb-4 ml-40 min-w-fit self-end">
                <p>Klart senast {phase.dueDate}</p>
                {!isManager && phase.tasks.every((task) => task.notRelevant) ? (
                  <p className="text-gray-500">Aktiviteter ej relevanta.</p>
                ) : (
                  <>
                    <Checkbox
                      aria-label={`Markera alla klart för ${phase.name}`}
                      checked={
                        phase.tasks.every((task) => task.completed) ||
                        (!isManager && phase.tasks.every((task) => task.completed || task.notRelevant))
                      }
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleTasksBulkUpdate(event.target.checked, phase, index)
                      }
                    >
                      Markera alla klart
                    </Checkbox>
                    <br />
                    <p className="mt-10 mb-0">
                      Status: {checkedCount} av {totalCount}
                      {checkedCount === totalCount ? (
                        <CheckCircleIcon className="text-green-500 w-10 inline align-bottom ml-3" label={''} />
                      ) : (
                        <ExclamationIcon className="text-red-500 w-9 inline align-bottom ml-3" label={''} />
                      )}
                    </p>
                  </>
                )}
              </div>
            </header>
            <Divider className={`mb-8 ${getVisibility(index) === 'onboardingVisibilityHidden' ? 'hidden' : ''}`} />
            <OnboardingPhaseTask
              visibility={getVisibility(index)}
              phaseTask={phase.tasks}
              doneCallback={handleCallback(index)}
              isManager={isManager}
              currentPhase={phase}
              setErrorMessage={setErrorMessage}
              handleInputChange={handleInputChange}
              freeTextInput={freeTextInput}
              setFreeTextInput={setFreeTextInput}
            />
          </section>
        );
      })}
    </section>
  );
}
