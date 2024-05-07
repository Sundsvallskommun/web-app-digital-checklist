import { Phase } from '@interfaces/onboarding';

export function getManagerPhaseStatus(phases: Phase[]): { managerPhase: Phase | undefined; isInPhase: string } {
  const managerPhases = phases.filter(
    (phase) => phase.stakeholder === 'MANAGER' || phase.stakeholder === 'HAS_NEW_MANAGER'
  );

  const managerPhaseWithIncompleteTask = managerPhases.find((phase) => {
    const hasIncompleteTask = phase.tasks.some((task) => !task.completed && !task.notRelevant);

    return hasIncompleteTask;
  });

  const managerPhase = managerPhaseWithIncompleteTask || managerPhases[managerPhases.length - 1];

  const allTasksDoneOrNotRelevant = managerPhase
    ? managerPhase.tasks.every((task) => task.completed || task.notRelevant)
    : false;

  const isInPhase =
    managerPhase && (allTasksDoneOrNotRelevant || new Date(managerPhase.dueDate) >= new Date()) ? 'I fas' : 'Försenad';

  return { managerPhase, isInPhase };
}
