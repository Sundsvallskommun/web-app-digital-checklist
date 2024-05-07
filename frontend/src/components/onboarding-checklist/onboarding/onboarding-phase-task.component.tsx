import { Phase, Task, TaskChange } from '@interfaces/onboarding';
import { deleteTask, editTask } from '@services/onboarding-service';
import { Button, Checkbox, Divider, ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/react';
import { useRouter } from 'next/router';
import { ChangeEvent, Fragment, useContext, useEffect, useState } from 'react';
import style from 'src/components/onboarding-checklist/onboarding/onboarding-phase-task.module.scss';
import { ChecklistContext } from '../../../contexts/checklist-context';
import AddActivityBtn from '../add-activity/add-activity-btn.component';
import FreeText from './freeText.component';
import UlBullets from './ul-bullets.component';

interface OnboardingPhaseTaskProps {
  visibility: string;
  phaseTask: Task[];
  doneCallback: (bool: boolean) => void;
  isManager: boolean;
  currentPhase: Phase;
  setErrorMessage: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, taskUuid: string) => void;
  freeTextInput: Record<string, string>;
  setFreeTextInput: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function OnboardingPhaseTask({
  doneCallback,
  phaseTask,
  visibility,
  isManager,
  currentPhase,
  setErrorMessage,
  handleInputChange,
  freeTextInput,
  setFreeTextInput,
}: OnboardingPhaseTaskProps) {
  const [phaseSection, setPhaseSection] = useState<Task[]>(phaseTask);

  const { fetchOnboardingData, delegatedChecklists } = useContext(ChecklistContext);

  const router = useRouter();
  const currentPath = router.asPath;

  useEffect(() => {
    setPhaseSection(phaseTask);
  }, [phaseTask]);

  const handleCheckboxOnchange = async (
    index: number,
    property: 'completed' | 'notRelevant',
    value: boolean,
    task: Task
  ) => {
    const oppositeProperty = property === 'completed' ? 'notRelevant' : 'completed';

    let taskChange: TaskChange = {
      completed: task.completed,
      notRelevant: task.notRelevant,
      responseText: freeTextInput[task.uuid] || '',
    };

    if (value) {
      taskChange[property] = value;
      taskChange[oppositeProperty] = !value;
    } else {
      taskChange[property] = value;
    }

    await editTask(task.uuid, taskChange).then((r) => {
      if (!r.error) {
        console.log('Updated successfully', r, task.uuid, taskChange);
        fetchOnboardingData();
        setErrorMessage(null);
      } else {
        setErrorMessage('Ett fel uppstod när uppgiften uppdaterades.');
      }
    });

    setPhaseSection((listChoice) => {
      listChoice[index][property] = taskChange[property];
      listChoice[index][oppositeProperty] = taskChange[oppositeProperty];
      doneCallback(listChoice.every((obj: Task) => obj.completed || obj.notRelevant));
      return [...listChoice];
    });
  };

  const handleDeleteTask = async (uuid: string) => {
    try {
      const result = await deleteTask(uuid);
      if (!result.error) {
        console.log('Task deleted successfully', result);
        fetchOnboardingData();
        setErrorMessage(null);
      } else {
        setErrorMessage('Ett fel uppstod när uppgiften skulle tas bort.');
      }
    } catch (error) {
      console.log('Error deleting task:', error);
      setErrorMessage('Ett fel uppstod när uppgiften skulle tas bort.');
    }
  };

  const headers: ZebraTableHeader[] = [
    {
      element: <span role="presentation">Aktivitet</span>,
      isShown: false,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span role="presentation">Status</span>,
      isShown: false,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
  ];

  const headersCustomTasks: ZebraTableHeader[] = [
    {
      element: <span role="presentation">Extra Aktivitet (utöver standard checklista)</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span role="presentation">Status</span>,
      isShown: false,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
  ];

  const headersUnitTasks: ZebraTableHeader[] = [
    {
      element: <span role="presentation">Specifika aktiviteter för förvaltning/bolag</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span role="presentation">Status</span>,
      isShown: false,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
  ];

  const defaultTasks = phaseSection.filter((e) => e.taskType === 'DEFAULT');
  const customTasks = phaseSection.filter((e) => e.taskType === 'CUSTOM');
  const unitTasks = phaseSection.filter((e) => e.taskType === 'UNIT');

  const rows: ZebraTableColumn[][] =
    defaultTasks.map((task, index: number) => {
      return [
        {
          element: (
            <Fragment>
              <div className={task.notRelevant && !isManager ? 'hidden' : ''}>
                <span className="inline lg:hidden">Aktivitet</span>
                <h3 className="font-semibold text-base">
                  <UlBullets descriptionBulletsList={task.heading} uniqueId={task.uuid} type="task.heading" />
                </h3>
                {task.freeText ? (
                  <FreeText
                    initialText={task.responseText || freeTextInput[task.uuid]}
                    handleInputChange={(e) => handleInputChange(e, task.uuid)}
                    onTextChange={(text) => {
                      setFreeTextInput((prevState) => ({ ...prevState, [task.uuid]: text }));
                    }}
                  />
                ) : null}
                {task.text && <UlBullets descriptionBulletsList={task.text} uniqueId={task.uuid} type="task.text" />}
              </div>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Status</span>
              <div
                className={`${task.notRelevant && !isManager ? 'hidden' : 'mt-9 min-w-max'} ${
                  task.yesOrNo ? 'mr-[4.1rem]' : ''
                }`}
              >
                <Checkbox
                  aria-label={
                    task.yesOrNo
                      ? `Markera uppgiften med Ja ${task.heading}`
                      : `Markera uppgiften som slutförd ${task.heading}`
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleCheckboxOnchange(index, 'completed', e.target.checked, task)
                  }
                  value={task.yesOrNo ? `Ja-${task.completed}` : `Klart-${task.completed}`}
                  checked={task.completed}
                >
                  {task.yesOrNo ? 'Ja' : 'Klart'}
                </Checkbox>
                {task.yesOrNo ||
                ((isManager || delegatedChecklists.length > 0) && !currentPath.endsWith('/show-checklist')) ? (
                  <Checkbox
                    aria-label={
                      task.yesOrNo
                        ? `Markera uppgiften med Nej ${task.heading}`
                        : `Markera uppgiften som ej relevant ${task.heading}`
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleCheckboxOnchange(index, 'notRelevant', e.target.checked, task)
                    }
                    value={task.yesOrNo ? `Nej-${task.notRelevant}` : `Ej aktuellt-${task.notRelevant}`}
                    className={task.yesOrNo ? 'ml-[2.15rem]' : 'ml-4'}
                    checked={task.notRelevant}
                  >
                    {task.yesOrNo ? 'Nej' : 'Ej aktuellt'}
                  </Checkbox>
                ) : (
                  <span className="ml-36 pl-2"></span>
                )}
              </div>
            </Fragment>
          ),
          isShown: true,
        },
      ];
    }) || [];

  const rowsCustomTasks: ZebraTableColumn[][] =
    customTasks.map((task, index: number) => {
      return [
        {
          element: (
            <Fragment>
              <div className={task.notRelevant && !isManager ? 'hidden' : ''}>
                <span className="inline lg:hidden">Extra Aktivitet (utöver standard checklista)</span>
                <h4 className="font-semibold text-base">
                  <UlBullets descriptionBulletsList={task.heading} uniqueId={task.uuid} type="task.heading" />
                </h4>
                {task.text && <UlBullets descriptionBulletsList={task.text} uniqueId={task.uuid} type="task.text" />}
              </div>
              {task.freeText ? (
                <FreeText
                  initialText={task.responseText || freeTextInput[task.uuid]}
                  handleInputChange={(e) => handleInputChange(e, task.uuid)}
                  onTextChange={(text) => {
                    setFreeTextInput((prevState) => ({ ...prevState, [task.uuid]: text }));
                  }}
                />
              ) : null}
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <div
              className={`${task.notRelevant && !isManager ? 'hidden' : 'flex flex-col'} ${task.yesOrNo ? 'mr-8' : ''}`}
            >
              <span className="inline lg:hidden">Status</span>
              <div className="mt-9 mb-6 min-w-max">
                <Checkbox
                  aria-label={
                    task.yesOrNo
                      ? `Markera uppgiften med Ja ${task.heading}`
                      : `Markera uppgiften som slutförd ${task.heading}`
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleCheckboxOnchange(index, 'completed', e.target.checked, task)
                  }
                  value={task.yesOrNo ? `Ja-${task.completed}` : `Klart-${task.completed}`}
                  checked={task.completed}
                >
                  {task.yesOrNo ? 'Ja' : 'Klart'}
                </Checkbox>
                {task.yesOrNo ||
                ((isManager || delegatedChecklists.length > 0) && !currentPath.endsWith('/show-checklist')) ? (
                  <Checkbox
                    aria-label={
                      task.yesOrNo
                        ? `Markera uppgiften med Nej ${task.heading}`
                        : `Markera uppgiften som ej relevant ${task.heading}`
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleCheckboxOnchange(index, 'notRelevant', e.target.checked, task)
                    }
                    value={task.yesOrNo ? `Nej-${task.notRelevant}` : `Ej aktuellt-${task.notRelevant}`}
                    className={task.yesOrNo ? 'ml-[2.15rem]' : 'ml-4'}
                    checked={task.notRelevant}
                  >
                    {task.yesOrNo ? 'Nej' : 'Ej aktuellt'}
                  </Checkbox>
                ) : null}
              </div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                color="secondary"
                onClick={() => handleDeleteTask(task.uuid)}
                aria-label="Ta bort uppgift"
              >
                Ta bort
              </Button>
            </div>
          ),
          isShown: true,
        },
      ];
    }) || [];

  const rowsUnitTasks: ZebraTableColumn[][] =
    unitTasks.map((task, index: number) => {
      return [
        {
          element: (
            <Fragment>
              <div className={task.notRelevant && !isManager ? 'hidden' : ''}>
                <span className="inline lg:hidden">Specifika aktiviteter för bolag.</span>
                <h4 className=" font-semibold text-base">
                  <UlBullets descriptionBulletsList={task.heading} uniqueId={task.uuid} type="task.heading" />
                </h4>
                {task.text && <UlBullets descriptionBulletsList={task.text} uniqueId={task.uuid} type="task.text" />}
              </div>
              {task.freeText ? (
                <FreeText
                  initialText={task.responseText || freeTextInput[task.uuid]}
                  handleInputChange={(e) => handleInputChange(e, task.uuid)}
                  onTextChange={(text) => {
                    setFreeTextInput((prevState) => ({ ...prevState, [task.uuid]: text }));
                  }}
                />
              ) : null}
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <div
              className={`${task.notRelevant && !isManager ? 'hidden' : 'flex flex-col'} ${
                task.yesOrNo ? 'mr-[11rem]' : ''
              }`}
            >
              <span className="inline lg:hidden">Status</span>

              <div
                className={`${
                  task.yesOrNo
                    ? 'mt-9 mb-6 mr-[1.4rem]'
                    : (isManager || delegatedChecklists.length > 0) && !currentPath.endsWith('/show-checklist')
                    ? 'mt-9 mb-6 mr-[0rem] min-w-max'
                    : 'mt-9 mb-6 mr-[9.5rem]'
                }`}
              >
                <Checkbox
                  aria-label={
                    task.yesOrNo
                      ? `Markera uppgiften med Ja ${task.heading}`
                      : `Markera uppgiften som slutförd ${task.heading}`
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleCheckboxOnchange(index, 'completed', e.target.checked, task)
                  }
                  value={task.yesOrNo ? `Ja-${task.completed}` : `Klart-${task.completed}`}
                  checked={task.completed}
                >
                  {task.yesOrNo ? 'Ja' : 'Klart'}
                </Checkbox>

                {task.yesOrNo ||
                ((isManager || delegatedChecklists.length > 0) && !currentPath.endsWith('/show-checklist')) ? (
                  <Checkbox
                    aria-label={
                      task.yesOrNo
                        ? `Markera uppgiften med Nej ${task.heading}`
                        : `Markera uppgiften som ej relevant ${task.heading}`
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleCheckboxOnchange(index, 'notRelevant', e.target.checked, task)
                    }
                    value={task.yesOrNo ? `Nej-${task.notRelevant}` : `Ej aktuellt-${task.notRelevant}`}
                    className={task.yesOrNo ? 'ml-[2.15rem]' : 'ml-4'}
                    checked={task.notRelevant}
                  >
                    {task.yesOrNo ? 'Nej' : 'Ej aktuellt'}
                  </Checkbox>
                ) : null}
              </div>
            </div>
          ),
          isShown: true,
        },
      ];
    }) || [];

  return (
    <section className={style[visibility]}>
      <ZebraTable summary="Onboarding status table" headers={headers} rows={rows} pageSize={50} />
      {customTasks.length > 0 ? (
        <>
          <Divider className="mt-10" />
          <ZebraTable
            summary="Onboarding status table"
            headers={headersCustomTasks}
            rows={rowsCustomTasks}
            pageSize={50}
          />
        </>
      ) : (
        ''
      )}
      {unitTasks.length > 0 ? (
        <>
          <Divider className="mt-10" />
          <ZebraTable summary="Onboarding status table" headers={headersUnitTasks} rows={rowsUnitTasks} pageSize={50} />
        </>
      ) : (
        ''
      )}
      {(isManager || delegatedChecklists.length > 0) && !currentPath.endsWith('/show-checklist') ? (
        <AddActivityBtn currentPhase={currentPhase} />
      ) : (
        ''
      )}
    </section>
  );
}
