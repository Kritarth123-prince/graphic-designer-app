import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Render error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-6 py-16 text-center font-sans">
          <h1 className="text-2xl mb-2">Something went wrong.</h1>
          <p className="text-neutral-600">
            Please refresh the page. If this keeps happening, check the browser console for details.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
