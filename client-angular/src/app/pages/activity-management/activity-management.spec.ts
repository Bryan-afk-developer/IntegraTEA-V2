import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityManagement } from './activity-management';

describe('ActivityManagement', () => {
  let component: ActivityManagement;
  let fixture: ComponentFixture<ActivityManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
