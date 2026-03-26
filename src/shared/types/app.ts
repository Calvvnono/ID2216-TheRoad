export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface HomeViewState {
  title: string;
  subtitle: string;
  status: AsyncStatus;
}
