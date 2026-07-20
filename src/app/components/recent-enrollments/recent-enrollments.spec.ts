import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentEnrollments } from './recent-enrollments';

describe('RecentEnrollments', () => {
  let component: RecentEnrollments;
  let fixture: ComponentFixture<RecentEnrollments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentEnrollments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentEnrollments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
