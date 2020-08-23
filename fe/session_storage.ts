export class SessionStorage {
  private static NAME = 'session';

  public save(session: string): void {
    localStorage.setItem(SessionStorage.NAME, session);
  }

  public read(): string|undefined {
    return localStorage.getItem(SessionStorage.NAME);
  }

  public clear(): void {
    localStorage.removeItem(SessionStorage.NAME);
  }
}
