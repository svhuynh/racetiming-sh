import { TestBed, inject } from '@angular/core/testing';

import { PasscodeService } from './passcode.service';

describe('PasscodeService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PasscodeService]
        });
    });

    it('should be created', inject([PasscodeService], (service: PasscodeService) => {
        expect(service).toBeTruthy();
    }));
});
