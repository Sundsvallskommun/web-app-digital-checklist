import NotificationComponent from '../notification.component'
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

describe('NotificationComponent', () => {
    beforeEach(async () => {
        // jest.spyOn(console, 'error').mockImplementation(() => {}); // Remove act() error, because this test is not checking for data renders
        render( 
            <AppWrapper>
                <NotificationComponent item={handledMockCase} type={'info'}  />
            </AppWrapper>
        )
    });

    it('renders NotificationComponent and checks for data', async () => {
        const item = screen.getByText(/Kompletterad/)
        expect(item).toBeTruthy()
    })
})