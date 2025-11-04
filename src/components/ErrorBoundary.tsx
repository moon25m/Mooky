import React from 'react';

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error } as State;
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'grid', placeItems: 'center',
          background: 'black', color: 'white', padding: 24, textAlign: 'center'
        }}>
          <div>
            <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ opacity: 0.8 }}>The page failed to render. Please refresh, or try again later.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
