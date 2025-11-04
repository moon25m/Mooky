// getDatoCmsToken.ts

export const getDatoCmsToken = (): string => {
  // Guard for non-browser or early import
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  switch (hostname) {
    case 'ror.sumanthsamala.com':
    case 'sumanthsamala.com':
    case 'ror.localhost':
    case 'localhost':
      return process.env.REACT_APP_DATOCMS_ROR_TOKEN ?? '';

    case 'java.sumanthsamala.com':
    case 'java.localhost':
      return process.env.REACT_APP_DATOCMS_JAVA_TOKEN ?? '';

    case 'frontend.sumanthsamala.com':
    case 'frontend.localhost':
      return process.env.REACT_APP_DATOCMS_FRONTEND_TOKEN ?? '';

    case 'node.sumanthsamala.com':
    case 'node.localhost':
      return process.env.REACT_APP_DATOCMS_NODE_TOKEN ?? '';

    default:
      // Safe fallback to avoid crashing on unknown domains (e.g., Vercel preview/prod)
      // Supports a generic token if provided; otherwise empty string (queries may 401 but won't crash render)
      return process.env.REACT_APP_DATOCMS_DEFAULT_TOKEN ?? '';
  }
};
