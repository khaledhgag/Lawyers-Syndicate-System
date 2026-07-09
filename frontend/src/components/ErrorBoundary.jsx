import { Component } from 'react';

/**
 * Top-level crash guard. Prevents a white screen on any render/effect error
 * and — crucially for debugging — logs the error together with the React
 * component stack, so the failing component is named even in production.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('🔴 App crashed:', error);
    // eslint-disable-next-line no-console
    console.error('🔴 Component stack:', info && info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'Cairo, sans-serif',
            color: '#0f2557',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>حدث خطأ غير متوقع</h1>
          <p style={{ color: '#64748b' }}>نعتذر عن الإزعاج. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#0f2557',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.65rem 1.5rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
