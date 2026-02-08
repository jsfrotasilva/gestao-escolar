export interface Atribuicao {
  id: string;
  docente: string;
  turma: string;
  disciplina: string;
  aulas: number;
}

export interface DocenteResumo {
  nome: string;
  totalAulas: number;
  disciplinas: string[];
  turmas: string[];
}

export interface DisciplinaResumo {
  nome: string;
  totalAulas: number;
  docentes: string[];
}

export interface TurmaResumo {
  nome: string;
  totalAulas: number;
  docentes: string[];
  disciplinas: string[];
}

// Tipos para o Gerador de Horário
export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta';

export interface HorarioAula {
  numero: number;
  inicio: string;
  fim: string;
}

export interface ConfiguracaoHorario {
  diasSemana: DiaSemana[];
  horarios: HorarioAula[];
  maxAulasPorDisciplinaPorDia: number;
}

export interface Bloqueio {
  id: string;
  tipo: 'geral' | 'docente' | 'turma';
  entidade: string; // nome do docente ou turma (vazio para 'geral')
  dia: DiaSemana;
  aulas: number[]; // números das aulas bloqueadas
  motivo?: string;
}

export interface AulaHorario {
  turma: string;
  disciplina: string;
  docente: string;
}

export interface SlotHorario {
  dia: DiaSemana;
  aula: number;
  conteudo: AulaHorario | null;
  bloqueado: boolean;
  motivoBloqueio?: string;
}

export interface GradeHorario {
  turma: string;
  slots: SlotHorario[];
}

export interface HorarioDocente {
  docente: string;
  slots: (SlotHorario & { turma: string })[];
}

// Tipos para análise de conflitos
export interface ConflitoDetalhado {
  id: string;
  docente: string;
  turma: string;
  disciplina: string;
  aulasNecessarias: number;
  aulasAlocadas: number;
  aulasFaltando: number;
  motivos: string[];
  sugestoes: string[];
}

export interface AnaliseConflitos {
  conflitos: ConflitoDetalhado[];
  totalConflitos: number;
  aulasNaoAlocadas: number;
}

export interface SugestaoTroca {
  id: string;
  conflito: ConflitoDetalhado;
  // Aula que será trocada (vai liberar espaço)
  aulaOrigem: {
    turma: string;
    dia: DiaSemana;
    aula: number;
    docente: string;
    disciplina: string;
  };
  // Para onde a aula vai
  aulaDestino: {
    turma: string;
    dia: DiaSemana;
    aula: number;
  };
  // Benefício da troca
  beneficio: string;
}

// Tipos para Área de Conhecimento
export interface AreaConhecimento {
  id: string;
  nome: string;
  cor: string; // cor para identificação visual
  docentes: string[]; // lista de nomes de docentes vinculados
}

export interface BloqueioArea {
  id: string;
  areaId: string;
  dia: DiaSemana;
  aulas: number[]; // números das aulas bloqueadas
  motivo?: string;
}
