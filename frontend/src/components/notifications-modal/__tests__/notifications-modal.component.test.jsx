import NotificationsModal from '../notifications-modal.component'
import { render, screen, act, waitFor, within } from '@testing-library/react'
import { AppWrapper } from '@contexts/app.context';
// const axios = require('axios');
// jest.mock('axios');

const handledMockCase = {
    externalCaseId: 'externalCaseId',
    caseId: 'id',
    subject: {
      caseType: 'caseType',
      meta: {
        created: 'firstSubmitted',
        modified: 'lastStatusChange',
      },
    },
    department: '--',
    validFrom: '--',
    validTo: '--',
    serviceDate: '--', 
    status: { code: 2, color: 'info', label: 'Kompletterad' },
    lastStatusChange: 'lastStatusChange',
}

describe('NotificationsModal', () => {
    beforeEach(async () => {
        // jest.spyOn(console, 'error').mockImplementation(() => {}); // Remove act() error, because this test is not checking for data renders
        render( 
            <AppWrapper>
                <NotificationsModal
                    isOpen={true}
                    closeModal={() => {}}
                    notificationAlerts={[handledMockCase]} />
            </AppWrapper>
        )
    });

    it('renders NotificationsModal and checks for data', async () => {
        await waitFor(()=>screen.getAllByRole('button'));
        const row = screen.getAllByRole('button').find(
            (row) => within(row).queryByText(/Kompletterad/) !== null);
          expect(row).toBeTruthy();
    })
})