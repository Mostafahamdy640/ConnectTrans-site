import React, { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class SafeAppBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ConnectTrans App Error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-cairo" dir="rtl">
          <div className="max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="text-4xl">🚚</div>
            <h1 className="text-xl font-black text-amber-400">ConnectTrans</h1>
            <p className="text-sm text-slate-300">
              حدث تنبيه أثناء تحميل أحد عناصر الواجهة، يمكنك إعادة التحميل الآن:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-rose-400 break-all text-left">
              {this.state.errorMessage}
            </div>
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl cursor-pointer"
            >
              إعادة تشغيل الصفحة الرئيسية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SafeAppBoundary>
      <App />
    </SafeAppBoundary>
  </React.StrictMode>,
);
