import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpfsComponent } from './ipfs.component';

describe('IpfsComponent', () => {
  let component: IpfsComponent;
  let fixture: ComponentFixture<IpfsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpfsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
