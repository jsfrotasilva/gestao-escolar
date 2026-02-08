import { useRef, useState } from 'react';
import { Atribuicao } from '../types';

interface BackupRestoreProps {
  atribuicoes: Atribuicao[];
  onRestore: (data: Omit<Atribuicao, 'id'>[]) => void;
  onClose: () => void;
}

export function BackupRestore({ atribuicoes, onRestore, onClose }: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importedData, setImportedData] = useState<Omit<Atribuicao, 'id'>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'menu' | 'export' | 'import'>('menu');

  const handleExport = () => {
    const dataToExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      schoolName: 'Sistema de Gestão Escolar',
      totalRecords: atribuicoes.length,
      data: atribuicoes.map(({ id, ...rest }) => rest)
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-atribuicoes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccess('Backup exportado com sucesso! O arquivo foi baixado para seu computador.');
    setMode('export');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setImportedData(null);

    if (!file.name.endsWith('.json')) {
      setError('Por favor, selecione um arquivo JSON válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate the data structure
        if (!parsed.data || !Array.isArray(parsed.data)) {
          setError('Arquivo inválido: estrutura de dados não reconhecida.');
          return;
        }

        // Validate each record
        const validData = parsed.data.filter((item: any) => {
          return item.docente && item.turma && item.disciplina && typeof item.aulas === 'number';
        });

        if (validData.length === 0) {
          setError('Nenhum registro válido encontrado no arquivo.');
          return;
        }

        setImportedData(validData);
        setSuccess(`${validData.length} registro(s) encontrado(s) no backup.`);
      } catch (err) {
        setError('Erro ao ler o arquivo. Verifique se é um arquivo de backup válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmRestore = () => {
    if (importedData) {
      onRestore(importedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Backup e Restauração</h2>
                <p className="text-purple-100 text-sm">Compartilhe dados com colegas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'menu' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Escolha uma opção para gerenciar seus dados:
              </p>

              {/* Export Option */}
              <button
                onClick={handleExport}
                disabled={atribuicoes.length === 0}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                  atribuicoes.length === 0
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-green-200 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  atribuicoes.length === 0 ? 'bg-gray-200' : 'bg-green-100'
                }`}>
                  <svg className={`w-6 h-6 ${atribuicoes.length === 0 ? 'text-gray-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${atribuicoes.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                    Exportar Dados (Backup)
                  </h3>
                  <p className={`text-sm mt-1 ${atribuicoes.length === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                    {atribuicoes.length === 0
                      ? 'Nenhum dado para exportar'
                      : `Baixar arquivo com ${atribuicoes.length} registro(s) para compartilhar`
                    }
                  </p>
                </div>
                {atribuicoes.length > 0 && (
                  <svg className="w-5 h-5 text-green-500 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {/* Import Option */}
              <button
                onClick={() => setMode('import')}
                className="w-full p-5 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Importar Dados (Restaurar)</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Carregar arquivo de backup recebido de um colega
                  </p>
                </div>
                <svg className="w-5 h-5 text-blue-500 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Como compartilhar dados:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-amber-700">
                      <li>Exporte seus dados (baixa um arquivo .json)</li>
                      <li>Envie o arquivo por WhatsApp, email, etc.</li>
                      <li>Seu colega importa o arquivo recebido</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'export' && success && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Backup Concluído!</h3>
              <p className="text-gray-600 mb-6">{success}</p>
              <p className="text-sm text-gray-500 mb-6">
                Envie o arquivo baixado para seu colega por WhatsApp, email ou qualquer outro meio.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setMode('menu'); setSuccess(null); }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {mode === 'import' && (
            <div className="space-y-4">
              <button
                onClick={() => { setMode('menu'); setImportedData(null); setError(null); setSuccess(null); }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium">
                  Arraste o arquivo de backup aqui
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  ou clique para selecionar
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Aceita arquivo .json exportado do sistema
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message & Confirm */}
              {importedData && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-medium">{success}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-white p-2 rounded border border-green-200">
                            <span className="text-gray-500">Docentes:</span>
                            <span className="font-medium text-gray-800 ml-2">
                              {new Set(importedData.map(d => d.docente)).size}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <span className="text-gray-500">Turmas:</span>
                            <span className="font-medium text-gray-800 ml-2">
                              {new Set(importedData.map(d => d.turma)).size}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <span className="text-gray-500">Disciplinas:</span>
                            <span className="font-medium text-gray-800 ml-2">
                              {new Set(importedData.map(d => d.disciplina)).size}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <span className="text-gray-500">Total Aulas:</span>
                            <span className="font-medium text-gray-800 ml-2">
                              {importedData.reduce((acc, d) => acc + d.aulas, 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-amber-700 text-sm">
                      <strong>Atenção:</strong> Os dados atuais serão substituídos pelos dados do backup.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setImportedData(null); setSuccess(null); }}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmRestore}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Confirmar Importação
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
