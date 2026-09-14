import React, { useState } from 'react';
import { 
  Database, Download, Upload, ShieldCheck, History, 
  CheckCircle2, AlertTriangle, RefreshCw, Layers, Copy, Check
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';

export const AuditAndBackupManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshData = () => {
    setDb(ctStorage.getDatabase());
  };

  const handleCreateBackup = () => {
    const backup = ctStorage.createLocalBackup();
    refreshData();
    setBackupNotice(`تم إنشاء نسخة احتياطية محلية فورية بنجاح (${backup.sizeBytes} بايت) وتم تدوين العملية بالسجل.`);
    setTimeout(() => setBackupNotice(null), 4500);
  };

  const handleDownloadBackupFile = () => {
    const json = ctStorage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connecttrans-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreJson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;
    const ok = ctStorage.restoreBackupJson(jsonInput);
    if (ok) {
      refreshData();
      setShowRestoreModal(false);
      setJsonInput('');
      setBackupNotice('تمت استعادة قاعدة البيانات بنجاح تام وتحديث كافة السجلات!');
    } else {
      setBackupNotice('خطأ: تنسيق ملف النسخة الاحتياطية غير متوافق');
    }
    setTimeout(() => setBackupNotice(null), 5000);
  };

  const handleCopyJson = () => {
    const json = ctStorage.exportBackupJson();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {backupNotice && (
        <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-2xl flex items-center gap-3 text-blue-300">
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-sm font-bold">{backupNotice}</span>
        </div>
      )}

      {/* Backup & Persistence Card */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>إدارة الحفظ الدائم والنسخ الاحتياطي (Backup & Restore)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              يتم حفظ كافة المعاملات والشركات والرحلات محلياً بشكل دائم، مع إمكانية التصدير والاسترجاع في أي وقت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreateBackup}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              <span>أخذ نسخة محلية الآن</span>
            </button>
            <button
              onClick={handleDownloadBackupFile}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>تحميل ملف JSON</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
            <button
              onClick={() => setShowRestoreModal(true)}
              className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>استعادة نسخة</span>
            </button>
          </div>
        </div>

        {/* System Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">المكاتب</span>
            <span className="text-base font-black text-amber-400 font-mono">{db.offices.length}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">الشركات</span>
            <span className="text-base font-black text-blue-400 font-mono">{db.companies.length}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">أصحاب السيارات</span>
            <span className="text-base font-black text-emerald-400 font-mono">{db.vehicleOwners.length}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">الطلبات</span>
            <span className="text-base font-black text-purple-400 font-mono">{db.requests.length}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">الرحلات</span>
            <span className="text-base font-black text-cyan-400 font-mono">{db.trips.length}</span>
          </div>
        </div>
      </div>

      {/* Audit Logs History Section */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>سجل العمليات والرقابة الكاملة (Audit Log)</span>
          </h3>
          <button onClick={refreshData} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">الوقت</th>
                <th className="py-3 px-3">المنفذ (Actor)</th>
                <th className="py-3 px-3">نوع الحدث</th>
                <th className="py-3 px-3">الكيان</th>
                <th className="py-3 px-3">التفاصيل والتغييرات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {db.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-white font-bold block">{log.actorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({log.actorRole})</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded font-mono text-[10px] font-bold border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{log.entity}</td>
                  <td className="py-3 px-3 text-slate-300">
                    {log.oldValue && <div className="text-[10px] text-rose-400 font-mono">قبل: {log.oldValue}</div>}
                    {log.newValue && <div className="text-[11px] text-emerald-400 font-bold">بعد: {log.newValue}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-white">استعادة قاعدة بيانات ConnectTrans من JSON</h4>
              <button onClick={() => setShowRestoreModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRestoreJson} className="space-y-3 text-xs">
              <p className="text-slate-400">الصق نص الـ JSON الخاص بالنسخة الاحتياطية هنا:</p>
              <textarea
                rows={8}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"version": 1, "companies": [...]}'
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono text-[11px] focus:outline-hidden focus:border-blue-400"
                required
              />

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  استعادة وتطبيق الآن
                </button>
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
