import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-6 bg-slate-950 text-slate-100 text-center z-50">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/10">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-2">
            Map Rendering Temporarily Recovered
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
            {this.props.fallbackMessage ||
              'A geographic rendering error occurred while updating the region data. Click below to reset to default view.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Reset to Default View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
