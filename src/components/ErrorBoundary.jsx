import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const isTranslateError = 
      error.message?.includes('removeChild') || 
      error.message?.includes('insertBefore') ||
      error.message?.includes('not a child of this node');

    if (isTranslateError) {
      console.warn('Google Translate conflict detected, recovering...', error);
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 100);
    } else {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && !this.state.error?.message?.includes('removeChild')) {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 m-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-yellow-900">Terjadi Kesalahan</h3>
          </div>
          <p className="text-sm text-yellow-800 mb-3">
            Komponen mengalami masalah.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
