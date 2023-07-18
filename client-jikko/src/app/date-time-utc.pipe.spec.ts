import { DateTimeUtcPipe } from './date-time-utc.pipe';

describe('DateTimeUtcPipe', () => {
  it('create an instance', () => {
    const pipe = new DateTimeUtcPipe();
    expect(pipe).toBeTruthy();
  });
});
