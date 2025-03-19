import { useNavigate } from 'react-router-dom';

const useNavigateBack = () => {
  const navigate = useNavigate();

  return (fallback = '/') => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
};

export default useNavigateBack;
