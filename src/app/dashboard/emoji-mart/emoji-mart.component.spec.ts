import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiMartComponent } from './emoji-mart.component';

describe('EmojiMartComponent', () => {
  let component: EmojiMartComponent;
  let fixture: ComponentFixture<EmojiMartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiMartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmojiMartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
