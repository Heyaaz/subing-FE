export const POST_LOGIN_REDIRECT_KEY = 'subing_post_login_redirect';
export const PENDING_PREFERENCE_ANSWERS_KEY = 'subing_pending_preference_answers';

export const setPostLoginRedirect = (path) => {
  if (path) {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
  }
};

export const consumePostLoginRedirect = () => {
  const path = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);

  if (path) {
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }

  return path;
};

export const peekPostLoginRedirect = () => sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);

export const savePendingPreferenceAnswers = (answers) => {
  sessionStorage.setItem(PENDING_PREFERENCE_ANSWERS_KEY, JSON.stringify(answers));
};

export const getPendingPreferenceAnswers = () => {
  const raw = sessionStorage.getItem(PENDING_PREFERENCE_ANSWERS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    sessionStorage.removeItem(PENDING_PREFERENCE_ANSWERS_KEY);
    return [];
  }
};

export const clearPendingPreferenceAnswers = () => {
  sessionStorage.removeItem(PENDING_PREFERENCE_ANSWERS_KEY);
};
