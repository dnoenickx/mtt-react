import { useSearchParams } from 'react-router-dom';

export function useEmbedded() {
  const [searchParams] = useSearchParams();
  return searchParams.has('embed');
}
